import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MineralView",
  description:
    "MineralView Phase 1 application providing Owner Intelligence, mineral data exploration, and advanced analytics.",
  authors: [{ name: "MineralView" }],
  openGraph: {
    title: "MineralView Phase 1",
    description:
      "Owner Intelligence, mineral data exploration, and advanced analysis for the MineralView platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MineralView Phase 1",
    description:
      "Owner Intelligence and mineral analytics for mineral owners and professionals.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
