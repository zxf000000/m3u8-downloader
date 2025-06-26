import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M3U8 Video Downloader",
  description: "Download videos from M3U8 playlists with multi-threaded downloading, progress tracking, and download history management.",
  keywords: ["m3u8", "video downloader", "streaming", "download", "playlist"],
  authors: [{ name: "M3U8 Downloader Team" }],
  creator: "M3U8 Downloader",
  publisher: "M3U8 Downloader",
  icons: {
    icon: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
      { url: "/logo-icon.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/logo-icon.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logo-icon.svg",
        color: "#3B82F6",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "M3U8 Video Downloader",
    description: "Download videos from M3U8 playlists with multi-threaded downloading, progress tracking, and download history management.",
    type: "website",
    locale: "en_US",
    siteName: "M3U8 Downloader",
  },
  twitter: {
    card: "summary_large_image",
    title: "M3U8 Video Downloader",
    description: "Download videos from M3U8 playlists with multi-threaded downloading, progress tracking, and download history management.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
