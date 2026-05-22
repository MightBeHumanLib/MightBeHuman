export interface ProtectedSpan {
  readonly id: string;
  readonly kind: string;
  readonly start: number;
  readonly end: number;
  readonly value: string;
  readonly placeholder: string;
}

export interface MaskedText {
  readonly text: string;
  readonly spans: readonly ProtectedSpan[];
  restore(input: string): string;
}

interface CandidateSpan {
  readonly kind: string;
  readonly start: number;
  readonly end: number;
  readonly value: string;
  readonly priority: number;
}

function makePlaceholder(kind: string, index: number): string {
  return `⟦${kind.toUpperCase()}:${String(index).padStart(4, "0")}⟧`;
}

function collectMatches(pattern: RegExp, kind: string, priority: number, text: string): CandidateSpan[] {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const matcher = new RegExp(pattern.source, flags);
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

export function maskMarkdown(text: string): MaskedText {
  const candidates: CandidateSpan[] = [
    ...collectMatches(/```[\s\S]*?```/g, "code-fence", 100, text),
    ...collectMatches(/`[^`\n]+`/g, "inline-code", 90, text),
    ...collectMatches(/!?\[[^\]]+\]\([^\)]+\)/g, "link", 80, text),
    ...collectMatches(/<[^>]+>/g, "html", 70, text),
  ];

  const spans = normalizeSpans(candidates);
  const protectedSpans: ProtectedSpan[] = spans.map((span, index) => ({
    id: `md-${index}`,
    kind: span.kind,
    start: span.start,
    end: span.end,
    value: span.value,
    placeholder: makePlaceholder("md", index),
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
