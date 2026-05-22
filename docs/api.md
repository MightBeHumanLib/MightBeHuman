# API

The API is a small Fastify service over the local core engine.

## Endpoints

- `GET /health`
- `POST /v1/analyze`
- `POST /v1/humanize`
- `POST /v1/compare`

## Design

- Stateless request handling.
- Shared engine contracts with the CLI and web UI.
- JSON-only payloads for predictable integration.
