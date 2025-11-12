/* eslint-env worker */

const ctx = /** @type {DedicatedWorkerGlobalScope} */ (self);

let pyodideReadyPromise;

async function getPyodide(options = {}) {
  if (!pyodideReadyPromise) {
    const { loadPyodide } = ctx;
    if (typeof loadPyodide !== "function") {
      throw new Error("Pyodide loader is not available in this worker");
    }
    pyodideReadyPromise = loadPyodide(options);
  }
  return pyodideReadyPromise;
}

async function mirrorFilesystem(manifest = {}, { loadPackages = true } = {}) {
  const pyodide = await getPyodide(manifest.pyodide ?? {});
  const { files = [], packages = [] } = manifest;

  if (loadPackages && Array.isArray(packages) && packages.length > 0) {
    await pyodide.loadPackage(packages);
  }

  if (Array.isArray(files)) {
    for (const file of files) {
      const path = file?.path;
      if (!path) continue;
      ensureDirectory(pyodide, path);
      const options = {};
      if (file.binary) {
        const buffer = file.content instanceof Uint8Array ? file.content : new Uint8Array(file.content ?? []);
        pyodide.FS.writeFile(path, buffer, { canOwn: true });
      } else {
        const text = typeof file.content === "string" ? file.content : "";
        pyodide.FS.writeFile(path, text, options);
      }
    }
  }

  await probeImports(pyodide);

  return { ok: true };
}

function ensureDirectory(pyodide, path) {
  const parts = path.split("/");
  if (parts.length <= 1) return;
  parts.pop();
  let current = "";
  for (const part of parts) {
    if (!part) continue;
    current = `${current}/${part}`.replace(/\/+/g, "/");
    try {
      pyodide.FS.mkdir(current);
    } catch (error) {
      if (error?.errno !== 17) {
        // 17 === EEXIST
        throw error;
      }
    }
  }
}

async function runUserCode(payload = {}) {
  const pyodide = await getPyodide(payload.pyodide ?? {});
  const { code = "", globals = {} } = payload;
  const namespace = pyodide.toPy(globals);
  try {
    const result = await pyodide.runPythonAsync(code, { globals: namespace });
    return { result };
  } finally {
    namespace.destroy?.();
  }
}

async function probeImports(pyodide) {
  const script = [
    "import importlib, json",
    "required = [",
    '    "engines.web_adapter",',
    '    "engines.engine_mk1",',
    '    "engines.engine_mk2",',
    '    "modules.validation",',
    '    "modules.unique_events",',
    '    "modules.friction_model",',
    '    "modules.calendar_provider",',
    '    "rigs.simple_rig",',
    '    "rigs.workforce_rig",',
    "]",
    "missing = [m for m in required if importlib.util.find_spec(m) is None]",
    'print(json.dumps({"missing": missing}))',
  ].join("\n");

  const result = await pyodide.runPythonAsync(script);
  const parsed = JSON.parse(typeof result === "string" ? result : String(result ?? ""));
  const missing = Array.isArray(parsed?.missing) ? parsed.missing : [];
  if (missing.length > 0) {
    throw {
      stage: "import-probe",
      type: "MissingModules",
      missing,
      hint: "Check PY_MANIFEST",
    };
  }
  return parsed;
}

ctx.onmessage = async (event) => {
  const { id, type, payload } = event.data ?? {};
  try {
    switch (type) {
      case "mirror": {
        const data = await mirrorFilesystem(payload?.manifest ?? payload ?? {});
        ctx.postMessage({ id, type: "mirror:done", data });
        break;
      }
      case "run": {
        const data = await runUserCode(payload);
        ctx.postMessage({ id, type: "run:done", data });
        break;
      }
      default: {
        throw new Error(`Unknown message type: ${type}`);
      }
    }
  } catch (error) {
    ctx.postMessage({ id, type: "error", error: serializeError(error) });
  }
};

function serializeError(error) {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }
  const serialised = { ...error };
  if (error.message && !serialised.message) {
    serialised.message = error.message;
  }
  if (error.stack && !serialised.stack) {
    serialised.stack = error.stack;
  }
  return serialised;
}
