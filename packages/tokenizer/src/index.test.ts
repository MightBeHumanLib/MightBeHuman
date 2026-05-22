import { describe, expect, it } from "vitest";

import { countSyllables, countWords, splitParagraphs, splitSentences, tokenizeDocument } from "./index.js";

describe("tokenizer", () => {
  it("splits paragraphs and sentences", () => {
    const document = tokenizeDocument("First sentence. Second sentence.\n\nThird paragraph starts here.");

    expect(document.paragraphs).toHaveLength(2);
    expect(document.sentences).toHaveLength(3);
    expect(document.sentences[0]?.text).toBe("First sentence.");
  });

  it("counts words and syllables", () => {
    expect(countWords("A quick brown fox" )).toBe(4);
    expect(countSyllables("humanization")).toBeGreaterThan(3);
  });

  it("splits sentence text safely", () => {
    expect(splitSentences("Hello world. How are you?")).toEqual(["Hello world.", "How are you?"]);
    expect(splitParagraphs("One\n\nTwo")).toHaveLength(2);
  });
});
