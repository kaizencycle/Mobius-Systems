import { Router, Request, Response, NextFunction } from "express";
import { fetchDoc } from "../sentinel/fetcher";
import { verifySources } from "../sentinel/verify";
import { classifyTopic } from "../sentinel/classify";
import { scoreImpact } from "../sentinel/impact";
import { postAttestation } from "../sentinel/attest";

type VerifyBody = {
  items: { url: string }[];
  summaryHint?: string;
};

type FetchBody = {
  url: string;
};

type AttestBody = VerifyBody;

const handle =
  (fn: (req: Request, res: Response) => Promise<void> | void) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

export const sentinelRouter = Router();

sentinelRouter.post(
  "/fetch",
  handle(async (req: Request, res: Response) => {
    const body = req.body as FetchBody;
    if (!body?.url) {
      res.status(400).json({ error: "url required" });
      return;
    }
    const doc = await fetchDoc(body.url);
    res.json(doc);
  }),
);

sentinelRouter.post(
  "/verify-alert",
  handle(async (req: Request, res: Response) => {
    const body = req.body as VerifyBody;
    if (!body?.items?.length) {
      res.status(400).json({ error: "items required" });
      return;
    }

    const result = await verifySources({
      items: body.items,
      summaryHint: body.summaryHint,
    });

    const topic = classifyTopic(result.mergedText);
    const impact = scoreImpact({
      domains: result.domains,
      text: result.mergedText,
    });

    res.json({
      topic,
      impact,
      verified: result.ok,
      sources: result.docs.map((doc) => ({
        url: doc.url,
        domain: doc.domain,
        sha256: doc.sha256,
      })),
      summary: body.summaryHint ?? "",
      created_at: new Date().toISOString(),
    });
  }),
);

sentinelRouter.post(
  "/attest",
  handle(async (req: Request, res: Response) => {
    const body = req.body as AttestBody;
    if (!body?.items?.length) {
      res.status(400).json({ error: "items required" });
      return;
    }
    const result = await verifySources({
      items: body.items,
      summaryHint: body.summaryHint,
    });

    const topic = classifyTopic(result.mergedText);
    const impact = scoreImpact({
      domains: result.domains,
      text: result.mergedText,
    });

    const alert = {
      topic,
      impact,
      verified: result.ok,
      sources: result.docs.map((doc) => ({
        url: doc.url,
        domain: doc.domain,
        sha256: doc.sha256,
      })),
      summary: body.summaryHint ?? "",
      created_at: new Date().toISOString(),
    };

    if (!result.ok || impact === "low") {
      res
        .status(202)
        .json({ note: "Not attested (insufficient verification or low impact)", alert });
      return;
    }

    const ledger = await postAttestation(alert);
    res.json({ alert, ledger });
  }),
);

