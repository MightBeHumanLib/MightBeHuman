import { resolveHumanizationProfile, type HumanizationProfile } from "@mightbehuman/config-system";
import { tokenizeDocument } from "@mightbehuman/tokenizer";

export interface DiscourseTransformMetrics {
  readonly paragraphCount: number;
  readonly transitionsAdded: number;
  readonly transitionDensity: number;
}

export interface DiscourseTransformResult {
  readonly text: string;
  readonly metrics: DiscourseTransformMetrics;
}

const transitions = ["Additionally,", "In practice,", "More broadly,", "Meanwhile,", "However,"];

function startsWithTransition(text: string): boolean {
  return /^(?:Additionally|In practice|More broadly|Meanwhile|However),/i.test(text.trim());
}

function pickTransition(index: number): string {
  return transitions[index % transitions.length] ?? "Additionally,";
}

export function transformDiscourse(input: string, profile: Partial<HumanizationProfile> = {}): DiscourseTransformResult {
  const resolved = resolveHumanizationProfile(profile);
  const document = tokenizeDocument(input);
  let transitionsAdded = 0;

  const paragraphs = document.paragraphs.map((paragraph, index) => {
    const text = paragraph.text.trim();
    if (index === 0 || !resolved.enableClauseRebalancing || resolved.strength <= 0.25 || startsWithTransition(text)) {
      return text;
    }

    const prefix = pickTransition(index);
    transitionsAdded += 1;
    return `${prefix} ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  });

  return {
    text: paragraphs.join("\n\n"),
    metrics: {
      paragraphCount: document.paragraphs.length,
      transitionsAdded,
      transitionDensity: document.paragraphs.length === 0 ? 0 : transitionsAdded / document.paragraphs.length,
    },
  };
}
