export type LanguageCode = string;

export interface HumanizationProfile {
  readonly language: LanguageCode;
  readonly strength: number;
  readonly preserveMarkdown: boolean;
  readonly preserveCitations: boolean;
  readonly enableSentenceSplits: boolean;
  readonly enableClauseRebalancing: boolean;
  readonly targetSentenceLength: number;
  readonly maxSentenceLength: number;
  readonly minSentenceLength: number;
}

export interface ResolvedHumanizationProfile extends HumanizationProfile {
  readonly strength: number;
}

export interface RuntimeConfig {
  readonly nodeEnv: string;
  readonly apiPort: number;
  readonly webPort: number;
  readonly docsPort: number;
  readonly electronStartUrl: string;
}

const DEFAULT_PROFILE: ResolvedHumanizationProfile = {
  language: "en",
  strength: 0.62,
  preserveMarkdown: true,
  preserveCitations: true,
  enableSentenceSplits: true,
  enableClauseRebalancing: true,
  targetSentenceLength: 18,
  maxSentenceLength: 34,
  minSentenceLength: 8,
};

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

export function resolveHumanizationProfile(
  profile: Partial<HumanizationProfile> = {},
): ResolvedHumanizationProfile {
  const strength = clamp(profile.strength ?? DEFAULT_PROFILE.strength, 0, 1);
  return {
    language: profile.language ?? DEFAULT_PROFILE.language,
    strength,
    preserveMarkdown: profile.preserveMarkdown ?? DEFAULT_PROFILE.preserveMarkdown,
    preserveCitations: profile.preserveCitations ?? DEFAULT_PROFILE.preserveCitations,
    enableSentenceSplits: profile.enableSentenceSplits ?? DEFAULT_PROFILE.enableSentenceSplits,
    enableClauseRebalancing:
      profile.enableClauseRebalancing ?? DEFAULT_PROFILE.enableClauseRebalancing,
    targetSentenceLength: Math.max(
      1,
      Math.round(profile.targetSentenceLength ?? DEFAULT_PROFILE.targetSentenceLength),
    ),
    maxSentenceLength: Math.max(
      2,
      Math.round(profile.maxSentenceLength ?? DEFAULT_PROFILE.maxSentenceLength),
    ),
    minSentenceLength: Math.max(
      1,
      Math.round(profile.minSentenceLength ?? DEFAULT_PROFILE.minSentenceLength),
    ),
  };
}

export function getDefaultHumanizationProfile(): ResolvedHumanizationProfile {
  return DEFAULT_PROFILE;
}

function readNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadHumanizationProfileFromEnv(env: NodeJS.ProcessEnv = process.env): Partial<HumanizationProfile> {
  return {
    ...(env.MBH_LANGUAGE === undefined ? {} : { language: env.MBH_LANGUAGE }),
    ...(env.MBH_STRENGTH === undefined ? {} : { strength: readNumber(env.MBH_STRENGTH, DEFAULT_PROFILE.strength) }),
    ...(env.MBH_PRESERVE_MARKDOWN === undefined ? {} : { preserveMarkdown: env.MBH_PRESERVE_MARKDOWN !== "false" }),
    ...(env.MBH_PRESERVE_CITATIONS === undefined ? {} : { preserveCitations: env.MBH_PRESERVE_CITATIONS !== "false" }),
    ...(env.MBH_ENABLE_SENTENCE_SPLITS === undefined ? {} : { enableSentenceSplits: env.MBH_ENABLE_SENTENCE_SPLITS !== "false" }),
    ...(env.MBH_ENABLE_CLAUSE_REBALANCING === undefined
      ? {}
      : { enableClauseRebalancing: env.MBH_ENABLE_CLAUSE_REBALANCING !== "false" }),
  };
}

export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return {
    nodeEnv: env.NODE_ENV ?? "development",
    apiPort: readNumber(env.API_PORT, 3000),
    webPort: readNumber(env.WEB_PORT, 3001),
    docsPort: readNumber(env.DOCS_PORT, 3002),
    electronStartUrl: env.ELECTRON_START_URL ?? "http://127.0.0.1:3001",
  };
}
