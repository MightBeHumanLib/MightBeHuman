import { getDefaultHumanizationProfile, resolveHumanizationProfile, type HumanizationProfile } from "@mightbehuman/config-system";
import { analyzeEntropy } from "@mightbehuman/entropy-engine";
import { applyHumanPatterns } from "@mightbehuman/human-pattern-engine";
import { protectDocument, type PreservationMetrics } from "@mightbehuman/semantic-preservation";
import { analyzeRhythm, mutateRhythm } from "@mightbehuman/rhythm-engine";
import { analyzeStylometry } from "@mightbehuman/stylometry-engine";
import { scoreDocument, type HumanizationScoreInput, type ScoreReport } from "@mightbehuman/scoring-engine";
import { tokenizeDocument } from "@mightbehuman/tokenizer";

export interface EngineStageReport {
  readonly name: string;
  readonly elapsedMs: number;
  readonly summary: string;
}

export interface HumanizationAnalysis {
  readonly rhythm: ReturnType<typeof analyzeRhythm>;
  readonly stylometry: ReturnType<typeof analyzeStylometry>;
  readonly entropy: ReturnType<typeof analyzeEntropy>;
  readonly preservation: PreservationMetrics;
  readonly score: ScoreReport;
}

export interface HumanizationResult {
  readonly inputText: string;
  readonly maskedText: string;
  readonly outputText: string;
  readonly profile: ReturnType<typeof resolveHumanizationProfile>;
  readonly analysis: HumanizationAnalysis;
  readonly stages: readonly EngineStageReport[];
}

export interface ComparisonResult {
  readonly sourceScore: ScoreReport;
  readonly targetScore: ScoreReport;
  readonly delta: number;
  readonly improvement: number;
}

function now(): number {
  return performance.now();
}

function collectStage<T>(name: string, steps: EngineStageReport[], run: () => T): T {
  const start = now();
  const value = run();
  steps.push({ name, elapsedMs: now() - start, summary: typeof value === "string" ? `text:${value.length}` : "ok" });
  return value;
}

export function analyzeText(inputText: string, profile: Partial<HumanizationProfile> = {}): HumanizationAnalysis {
  const resolved = resolveHumanizationProfile(profile);
  const protectedDocument = protectDocument(inputText, {
    preserveCitations: resolved.preserveCitations,
    preserveMarkdown: resolved.preserveMarkdown,
  });
  const tokenized = tokenizeDocument(protectedDocument.maskedText);
  const rhythm = analyzeRhythm(tokenized);
  const stylometry = analyzeStylometry(tokenized);
  const entropy = analyzeEntropy(tokenized);
  const score = scoreDocument({
    rhythm,
    stylometry,
    entropy,
    preservation: protectedDocument.metrics,
  });

  return {
    rhythm,
    stylometry,
    entropy,
    preservation: protectedDocument.metrics,
    score,
  };
}

export function humanizeText(inputText: string, profile: Partial<HumanizationProfile> = {}): HumanizationResult {
  const resolved = resolveHumanizationProfile(profile);
  const stages: EngineStageReport[] = [];

  const protectedDocument = collectStage("preserve", stages, () =>
    protectDocument(inputText, {
      preserveCitations: resolved.preserveCitations,
      preserveMarkdown: resolved.preserveMarkdown,
    }),
  );

  const maskedText = protectedDocument.maskedText;
  const analyzedBefore = collectStage("analyze-before", stages, () => analyzeText(maskedText, resolved));
  const mutatedMaskedText = collectStage("rhythm-mutation", stages, () => mutateRhythm(maskedText, resolved));
  const patternedMaskedText = collectStage("human-patterns", stages, () => applyHumanPatterns(mutatedMaskedText, resolved).text);
  const restoredText = collectStage("restore", stages, () => protectedDocument.restore(patternedMaskedText));
  const finalAnalysis = collectStage("analyze-after", stages, () => analyzeText(restoredText, resolved));

  return {
    inputText,
    maskedText,
    outputText: restoredText,
    profile: resolved,
    analysis: {
      rhythm: finalAnalysis.rhythm,
      stylometry: finalAnalysis.stylometry,
      entropy: finalAnalysis.entropy,
      preservation: protectedDocument.metrics,
      score: finalAnalysis.score,
    },
    stages: [
      ...stages,
      {
        name: "delta-summary",
        elapsedMs: 0,
        summary: `score:${analyzedBefore.score.score.toFixed(3)}->${finalAnalysis.score.score.toFixed(3)}`,
      },
    ],
  };
}

export function compareTexts(sourceText: string, targetText: string, profile: Partial<HumanizationProfile> = {}): ComparisonResult {
  const source = analyzeText(sourceText, profile);
  const target = analyzeText(targetText, profile);
  const delta = target.score.score - source.score.score;

  return {
    sourceScore: source.score,
    targetScore: target.score,
    delta,
    improvement: delta,
  };
}

export function defaultProfile(): ReturnType<typeof getDefaultHumanizationProfile> {
  return getDefaultHumanizationProfile();
}
