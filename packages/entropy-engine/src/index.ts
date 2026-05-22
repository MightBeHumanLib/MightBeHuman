import { tokenizeDocument, type TokenizedDocument } from "@mightbehuman/tokenizer";

export interface EntropyMetrics {
  readonly wordEntropy: number;
  readonly characterEntropy: number;
  readonly burstiness: number;
  readonly lexicalSpread: number;
}

function shannonEntropy(values: readonly string[]): number {
  if (values.length === 0) {
    return 0;
  }

  const frequencies = new Map<string, number>();
  for (const value of values) {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  }

  const total = values.length;
  let entropy = 0;
  for (const count of frequencies.values()) {
    const probability = count / total;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

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

export function analyzeEntropy(input: string | TokenizedDocument): EntropyMetrics {
  const document = typeof input === "string" ? tokenizeDocument(input) : input;
  const wordEntropy = shannonEntropy(document.words);
  const characters = Array.from(document.text.replace(/\s+/g, "").toLowerCase());
  const characterEntropy = shannonEntropy(characters);
  const sentenceLengths = document.sentences.map((sentence) => sentence.wordCount);
  const burstiness = sentenceLengths.length === 0 ? 0 : Math.sqrt(variance(sentenceLengths));
  const lexicalSpread =
    document.words.length === 0 ? 0 : new Set(document.words).size / Math.max(1, document.words.length);

  return {
    wordEntropy,
    characterEntropy,
    burstiness,
    lexicalSpread,
  };
}
