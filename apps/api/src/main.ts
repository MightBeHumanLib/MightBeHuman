import Fastify, { type FastifyInstance } from "fastify";

import { analyzeText, compareTexts, humanizeText } from "@mightbehuman/core-engine";
import { loadRuntimeConfig, type HumanizationProfile } from "@mightbehuman/config-system";

export interface AnalyzeRequestBody {
  readonly text: string;
  readonly profile?: Partial<HumanizationProfile>;
}

export interface CompareRequestBody {
  readonly source: string;
  readonly target: string;
  readonly profile?: Partial<HumanizationProfile>;
}

export interface HumanizeRequestBody {
  readonly text: string;
  readonly profile?: Partial<HumanizationProfile>;
}

export function createApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.get("/health", async () => ({ status: "ok" as const }));

  app.post<{ Body: AnalyzeRequestBody }>("/v1/analyze", async (request) => {
    return analyzeText(request.body.text, request.body.profile);
  });

  app.post<{ Body: HumanizeRequestBody }>("/v1/humanize", async (request) => {
    return humanizeText(request.body.text, request.body.profile);
  });

  app.post<{ Body: CompareRequestBody }>("/v1/compare", async (request) => {
    return compareTexts(request.body.source, request.body.target, request.body.profile);
  });

  return app;
}

export async function startServer(port = 3000): Promise<FastifyInstance> {
  const app = createApp();
  await app.listen({ port, host: "127.0.0.1" });
  return app;
}

const isEntryPoint = import.meta.url === `file://${process.argv[1]}`;

if (isEntryPoint) {
  const config = loadRuntimeConfig();
  void startServer(config.apiPort).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
