import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fontsource/noto-sans/latin-500.css";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoD Atlas",
  description: "An interactive map of real-world CoD locations, missions and multiplayer maps.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

/**
 * Root layout shared by all pages in the application.
 * Applies the global fonts, styles, and base HTML structure.
 *
 * @param props Root layout properties
 * @param props.children The page or nested layout rendered inside the root layout
 * @returns The application's root HTML layout
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
