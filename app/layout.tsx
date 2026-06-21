import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "飆股研究中心 Pro | AI 找出下一檔飆股",
  description: "結合技術面、籌碼面、財報面、題材面、資金面，每天自動掃描台股美股，AI 評分 0-100 分，告訴你進場點、停損、目標價。",
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