import { analyzeText, humanizeText } from "@mightbehuman/core-engine";
import { runDetectorLab } from "@mightbehuman/detector-lab";

export interface BenchmarkSample {
  readonly id: string;
  readonly text: string;
}

export interface BenchmarkRecord {
  readonly id: string;
  readonly beforeScore: number;
  readonly afterScore: number;
  readonly detectorScore: number;
  readonly improvement: number;
}

export interface BenchmarkSummary {
  readonly records: readonly BenchmarkRecord[];
  readonly averageImprovement: number;
  readonly averageDetectorReduction: number;
}

function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function runBenchmark(samples: readonly BenchmarkSample[]): BenchmarkSummary {
  const records = samples.map((sample) => {
    const before = analyzeText(sample.text);
    const after = humanizeText(sample.text);
    const detectorScore = runDetectorLab(after.outputText).overallScore;

    return {
      id: sample.id,
      beforeScore: before.score.score,
      afterScore: after.analysis.score.score,
      detectorScore,
      improvement: after.analysis.score.score - before.score.score,
    };
  });

  const beforeDetectorScores = samples.map((sample) => runDetectorLab(sample.text).overallScore);
  const afterDetectorScores = samples.map((sample) => runDetectorLab(humanizeText(sample.text).outputText).overallScore);

  return {
    records,
    averageImprovement: mean(records.map((record) => record.improvement)),
    averageDetectorReduction: mean(beforeDetectorScores) - mean(afterDetectorScores),
  };
}
