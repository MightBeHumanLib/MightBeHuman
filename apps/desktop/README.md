Build and packaging

Run the Electron packaging locally with:

```bash
# from workspace root
pnpm --filter @mightbehuman/desktop run build:electron
```

Artifacts will be placed in `dist/` at the repository root (AppImage, .exe, .dmg depending on platform).
