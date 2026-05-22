#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { analyzeText, compareTexts, humanizeText } from "@mightbehuman/core-engine";
import { protectDocument } from "@mightbehuman/semantic-preservation";
import { getDefaultHumanizationProfile, resolveHumanizationProfile, type HumanizationProfile } from "@mightbehuman/config-system";

interface ParsedArgs {
  readonly command: string;
  readonly positionals: string[];
  readonly options: Record<string, string | boolean>;
}

const CLI_VERSION = "0.1.0";

function parseArgs(argv: readonly string[]): ParsedArgs {
  const [command = "analyze", ...rest] = argv;
  const positionals: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index] ?? "";
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }

    const key = arg.slice(2);
    const next = rest[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      options[key] = next;
      index += 1;
    } else {
      options[key] = true;
    }
  }

  return { command, positionals, options };
}

async function readInput(pathOrText: string | undefined): Promise<string> {
  if (pathOrText === undefined) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
  }

  try {
    const absolute = resolve(process.cwd(), pathOrText);
    return await readFile(absolute, "utf8");
  } catch {
    return pathOrText;
  }
}

function getProfile(options: Record<string, string | boolean>): Partial<HumanizationProfile> {
  const base = getDefaultHumanizationProfile();
  const strength = typeof options.strength === "string" ? Number(options.strength) : base.strength;

  return resolveHumanizationProfile({
    language: typeof options.language === "string" ? options.language : base.language,
    strength: Number.isFinite(strength) ? strength : base.strength,
    preserveMarkdown: options["no-markdown"] ? false : base.preserveMarkdown,
    preserveCitations: options["no-citations"] ? false : base.preserveCitations,
    enableSentenceSplits: options["no-split"] ? false : base.enableSentenceSplits,
    enableClauseRebalancing: options["no-rebalance"] ? false : base.enableClauseRebalancing,
    targetSentenceLength: base.targetSentenceLength,
    maxSentenceLength: base.maxSentenceLength,
    minSentenceLength: base.minSentenceLength,
  });
}

function toMarkdown(result: unknown): string {
  if (typeof result !== "object" || result === null) {
    return String(result);
  }

  const entries = Object.entries(result as Record<string, unknown>);
  return entries
    .map(([key, value]) => `- ${key}: ${typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}`)
    .join("\n");
}

function printBanner(): void {
  process.stdout.write([
    "MightBeHuman",
    "Local-first algorithmic writing transformation",
    `v${CLI_VERSION}`,
    "",
  ].join("\n"));
}

function printHelp(): void {
  printBanner();
  process.stdout.write(
    [
      "Commands:",
      "  analyze          Analyze a text file or stdin",
      "  humanize         Humanize a text file or stdin",
      "  compare          Compare two texts",
      "  preserve         Show preservation masks",
      "  score            Print the engine score",
      "  benchmark        Compare before/after scores",
      "  pipeline-debug   Print pipeline stages",
      "  export           Export analysis as JSON or markdown",
      "",
      "Flags:",
      "  --file <path>    Read from a file",
      "  --json           Emit JSON",
      "  --markdown       Emit markdown",
      "  --help           Show this help",
      "  --version        Print version",
    ].join("\n") + "\n",
  );
}

function printOutput(value: unknown, options: Record<string, string | boolean>): void {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
    return;
  }

  if (options.markdown) {
    process.stdout.write(`${toMarkdown(value)}\n`);
    return;
  }

  if (typeof value === "string") {
    process.stdout.write(`${value}\n`);
    return;
  }

  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function loadFromOption(options: Record<string, string | boolean>, key: string, fallback?: string): Promise<string> {
  const value = options[key];
  if (typeof value === "string") {
    return readInput(value);
  }
  if (fallback !== undefined) {
    return readInput(fallback);
  }
  return readInput(undefined);
}

async function run(): Promise<void> {
  const { command, positionals, options } = parseArgs(process.argv.slice(2));
  const profile = getProfile(options);

  if (command === "--help" || command === "help" || options.help === true) {
    printHelp();
    return;
  }

  if (command === "--version" || command === "version" || options.version === true) {
    process.stdout.write(`${CLI_VERSION}\n`);
    return;
  }

  if (command === "analyze" || command === "detect") {
    const input = await loadFromOption(options, "file", positionals[0]);
    printOutput(analyzeText(input, profile), options);
    return;
  }

  if (command === "humanize") {
    const input = await loadFromOption(options, "file", positionals[0]);
    const result = humanizeText(input, profile);
    const outputPath = typeof options.out === "string" ? options.out : undefined;
    if (outputPath !== undefined) {
      await import("node:fs/promises").then((fs) => fs.writeFile(resolve(process.cwd(), outputPath), result.outputText, "utf8"));
    }
    printOutput(result, options);
    return;
  }

  if (command === "preserve") {
    const input = await loadFromOption(options, "file", positionals[0]);
    printOutput(protectDocument(input, { preserveMarkdown: true, preserveCitations: true }), options);
    return;
  }

  if (command === "all" || command === "analyze-all") {
    const input = await loadFromOption(options, "file", positionals[0]);
    const analysis = analyzeText(input, profile);
    const humanized = humanizeText(input, profile);
    const preserved = protectDocument(input, { preserveMarkdown: true, preserveCitations: true });

    printOutput(
      {
        analysis,
        humanized,
        preserved,
        score: analysis.score,
      },
      options,
    );

    return;
  }

  if (command === "score") {
    const input = await loadFromOption(options, "file", positionals[0]);
    const result = analyzeText(input, profile);
    printOutput(result.score, options);
    return;
  }

  if (command === "compare") {
    const sourcePath = options.source;
    const targetPath = options.target;
    const source = await readInput(typeof sourcePath === "string" ? sourcePath : positionals[0]);
    const target = await readInput(typeof targetPath === "string" ? targetPath : positionals[1]);
    printOutput(compareTexts(source, target, profile), options);
    return;
  }

  if (command === "export") {
    const input = await loadFromOption(options, "file", positionals[0]);
    const analysis = analyzeText(input, profile);
    const payload = options.format === "markdown" ? toMarkdown(analysis) : JSON.stringify(analysis, null, 2);
    const outputPath = typeof options.out === "string" ? options.out : undefined;
    if (outputPath !== undefined) {
      await import("node:fs/promises").then((fs) => fs.writeFile(resolve(process.cwd(), outputPath), payload, "utf8"));
    }
    process.stdout.write(`${payload}\n`);
    return;
  }

  if (command === "pipeline-debug") {
    const input = await loadFromOption(options, "file", positionals[0]);
    const result = humanizeText(input, profile);
    printOutput(
      {
        profile: result.profile,
        stages: result.stages,
        score: result.analysis.score,
      },
      options,
    );
    return;
  }

  if (command === "benchmark") {
    const input = await loadFromOption(options, "file", positionals[0]);
    const before = analyzeText(input, profile);
    const after = humanizeText(input, profile);
    printOutput(
      {
        before: before.score,
        after: after.analysis.score,
        delta: after.analysis.score.score - before.score.score,
        stages: after.stages,
      },
      options,
    );
    return;
  }

  printHelp();
  process.stderr.write(`Unknown command: ${command}\n`);
  process.exitCode = 1;
}

void run().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
