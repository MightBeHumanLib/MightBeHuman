import { resolveHumanizationProfile, type HumanizationProfile } from "@mightbehuman/config-system";
import { analyzeGrammarVariance, rebalanceGrammar } from "@mightbehuman/grammar-variance";
import { analyzePunctuationVariance, mutatePunctuation } from "@mightbehuman/punctuation-variance";
import { analyzeReadability } from "@mightbehuman/readability-engine";
import { transformDiscourse } from "@mightbehuman/discourse-transformer";
import { transformSyntax } from "@mightbehuman/syntax-transformer";

export interface HumanPatternMetrics {
  readonly readability: ReturnType<typeof analyzeReadability>;
  readonly grammar: ReturnType<typeof analyzeGrammarVariance>;
  readonly punctuation: ReturnType<typeof analyzePunctuationVariance>;
  readonly transformations: readonly string[];
}

export interface HumanPatternResult {
  readonly text: string;
  readonly metrics: HumanPatternMetrics;
}

const placeholderPattern = /(⟦[^⟧]+⟧)/g;

function preservePlaceholders(text: string, transform: (segment: string) => string): string {
  return text
    .split(placeholderPattern)
    .map((segment, index) => (index % 2 === 1 ? segment : transform(segment)))
    .join("");
}

export function analyzeHumanPatterns(input: string) {
  return {
    readability: analyzeReadability(input),
    grammar: analyzeGrammarVariance(input),
    punctuation: analyzePunctuationVariance(input),
  };
}

export function applyHumanPatterns(input: string, profile: Partial<HumanizationProfile> = {}): HumanPatternResult {
  const resolved = resolveHumanizationProfile(profile);
  const transformations: string[] = [];

  const syntax = preservePlaceholders(input, (segment) => transformSyntax(segment, resolved).text);
  let current = syntax;
  if (current !== input) {
    transformations.push("syntax");
  }

  const discourse = preservePlaceholders(current, (segment) => transformDiscourse(segment, resolved).text);
  if (discourse !== current) {
    transformations.push("discourse");
  }
  current = discourse;

  const punctuation = preservePlaceholders(current, (segment) => mutatePunctuation(segment, resolved.strength));
  if (punctuation !== current) {
    transformations.push("punctuation");
  }
  current = punctuation;

  const grammar = preservePlaceholders(current, (segment) => rebalanceGrammar(segment, resolved.strength));
  if (grammar !== current) {
    transformations.push("grammar");
  }
  current = grammar;

  return {
    text: current,
    metrics: {
      readability: analyzeReadability(current),
      grammar: analyzeGrammarVariance(current),
      punctuation: analyzePunctuationVariance(current),
      transformations,
    },
  };
}
