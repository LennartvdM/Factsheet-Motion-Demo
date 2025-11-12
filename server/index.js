import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createMockStream } from './mock-data.js';

const app = express();
const PORT = Number(process.env.PORT ?? 5174);
const VITE_PORT = Number(process.env.VITE_PORT ?? 5173);
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({ origin: true }));

const mockStream = createMockStream(4242);
let currentFacts = mockStream.getInitial();

app.get('/facts', (_req, res) => {
  res.json(currentFacts);
});

app.get('/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`data: ${JSON.stringify(currentFacts)}\n\n`);

  let active = true;
  let timer;

  const scheduleNext = () => {
    if (!active) {
      return;
    }

    const delay = 3000 + Math.random() * 2000;
    timer = setTimeout(() => {
      if (!active || res.writableEnded) {
        return;
      }

      currentFacts = mockStream.next();
      try {
        res.write(`data: ${JSON.stringify(currentFacts)}\n\n`);
      } catch (error) {
        console.warn('[server] Failed to write SSE update', error);
        handleDisconnect('write failed', error);
        return;
      }
      scheduleNext();
    }, delay);
  };

  scheduleNext();

  const handleDisconnect = (reason, error) => {
    if (!active) {
      return;
    }

    active = false;
    clearTimeout(timer);

    if (error) {
      console.warn(`[server] SSE connection closed (${reason})`, error);
    } else {
      console.warn(`[server] SSE connection closed (${reason})`);
    }

    if (!res.writableEnded) {
      try {
        res.end();
      } catch (endError) {
        console.warn('[server] Failed to terminate SSE response', endError);
      }
    }
  };

  req.on('close', () => handleDisconnect('client closed'));
  req.on('aborted', () => handleDisconnect('client aborted'));
  req.on('error', (error) => handleDisconnect('request error', error));
  res.on('error', (error) => handleDisconnect('response error', error));
});

if (isProduction) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distDir = path.resolve(__dirname, '../dist');

  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.send(
      `<html><body style="font-family: sans-serif"><h1>Factsheet SSE server</h1><p>Proxy requests from Vite dev server (localhost:${VITE_PORT}) to <code>/sse</code> to stream live data.</p></body></html>`
    );
  });
}

app.listen(PORT, () => {
  console.log(`Factsheet server listening on http://localhost:${PORT}`);
});
