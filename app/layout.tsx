import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 飆股研究中心",
  description: "短線狙擊 / 波段研究 / 翻倍股雷達 / VIP 自選股",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}