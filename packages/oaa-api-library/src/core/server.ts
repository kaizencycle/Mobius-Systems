// oaa/server.ts
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { plan, act } from "./hub";
import { sentinelRouter } from "../routes/sentinel";
import { CFG } from "../config";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "OAA-API-Library",
    time: new Date().toISOString(),
  });
});

app.post("/oaa/plan", async (req, res) => {
  const p = await plan(req.body);
  res.json({ ok: true, plan: p });
});

app.post("/oaa/act", async (req, res) => {
  const out = await act(req.body);
  res.json(out);
});

app.use("/sentinel", sentinelRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message ?? "internal error" });
});

const port = parseInt(CFG.PORT, 10);
app.listen(port, () => console.log(`[OAA Hub] listening on :${port}`));

