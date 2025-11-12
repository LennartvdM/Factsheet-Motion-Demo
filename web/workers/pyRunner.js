// PY_MANIFEST must include every Python module that the engines import so
// that they are available when Pyodide loads them at runtime; missing entries
// will cause import errors.
export const PY_MANIFEST = [
  "engines/__init__.py",
  "engines/web_adapter.py",
  "engines/engine_mk1.py",
  "engines/engine_mk2.py",
  "models.py",
  "unique_days.py",
  "yearly_budget.py",
  "modules/__init__.py",
  "modules/calendar_provider.py",
  "modules/friction_model.py",
  "modules/unique_events.py",
  "modules/validation.py",
  "rigs/__init__.py",
  "rigs/calendar_rig.py",
  "rigs/simple_rig.py",
  "rigs/workforce_rig.py"
];
