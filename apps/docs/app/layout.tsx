import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MightBeHuman Docs",
    template: "%s · MightBeHuman Docs",
  },
  description: "Documentation for the local-first humanization platform",
  applicationName: "MightBeHuman Docs",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
