import { resolveHumanizationProfile, type HumanizationProfile } from "@mightbehuman/config-system";
import { countWords, tokenizeDocument, type TokenizedDocument } from "@mightbehuman/tokenizer";

export interface RhythmMetrics {
  readonly sentenceCount: number;
  readonly paragraphCount: number;
  readonly averageSentenceLength: number;
  readonly sentenceLengthVariance: number;
  readonly punctuationDensity: number;
  readonly transitionDensity: number;
  readonly paragraphBalance: number;
  readonly cadenceScore: number;
}

const transitionMarkers = new Set([
  "however",
  "therefore",
  "moreover",
  "meanwhile",
  "instead",
  "consequently",
  "finally",
  "ultimately",
  "still",
  "yet",
  "furthermore",
  "instead",
]);

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

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

export function analyzeRhythm(input: string | TokenizedDocument): RhythmMetrics {
  const document = typeof input === "string" ? tokenizeDocument(input) : input;
  const sentenceLengths = document.sentences.map((sentence) => sentence.wordCount);
  const averageSentenceLength = mean(sentenceLengths);
  const sentenceLengthVariance = variance(sentenceLengths);
  const punctuationDensity =
    document.text.length === 0 ? 0 : (document.text.match(/[,:;—–-]/g)?.length ?? 0) / document.text.length;
  const transitionDensity =
    document.sentences.length === 0
      ? 0
      : document.sentences.reduce((count, sentence) => {
          const firstWord = sentence.text.trim().split(/\s+/u)[0]?.toLowerCase() ?? "";
          return count + (transitionMarkers.has(firstWord) ? 1 : 0);
        }, 0) / document.sentences.length;
  const paragraphWordCounts = document.paragraphs.map((paragraph) => countWords(paragraph.text));
  const paragraphBalance =
    paragraphWordCounts.length === 0
      ? 1
      : 1 / (1 + Math.sqrt(variance(paragraphWordCounts)) / Math.max(1, mean(paragraphWordCounts)));
  const cadenceScore = clamp(
    1 - Math.min(1, sentenceLengthVariance / 144) + transitionDensity * 0.35 + punctuationDensity * 2,
    0,
    1,
  );

  return {
    sentenceCount: document.sentences.length,
    paragraphCount: document.paragraphs.length,
    averageSentenceLength,
    sentenceLengthVariance,
    punctuationDensity,
    transitionDensity,
    paragraphBalance,
    cadenceScore,
  };
}

function capitalize(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function splitSentence(sentence: string): string[] {
  const trimmed = sentence.trim();
  if (trimmed.length < 48) {
    return [trimmed];
  }

  const splitPatterns: readonly RegExp[] = [
    /\s*;\s*/u,
    /\s*,\s+(?=(?:and|but|so|yet|however|therefore|meanwhile|because|while|though)\b)/iu,
    /\s+—\s+/u,
  ];

  for (const pattern of splitPatterns) {
    const match = trimmed.match(pattern);
    if (!match || match.index === undefined) {
      continue;
    }

    const left = trimmed.slice(0, match.index).trim().replace(/[,:;\-—]+$/u, "");
    const right = trimmed.slice(match.index + match[0].length).trim();
    if (left.length < 18 || right.length < 18) {
      continue;
    }

    return [
      `${capitalize(left)}.`,
      /^[A-Z0-9"'“”‘’(\[]/.test(right) ? right : capitalize(right),
    ];
  }

  return [trimmed];
}

export function mutateRhythm(input: string, profile: Partial<HumanizationProfile> = {}): string {
  const resolved = resolveHumanizationProfile(profile);
  const document = tokenizeDocument(input);
  const mutatedParagraphs = document.paragraphs.map((paragraph) => {
    const sentences = document.sentences.filter((sentence) => sentence.paragraphIndex === paragraph.index);
    const rewritten: string[] = [];

    for (const sentence of sentences) {
      if (!resolved.enableSentenceSplits) {
        rewritten.push(sentence.text.trim());
        continue;
      }

      const segments = splitSentence(sentence.text);
      if (segments.length === 1) {
        rewritten.push(segments[0] ?? sentence.text.trim());
        continue;
      }

      rewritten.push(...segments);
    }

    return rewritten.join(" ");
  });

  return mutatedParagraphs.join("\n\n");
}
