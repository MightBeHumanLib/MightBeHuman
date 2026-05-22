import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { withDocsBasePath } from "../lib/base-path.js";

export const metadata: Metadata = {
  title: {
    default: "MightBeHuman Docs",
    template: "%s · MightBeHuman Docs",
  },
  description: "Documentation for the local-first humanization platform",
  applicationName: "MightBeHuman Docs",
  icons: {
    icon: withDocsBasePath("/logo.png"),
    apple: withDocsBasePath("/logo.png"),
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
