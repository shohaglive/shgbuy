import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Suspense } from "react";
import { BagLink, BagLinkView } from "@/components/cart/bag-link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-canvas focus:p-3">
          Skip to content
        </a>
        <Header
          bag={
            <Suspense fallback={<BagLinkView />}>
              <BagLink />
            </Suspense>
          }
        />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
