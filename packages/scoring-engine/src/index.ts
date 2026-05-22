import type { EntropyMetrics } from "@mightbehuman/entropy-engine";
import type { RhythmMetrics } from "@mightbehuman/rhythm-engine";
import type { StylometryMetrics } from "@mightbehuman/stylometry-engine";

export interface PreservationMetrics {
  readonly markdownIntegrity: number;
  readonly citationIntegrity: number;
  readonly entityIntegrity: number;
}

export interface HumanizationScoreInput {
  readonly rhythm: RhythmMetrics;
  readonly stylometry: StylometryMetrics;
  readonly entropy: EntropyMetrics;
  readonly preservation: PreservationMetrics;
}

export interface ScoreBreakdown {
  readonly rhythmScore: number;
  readonly stylometryScore: number;
  readonly entropyScore: number;
  readonly preservationScore: number;
}

export interface ScoreReport {
  readonly score: number;
  readonly breakdown: ScoreBreakdown;
  readonly warnings: readonly string[];
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

function weightAverage(entries: readonly [number, number][]): number {
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight === 0) {
    return 0;
  }
  return entries.reduce((sum, [score, weight]) => sum + score * weight, 0) / totalWeight;
}

export function scoreDocument(input: HumanizationScoreInput): ScoreReport {
  const rhythmScore = clamp(
    weightAverage([
      [1 - Math.min(1, input.rhythm.sentenceLengthVariance / 160), 0.4],
      [input.rhythm.cadenceScore, 0.35],
      [input.rhythm.paragraphBalance, 0.25],
    ]),
    0,
    1,
  );

  const stylometryScore = clamp(
    weightAverage([
      [input.stylometry.typeTokenRatio, 0.35],
      [input.stylometry.hapaxRatio, 0.2],
      [1 - input.stylometry.repeatedPhraseRatio, 0.25],
      [1 - input.stylometry.openerRepetitionRatio, 0.2],
    ]),
    0,
    1,
  );

  const entropyScore = clamp(
    weightAverage([
      [Math.min(1, input.entropy.wordEntropy / 8), 0.55],
      [Math.min(1, input.entropy.characterEntropy / 5), 0.25],
      [Math.min(1, input.entropy.lexicalSpread * 2), 0.2],
    ]),
    0,
    1,
  );

  const preservationScore = clamp(
    weightAverage([
      [input.preservation.markdownIntegrity, 0.35],
      [input.preservation.citationIntegrity, 0.35],
      [input.preservation.entityIntegrity, 0.3],
    ]),
    0,
    1,
  );

  const score = clamp(
    weightAverage([
      [rhythmScore, 0.3],
      [stylometryScore, 0.3],
      [entropyScore, 0.2],
      [preservationScore, 0.2],
    ]),
    0,
    1,
  );

  const warnings: string[] = [];
  if (preservationScore < 0.95) {
    warnings.push("Preservation integrity is below the target threshold.");
  }
  if (stylometryScore < 0.4) {
    warnings.push("Stylistic repetition remains high.");
  }
  if (rhythmScore < 0.45) {
    warnings.push("Sentence cadence is still too uniform.");
  }

  return {
    score,
    breakdown: {
      rhythmScore,
      stylometryScore,
      entropyScore,
      preservationScore,
    },
    warnings,
  };
}
