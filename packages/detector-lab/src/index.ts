import { analyzeEntropy } from "@mightbehuman/entropy-engine";
import { analyzeRhythm } from "@mightbehuman/rhythm-engine";
import { analyzeStylometry } from "@mightbehuman/stylometry-engine";
import { countWords, splitSentences, tokenizeDocument } from "@mightbehuman/tokenizer";

export interface DetectorSignal {
  readonly name: string;
  readonly score: number;
  readonly details: string;
}

export interface DetectorReport {
  readonly signals: readonly DetectorSignal[];
  readonly overallScore: number;
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const average = mean(values);
  return mean(values.map((value) => (value - average) ** 2));
}

export function detectRepetition(text: string): DetectorSignal {
  const document = tokenizeDocument(text);
  const stylometry = analyzeStylometry(document);
  const repeatedSentenceRatio = document.sentences.length === 0 ? 0 : 1 - document.sentences.length / Math.max(1, new Set(document.sentences.map((sentence) => sentence.text.toLowerCase())).size);
  const score = clamp((stylometry.repeatedPhraseRatio * 0.7) + (repeatedSentenceRatio * 0.3), 0, 1);

  return {
    name: "repetition",
    score,
    details: `type-token-ratio=${stylometry.typeTokenRatio.toFixed(3)}`,
  };
}

export function detectBurstiness(text: string): DetectorSignal {
  const document = tokenizeDocument(text);
  const lengths = document.sentences.map((sentence) => sentence.wordCount);
  const score = clamp(
    lengths.length === 0 ? 0 : Math.min(1, Math.sqrt(variance(lengths)) / 12),
    0,
    1,
  );

  return {
    name: "burstiness",
    score,
    details: `sentence-count=${lengths.length}`,
  };
}

export function detectReadability(text: string): DetectorSignal {
  const document = tokenizeDocument(text);
  const sentences = document.sentences.length === 0 ? splitSentences(text).length : document.sentences.length;
  const words = countWords(text);
  const averageSentenceLength = sentences === 0 ? 0 : words / sentences;
  const score = clamp(Math.abs(averageSentenceLength - 18) / 18, 0, 1);

  return {
    name: "readability",
    score,
    details: `avg-sentence-length=${averageSentenceLength.toFixed(2)}`,
  };
}

export function detectSentenceDistribution(text: string): DetectorSignal {
  const document = tokenizeDocument(text);
  const lengths = document.sentences.map((sentence) => sentence.wordCount);
  const shortCount = lengths.filter((length) => length <= 8).length;
  const longCount = lengths.filter((length) => length >= 24).length;
  const balance = lengths.length === 0 ? 0 : 1 - Math.abs(shortCount - longCount) / lengths.length;

  return {
    name: "sentence-distribution",
    score: clamp(1 - balance, 0, 1),
    details: `short=${shortCount};long=${longCount}`,
  };
}

export function runDetectorLab(text: string): DetectorReport {
  const signals = [
    detectRepetition(text),
    detectBurstiness(text),
    detectReadability(text),
    detectSentenceDistribution(text),
  ];
  const rhythm = analyzeRhythm(text);
  const entropy = analyzeEntropy(text);
  const augmentedScore = clamp(
    mean(signals.map((signal) => signal.score)) * 0.75 + (1 - rhythm.cadenceScore) * 0.15 + (1 - Math.min(1, entropy.lexicalSpread * 2)) * 0.1,
    0,
    1,
  );

  return {
    signals,
    overallScore: augmentedScore,
  };
}
