# Architecture Overview

MightBeHuman is a local-first TypeScript monorepo built around a deterministic humanization pipeline.

## Layering

- `apps/cli` provides command-line access to the engine.
- `apps/api` exposes the same engine through HTTP.
- `packages/core-engine` coordinates analysis, preservation, and mutation.
- `packages/detector-lab` and `packages/benchmarking` evaluate output quality.
- `packages/*` define small, testable subsystems with explicit contracts.

## Pipeline shape

1. Parse and tokenize input.
2. Protect markdown, citations, and named entities.
3. Measure rhythm, stylometry, and entropy.
4. Mutate sentence cadence while preserving meaning.
5. Restore protected spans.
6. Score the result and record benchmark signals.

## Design goals

- Deterministic behavior.
- Local execution only.
- Independent testability of each stage.
- Minimal surface area for future plugins and workers.
