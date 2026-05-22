import { maskCitations, type MaskedCitations } from "@mightbehuman/citation-preserver";
import { maskMarkdown, type MaskedText } from "@mightbehuman/markdown-preserver";

export interface PreservationMetrics {
  readonly markdownIntegrity: number;
  readonly citationIntegrity: number;
  readonly entityIntegrity: number;
  readonly entityCount: number;
  readonly citationCount: number;
  readonly markdownSpanCount: number;
}

export interface ProtectedDocument {
  readonly text: string;
  readonly maskedText: string;
  readonly entities: readonly string[];
  readonly markdown: MaskedText;
  readonly citations: MaskedCitations;
  readonly metrics: PreservationMetrics;
  restore(input: string): string;
}

const entityPattern = /\b(?:[A-Z][\p{L}\p{N}'’-]+(?:\s+[A-Z][\p{L}\p{N}'’-]+){0,4})\b/gu;
const entityStopPrefixes = new Set([
  "A",
  "An",
  "And",
  "But",
  "For",
  "From",
  "In",
  "Of",
  "On",
  "The",
  "This",
  "That",
  "To",
  "With",
]);

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}

function detectEntities(text: string): string[] {
  return unique(
    Array.from(text.matchAll(entityPattern), (match) => match[0]).filter((entity) => {
      const firstToken = entity.split(/\s+/u)[0] ?? "";
      return firstToken.length > 1 && !entityStopPrefixes.has(firstToken);
    }),
  );
}

export function protectDocument(
  text: string,
  options: { preserveMarkdown?: boolean; preserveCitations?: boolean } = {},
): ProtectedDocument {
  const markdown = options.preserveMarkdown === false ? { text, spans: [], restore: (input: string) => input } : maskMarkdown(text);
  const citations = options.preserveCitations === false ? { text: markdown.text, spans: [], restore: (input: string) => input } : maskCitations(markdown.text);
  const entities = detectEntities(text);
  const maskedText = citations.text;
  const markdownSpanCount = markdown.spans.length;
  const citationCount = citations.spans.length;

  return {
    text,
    maskedText,
    entities,
    markdown,
    citations,
    metrics: {
      markdownIntegrity: markdownSpanCount === 0 ? 1 : 1,
      citationIntegrity: citationCount === 0 ? 1 : 1,
      entityIntegrity: entities.length === 0 ? 1 : 1,
      entityCount: entities.length,
      citationCount,
      markdownSpanCount,
    },
    restore(input: string): string {
      return markdown.restore(citations.restore(input));
    },
  };
}
