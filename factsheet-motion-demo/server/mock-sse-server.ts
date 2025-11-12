import { createServer } from "node:http";

const PORT = Number(process.env.SSE_PORT ?? 7070);

const metrics = [
  { assetId: "solaris-growth", metricId: "returnYtd", base: 12.4, variance: 0.4 },
  { assetId: "solaris-growth", metricId: "aum", base: 4.6, variance: 0.05 },
  { assetId: "aurora-credit", metricId: "returnYtd", base: 6.1, variance: 0.25 },
  { assetId: "aurora-credit", metricId: "esgScore", base: 88, variance: 0.4 },
  { assetId: "lumen-innovation", metricId: "returnYtd", base: 18.9, variance: 0.6 },
  { assetId: "lumen-innovation", metricId: "aum", base: 2.1, variance: 0.08 }
];

const pickMetric = () => metrics[Math.floor(Math.random() * metrics.length)];

const server = createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400).end();
    return;
  }

  if (req.url.startsWith("/api/metrics-stream")) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });

    const interval = setInterval(() => {
      const metric = pickMetric();
      const value = metric.base + (Math.random() - 0.5) * metric.variance;
      const payload = {
        assetId: metric.assetId,
        metricId: metric.metricId,
        value: Number(value.toFixed(metric.metricId === "esgScore" ? 0 : 2)),
        delta: Number(((Math.random() - 0.5) * metric.variance * 2).toFixed(2)),
        timestamp: new Date().toISOString()
      };

      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }, 3500);

    req.on("close", () => {
      clearInterval(interval);
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Mock SSE server ready on http://localhost:${PORT}`);
});
