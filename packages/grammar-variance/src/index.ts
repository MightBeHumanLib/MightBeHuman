import { tokenizeDocument, type TokenizedDocument } from "@mightbehuman/tokenizer";

export interface GrammarVarianceMetrics {
  readonly sentenceCount: number;
  readonly openerDiversity: number;
  readonly connectiveDensity: number;
  readonly clauseDensity: number;
  readonly passiveHintRate: number;
}

const connectiveMarkers = new Set([
  "and",
  "but",
  "so",
  "yet",
  "however",
  "therefore",
  "moreover",
  "meanwhile",
  "instead",
  "furthermore",
  "because",
  "while",
  "though",
]);

function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

function countPattern(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

export function analyzeGrammarVariance(input: string | TokenizedDocument): GrammarVarianceMetrics {
  const document = typeof input === "string" ? tokenizeDocument(input) : input;
  const openers = document.sentences.map((sentence) => sentence.text.trim().split(/\s+/u)[0]?.toLowerCase() ?? "").filter(Boolean);
  const openerDiversity = document.sentences.length === 0 ? 0 : new Set(openers).size / document.sentences.length;
  const connectiveDensity = document.sentences.length === 0 ? 0 : openers.filter((opener) => connectiveMarkers.has(opener)).length / document.sentences.length;
  const clauseDensity = document.sentences.length === 0 ? 0 : mean(document.sentences.map((sentence) => countPattern(sentence.text, /[,:;—–]/g))) / Math.max(1, mean(document.sentences.map((sentence) => sentence.wordCount)));
  const passiveHintRate = document.sentences.length === 0 ? 0 : clamp(
    document.sentences.filter((sentence) => /\b(?:was|were|is|are|been|being)\s+\w+(?:ed|en)\b/iu.test(sentence.text)).length / document.sentences.length,
    0,
    1,
  );

  return {
    sentenceCount: document.sentences.length,
    openerDiversity,
    connectiveDensity,
    clauseDensity,
    passiveHintRate,
  };
}

export function rebalanceGrammar(input: string, strength = 0.5): string {
  const document = tokenizeDocument(input);
  if (strength <= 0.35) {
    return document.text;
  }

  return document.sentences
    .map((sentence) => sentence.text.trim())
    .map((sentence) => sentence.replace(/,\s+(and|but|so|yet|however|therefore)\b/giu, ". $1"))
    .join(" ");
}
