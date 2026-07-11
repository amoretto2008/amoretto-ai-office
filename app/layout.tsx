import type { Metadata, Viewport } from "next";
import { APP_CONFIG } from "@/lib/app-config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_CONFIG.name}｜${APP_CONFIG.moduleName}`,
  description:
    "AMORÉTTOを第1号実証店舗として育てる、AI投稿・口コミ返信・MEO文章確認・写真メモ提案の実証版です。",
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#14213D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
