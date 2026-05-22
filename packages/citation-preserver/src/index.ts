export interface ProtectedCitationSpan {
  readonly id: string;
  readonly kind: string;
  readonly start: number;
  readonly end: number;
  readonly value: string;
  readonly placeholder: string;
}

export interface MaskedCitations {
  readonly text: string;
  readonly spans: readonly ProtectedCitationSpan[];
  restore(input: string): string;
}

interface CandidateSpan {
  readonly kind: string;
  readonly start: number;
  readonly end: number;
  readonly value: string;
  readonly priority: number;
}

function makePlaceholder(index: number): string {
  return `⟦CIT:${String(index).padStart(4, "0")}⟧`;
}

function collectMatches(pattern: RegExp, kind: string, priority: number, text: string): CandidateSpan[] {
  const matcher = pattern.flags.includes("g") ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  const spans: CandidateSpan[] = [];

  for (const match of text.matchAll(matcher)) {
    const value = match[0];
    const start = match.index ?? 0;
    spans.push({ kind, start, end: start + value.length, value, priority });
  }

  return spans;
}

function normalizeSpans(spans: CandidateSpan[]): CandidateSpan[] {
  const sorted = [...spans].sort((left, right) => left.start - right.start || right.priority - left.priority);
  const accepted: CandidateSpan[] = [];
  let cursor = -1;

  for (const span of sorted) {
    if (span.start < cursor) {
      continue;
    }
    accepted.push(span);
    cursor = span.end;
  }

  return accepted;
}

export function maskCitations(text: string): MaskedCitations {
  const candidates: CandidateSpan[] = [
    ...collectMatches(/https?:\/\/[^\s<>)]+/g, "url", 100, text),
    ...collectMatches(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi, "doi", 90, text),
    ...collectMatches(/\[[0-9,;\-\s]+\]/g, "numeric-reference", 80, text),
    ...collectMatches(/\([A-Z][^\)]*?\b(?:19|20)\d{2}[a-z]?[^\)]*\)/g, "author-date", 70, text),
  ];

  const spans = normalizeSpans(candidates);
  const protectedSpans: ProtectedCitationSpan[] = spans.map((span, index) => ({
    id: `cit-${index}`,
    kind: span.kind,
    start: span.start,
    end: span.end,
    value: span.value,
    placeholder: makePlaceholder(index),
  }));

  let masked = text;
  for (const span of [...protectedSpans].sort((left, right) => right.start - left.start)) {
    masked = `${masked.slice(0, span.start)}${span.placeholder}${masked.slice(span.end)}`;
  }

  return {
    text: masked,
    spans: protectedSpans,
    restore(input: string): string {
      return protectedSpans.reduce((current, span) => current.replaceAll(span.placeholder, span.value), input);
    },
  };
}
