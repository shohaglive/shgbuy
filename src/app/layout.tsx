import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// Serif display face for headings (see --font-display in globals.css).
const displayFont = Cormorant_Garamond({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Sans body and UI face for labels, buttons, and copy (see --font-sans).
const bodyFont = Inter({
  variable: "--font-body-face",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "shgbuy",
    template: "%s | shgbuy",
  },
  description: "Considered fashion, crafted to last. Shop new arrivals, women, men and accessories.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">{children}</body>
    </html>
  );
}
