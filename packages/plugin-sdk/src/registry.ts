import type { DetectorPlugin, MutationPlugin, PluginManifest, PluginContext, ScoringPlugin, ValidationPlugin } from "./index.js";

export type PluginKind = "mutation" | "validation" | "detector" | "scoring";

export interface RegisteredPlugin<TPlugin> {
  readonly kind: PluginKind;
  readonly plugin: TPlugin;
}

export interface PluginRegistrySnapshot {
  readonly mutation: readonly string[];
  readonly validation: readonly string[];
  readonly detector: readonly string[];
  readonly scoring: readonly string[];
}

function cloneManifest(manifest: PluginManifest): PluginManifest {
  return Object.freeze({ ...manifest });
}

function validateManifest(manifest: PluginManifest): void {
  if (manifest.name.trim().length === 0) {
    throw new Error("Plugin name must not be empty.");
  }
  if (manifest.version.trim().length === 0) {
    throw new Error("Plugin version must not be empty.");
  }
  if (manifest.engine.trim().length === 0) {
    throw new Error("Plugin engine must not be empty.");
  }
}

function pluginKey(manifest: PluginManifest): string {
  return `${manifest.name}@${manifest.version}`;
}

export class PluginRegistry {
  private readonly mutationPlugins = new Map<string, MutationPlugin>();
  private readonly validationPlugins = new Map<string, ValidationPlugin>();
  private readonly detectorPlugins = new Map<string, DetectorPlugin>();
  private readonly scoringPlugins = new Map<string, ScoringPlugin>();

  registerMutation(plugin: MutationPlugin): void {
    validateManifest(plugin.manifest);
    this.mutationPlugins.set(pluginKey(plugin.manifest), plugin);
  }

  registerValidation(plugin: ValidationPlugin): void {
    validateManifest(plugin.manifest);
    this.validationPlugins.set(pluginKey(plugin.manifest), plugin);
  }

  registerDetector(plugin: DetectorPlugin): void {
    validateManifest(plugin.manifest);
    this.detectorPlugins.set(pluginKey(plugin.manifest), plugin);
  }

  registerScoring(plugin: ScoringPlugin): void {
    validateManifest(plugin.manifest);
    this.scoringPlugins.set(pluginKey(plugin.manifest), plugin);
  }

  snapshot(): PluginRegistrySnapshot {
    return {
      mutation: Array.from(this.mutationPlugins.keys()).sort(),
      validation: Array.from(this.validationPlugins.keys()).sort(),
      detector: Array.from(this.detectorPlugins.keys()).sort(),
      scoring: Array.from(this.scoringPlugins.keys()).sort(),
    };
  }

  mutate(input: string, context: PluginContext): string {
    let current = input;
    for (const plugin of this.mutationPlugins.values()) {
      current = plugin.mutate(current, { ...context, manifest: cloneManifest(context.manifest) });
    }
    return current;
  }

  validate(input: string, context: PluginContext): readonly string[] {
    const issues: string[] = [];
    for (const plugin of this.validationPlugins.values()) {
      issues.push(...plugin.validate(input, { ...context, manifest: cloneManifest(context.manifest) }));
    }
    return issues;
  }

  detect(input: string, context: PluginContext): number {
    const scores = Array.from(this.detectorPlugins.values(), (plugin) => plugin.detect(input, { ...context, manifest: cloneManifest(context.manifest) }));
    return scores.length === 0 ? 0 : scores.reduce((sum, value) => sum + value, 0) / scores.length;
  }

  score(input: string, context: PluginContext): number {
    const scores = Array.from(this.scoringPlugins.values(), (plugin) => plugin.score(input, { ...context, manifest: cloneManifest(context.manifest) }));
    return scores.length === 0 ? 0 : scores.reduce((sum, value) => sum + value, 0) / scores.length;
  }
}
