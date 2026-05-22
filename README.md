# MightBeHuman

![MightBeHuman logo](brand/logo.png)

Local-first, algorithmic writing transformation platform built as a TypeScript monorepo.

## Open Source

- License: MIT
- Contributions: see [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security: see [SECURITY.md](SECURITY.md)

## What is implemented

- Core engine for analysis, rhythm mutation, preservation, and scoring
- CLI for `analyze`, `humanize`, `compare`, `detect`, `score`, `preserve`, `export`, `benchmark`, and `pipeline-debug`
- Fastify API for local HTTP orchestration
- Next.js web console for live editing and score inspection
- Electron desktop shell with secure defaults
- Detector lab, benchmarking, and plugin registry foundations

## Getting started

```bash
npm install
npm test
npm run typecheck
```

## Workspace layout

- `apps/cli` - command-line entrypoint
- `apps/api` - HTTP service
- `apps/web` - primary control console
- `apps/desktop` - Electron shell
- `apps/docs` - documentation site
- `packages/*` - engine, preservation, benchmarking, and SDK layers

## Docs

- [Architecture](docs/architecture.md)
- [CLI](docs/cli.md)
- [API](docs/api.md)
- [Deployment](docs/deployment.md)
- [Benchmarking](docs/benchmarking.md)
- [Plugin SDK](docs/plugin-sdk.md)
- [Brand guide](docs/brand.md)
