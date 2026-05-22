import { app, BrowserWindow } from "electron";

import { loadRuntimeConfig } from "@mightbehuman/config-system";

export interface DesktopWindowOptions {
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly url: string;
}

export function resolveStartUrl(): string {
  return loadRuntimeConfig().electronStartUrl;
}

export function getDesktopWindowOptions(): DesktopWindowOptions {
  return {
    width: 1440,
    height: 960,
    title: "MightBeHuman",
    url: resolveStartUrl(),
  };
}

export function createDesktopWindow(): BrowserWindow {
  const options = getDesktopWindowOptions();
  const window = new BrowserWindow({
    width: options.width,
    height: options.height,
    title: options.title,
    backgroundColor: "#050505",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      enableBlinkFeatures: "CSSVariables",
    },
  });

  void window.loadURL(options.url);
  window.once("ready-to-show", () => window.show());
  return window;
}

async function bootstrap(): Promise<void> {
  await app.whenReady();
  createDesktopWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createDesktopWindow();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

if (process.env.VITEST !== "true" && process.env.ELECTRON_RUN_AS_NODE !== "1") {
  void bootstrap();
}
