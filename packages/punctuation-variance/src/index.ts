import { tokenizeDocument, type TokenizedDocument } from "@mightbehuman/tokenizer";

export interface PunctuationVarianceMetrics {
  readonly punctuationCount: number;
  readonly commaCount: number;
  readonly semicolonCount: number;
  readonly colonCount: number;
  readonly dashCount: number;
  readonly questionCount: number;
  readonly exclamationCount: number;
  readonly diversity: number;
  readonly density: number;
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

function count(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

export function analyzePunctuationVariance(input: string | TokenizedDocument): PunctuationVarianceMetrics {
  const document = typeof input === "string" ? tokenizeDocument(input) : input;
  const punctuationCount = count(document.text, /[,:;—–!?\.]/g);
  const commaCount = count(document.text, /,/g);
  const semicolonCount = count(document.text, /;/g);
  const colonCount = count(document.text, /:/g);
  const dashCount = count(document.text, /[—–-]/g);
  const questionCount = count(document.text, /\?/g);
  const exclamationCount = count(document.text, /!/g);
  const distinctMarks = [commaCount, semicolonCount, colonCount, dashCount, questionCount, exclamationCount].filter((count) => count > 0).length;
  const diversity = clamp(punctuationCount === 0 ? 0 : distinctMarks / 6, 0, 1);
  const density = document.text.length === 0 ? 0 : punctuationCount / document.text.length;

  return {
    punctuationCount,
    commaCount,
    semicolonCount,
    colonCount,
    dashCount,
    questionCount,
    exclamationCount,
    diversity,
    density,
  };
}

function normalizeSpacing(text: string): string {
  return text
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,.;:!?])(?![\s\n"')\]])/g, "$1 ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function mutatePunctuation(input: string, strength = 0.5): string {
  const normalized = normalizeSpacing(input);
  if (strength <= 0.3) {
    return normalized;
  }

  return normalized.replace(/([^\n.?!]{40,}?),(\s+(?:and|but|so|yet|however|therefore)\b)/giu, "$1;$2");
}
