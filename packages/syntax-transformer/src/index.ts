import { resolveHumanizationProfile, type HumanizationProfile } from "@mightbehuman/config-system";
import { tokenizeDocument } from "@mightbehuman/tokenizer";

export interface SyntaxTransformMetrics {
  readonly sentenceCount: number;
  readonly splitCount: number;
  readonly reflowCount: number;
}

export interface SyntaxTransformResult {
  readonly text: string;
  readonly metrics: SyntaxTransformMetrics;
}

function capitalize(text: string): string {
  const trimmed = text.trim();
  return trimmed.length === 0 ? trimmed : trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function splitSentence(sentence: string, maxSentenceLength: number): string[] {
  const trimmed = sentence.trim();
  const words = trimmed.split(/\s+/u).filter(Boolean);
  if (words.length <= maxSentenceLength || trimmed.length < 48) {
    return [trimmed];
  }

  const patterns: readonly RegExp[] = [
    /\s*;\s*/u,
    /\s*—\s*/u,
    /\s*,\s+(?=(?:and|but|so|yet|however|therefore|because|while|though)\b)/iu,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (!match || match.index === undefined) {
      continue;
    }

    const left = trimmed.slice(0, match.index).trim().replace(/[,:;—–-]+$/u, "");
    const right = trimmed.slice(match.index + match[0].length).trim();
    if (left.length < 18 || right.length < 18) {
      continue;
    }

    return [`${capitalize(left)}.`, /^[A-Z0-9"'“”‘’(\[]/.test(right) ? right : capitalize(right)];
  }

  return [trimmed];
}

export function transformSyntax(input: string, profile: Partial<HumanizationProfile> = {}): SyntaxTransformResult {
  const resolved = resolveHumanizationProfile(profile);
  const document = tokenizeDocument(input);
  let splitCount = 0;
  let reflowCount = 0;

  const paragraphs = document.paragraphs.map((paragraph) => {
    const paragraphSentences = document.sentences.filter((sentence) => sentence.paragraphIndex === paragraph.index);
    const rewritten: string[] = [];

    for (const sentence of paragraphSentences) {
      const segments = resolved.enableSentenceSplits ? splitSentence(sentence.text, resolved.maxSentenceLength) : [sentence.text.trim()];
      splitCount += Math.max(0, segments.length - 1);
      if (segments.length > 1) {
        reflowCount += 1;
      }
      rewritten.push(...segments);
    }

    return rewritten.join(" ").replace(/\s+([,.;:!?])/g, "$1").replace(/([,.;:!?])(?![\s\n"')\]])/g, "$1 ").trim();
  });

  return {
    text: paragraphs.join("\n\n"),
    metrics: {
      sentenceCount: document.sentences.length,
      splitCount,
      reflowCount,
    },
  };
}
