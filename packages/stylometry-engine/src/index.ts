import { tokenizeDocument, type TokenizedDocument } from "@mightbehuman/tokenizer";

export interface StylometryMetrics {
  readonly tokenCount: number;
  readonly uniqueTokenCount: number;
  readonly typeTokenRatio: number;
  readonly hapaxRatio: number;
  readonly repeatedPhraseRatio: number;
  readonly openerRepetitionRatio: number;
  readonly averageWordLength: number;
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

function countRepeatedNGrams(words: readonly string[], size: number): number {
  if (words.length < size) {
    return 0;
  }

  const counts = new Map<string, number>();
  for (let index = 0; index <= words.length - size; index += 1) {
    const ngram = words.slice(index, index + size).join(" ");
    counts.set(ngram, (counts.get(ngram) ?? 0) + 1);
  }

  let repeated = 0;
  for (const count of counts.values()) {
    if (count > 1) {
      repeated += count - 1;
    }
  }

  return repeated;
}

export function analyzeStylometry(input: string | TokenizedDocument): StylometryMetrics {
  const document = typeof input === "string" ? tokenizeDocument(input) : input;
  const words = document.words;
  const tokenCount = words.length;
  const uniqueWords = new Set(words);
  const frequencies = new Map<string, number>();

  for (const word of words) {
    frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
  }

  const hapaxCount = Array.from(frequencies.values()).filter((count) => count === 1).length;
  const openerCounts = new Map<string, number>();
  for (const sentence of document.sentences) {
    const opener = sentence.text.trim().split(/\s+/u)[0]?.toLowerCase() ?? "";
    if (opener.length > 0) {
      openerCounts.set(opener, (openerCounts.get(opener) ?? 0) + 1);
    }
  }

  const openerRepetitionRatio =
    document.sentences.length === 0
      ? 0
      : Math.max(...openerCounts.values(), 0) / document.sentences.length;

  const repeatedPhraseRatio = clamp(
    tokenCount === 0 ? 0 : (countRepeatedNGrams(words, 2) + countRepeatedNGrams(words, 3)) / tokenCount,
    0,
    1,
  );
  const averageWordLength = mean(words.map((word) => word.length));

  return {
    tokenCount,
    uniqueTokenCount: uniqueWords.size,
    typeTokenRatio: tokenCount === 0 ? 0 : uniqueWords.size / tokenCount,
    hapaxRatio: tokenCount === 0 ? 0 : hapaxCount / tokenCount,
    repeatedPhraseRatio,
    openerRepetitionRatio,
    averageWordLength,
  };
}
