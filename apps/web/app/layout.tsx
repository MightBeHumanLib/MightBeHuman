import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MightBeHuman",
    template: "%s · MightBeHuman",
  },
  description: "Local-first algorithmic writing transformation platform",
  applicationName: "MightBeHuman",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "MightBeHuman",
    description: "Local-first algorithmic writing transformation platform",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MightBeHuman",
    description: "Local-first algorithmic writing transformation platform",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
