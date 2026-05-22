export interface PluginManifest {
  readonly name: string;
  readonly version: string;
  readonly engine: string;
}

export interface PluginContext {
  readonly manifest: PluginManifest;
  readonly logger: Pick<Console, "info" | "warn" | "error">;
}

export interface MutationPlugin {
  readonly manifest: PluginManifest;
  mutate(input: string, context: PluginContext): string;
}

export interface ValidationPlugin {
  readonly manifest: PluginManifest;
  validate(input: string, context: PluginContext): readonly string[];
}

export interface DetectorPlugin {
  readonly manifest: PluginManifest;
  detect(input: string, context: PluginContext): number;
}

export interface ScoringPlugin {
  readonly manifest: PluginManifest;
  score(input: string, context: PluginContext): number;
}

export { PluginRegistry, type PluginKind, type PluginRegistrySnapshot } from "./registry.js";
