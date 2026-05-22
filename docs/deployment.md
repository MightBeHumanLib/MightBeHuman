# Deployment

## Local development

- `npm install`
- `npm test`
- `npm run typecheck`
- `npm run dev`

## Containers

The repository includes a Dockerfile and Docker Compose stack for the local platform services.

## Notes

- Keep deployment targets local-first.
- Use the API as the shared backend for web and desktop clients.
- Keep runtime configuration in environment variables rather than hard-coded values.

## CI Release

- A GitHub Actions workflow (`.github/workflows/release.yml`) builds the web, exports the docs, packages the Electron desktop app for Linux (`AppImage`), Windows (`nsis`), and macOS (`dmg`), and uploads installers as release assets.
- The workflow creates a timestamped tag and a GitHub Release, then publishes the docs site to GitHub Pages.
- Ensure the repository has the default `GITHUB_TOKEN` permissions (`contents: write`) and the repo is on `main` branch. For macOS artifacts, the runner must be allowed for macOS builds.
