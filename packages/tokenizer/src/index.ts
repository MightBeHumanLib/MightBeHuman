export interface ParagraphToken {
  readonly index: number;
  readonly text: string;
  readonly start: number;
  readonly end: number;
}

export interface SentenceToken {
  readonly index: number;
  readonly paragraphIndex: number;
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly wordCount: number;
}

export interface TokenizedDocument {
  readonly text: string;
  readonly paragraphs: ParagraphToken[];
  readonly sentences: SentenceToken[];
  readonly words: readonly string[];
}

const sentenceSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("en", { granularity: "sentence" })
    : null;

const wordPattern = /[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu;

export function normalizeWhitespace(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

export function splitParagraphs(text: string): ParagraphToken[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const paragraphs: ParagraphToken[] = [];
  let cursor = 0;

  for (const chunk of normalized.split(/\n\s*\n+/g)) {
    const start = normalized.indexOf(chunk, cursor);
    const end = start + chunk.length;
    paragraphs.push({ index: paragraphs.length, text: chunk, start, end });
    cursor = end;
  }

  if (paragraphs.length === 0) {
    paragraphs.push({ index: 0, text: normalized, start: 0, end: normalized.length });
  }

  return paragraphs;
}

export function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return [];
  }

  if (sentenceSegmenter) {
    return Array.from(sentenceSegmenter.segment(trimmed), (segment) => segment.segment.trim()).filter(
      (segment) => segment.length > 0,
    );
  }

  return trimmed
    .split(/(?<=[.!?])\s+(?=["'“”‘’(\[]?[A-Z0-9])/g)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

export function splitWords(text: string): string[] {
  return Array.from(text.matchAll(wordPattern), (match) => match[0].toLowerCase());
}

export function countWords(text: string): number {
  return splitWords(text).length;
}

export function countSyllables(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.length === 0) {
    return 0;
  }

  const vowels = normalized.match(/[aeiouy]+/g);
  let syllables = vowels ? vowels.length : 1;
  if (normalized.endsWith("e") && syllables > 1) {
    syllables -= 1;
  }
  if (normalized.endsWith("le") && normalized.length > 2 && !/[aeiouy]/.test(normalized[normalized.length - 3] ?? "")) {
    syllables += 1;
  }
  return Math.max(1, syllables);
}

export function tokenizeDocument(text: string): TokenizedDocument {
  const paragraphs = splitParagraphs(text);
  const sentences: SentenceToken[] = [];

  for (const paragraph of paragraphs) {
    const paragraphSentences = splitSentences(paragraph.text);
    let searchOffset = paragraph.start;
    for (const sentence of paragraphSentences) {
      const start = text.indexOf(sentence, searchOffset);
      const end = start + sentence.length;
      sentences.push({
        index: sentences.length,
        paragraphIndex: paragraph.index,
        text: sentence,
        start,
        end,
        wordCount: countWords(sentence),
      });
      searchOffset = end;
    }
  }

  return {
    text,
    paragraphs,
    sentences,
    words: splitWords(text),
  };
}
