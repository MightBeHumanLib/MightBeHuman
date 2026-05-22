import { countSyllables, tokenizeDocument, type TokenizedDocument } from "@mightbehuman/tokenizer";

export interface ReadabilityMetrics {
  readonly sentenceCount: number;
  readonly wordCount: number;
  readonly syllableCount: number;
  readonly averageSentenceLength: number;
  readonly averageSyllablesPerWord: number;
  readonly fleschReadingEase: number;
  readonly fkGradeLevel: number;
}

function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

function countDocumentSyllables(document: TokenizedDocument): number {
  return document.words.reduce((sum, word) => sum + countSyllables(word), 0);
}

export function analyzeReadability(input: string | TokenizedDocument): ReadabilityMetrics {
  const document = typeof input === "string" ? tokenizeDocument(input) : input;
  const sentenceCount = Math.max(1, document.sentences.length);
  const wordCount = document.words.length;
  const syllableCount = countDocumentSyllables(document);
  const averageSentenceLength = wordCount / sentenceCount;
  const averageSyllablesPerWord = wordCount === 0 ? 0 : syllableCount / wordCount;
  const fleschReadingEase = clamp(
    206.835 - 1.015 * averageSentenceLength - 84.6 * averageSyllablesPerWord,
    -50,
    120,
  );
  const fkGradeLevel = clamp(
    0.39 * averageSentenceLength + 11.8 * averageSyllablesPerWord - 15.59,
    0,
    24,
  );

  return {
    sentenceCount: document.sentences.length,
    wordCount,
    syllableCount,
    averageSentenceLength,
    averageSyllablesPerWord,
    fleschReadingEase,
    fkGradeLevel,
  };
}

export function summarizeReadability(metrics: ReadabilityMetrics): string {
  return `ease=${metrics.fleschReadingEase.toFixed(1)};grade=${metrics.fkGradeLevel.toFixed(1)};sentences=${metrics.sentenceCount}`;
}
