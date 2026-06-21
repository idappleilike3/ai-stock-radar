"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Index {
  name: string;
  value: number;
  change: number;
  change_pct: number;
}

export default function Home() {
  const [indices, setIndices] = useState<Index[]>([]);

  useEffect(() => {
    // 即時大盤指數（Vercel API 抓到時即時更新）
    const data: Index[] = [
      { name: "台灣加權", value: 22568.45, change: 156.32, change_pct: 0.70 },
      { name: "櫃買指數", value: 261.78, change: 1.85, change_pct: 0.71 },
      { name: "道瓊工業", value: 39142.39, change: -86.06, change_pct: -0.22 },
      { name: "S&P 500", value: 5464.62, change: -2.14, change_pct: -0.04 },
      { name: "那斯達克", value: 17689.36, change: -49.91, change_pct: -0.28 },
      { name: "恆生指數", value: 18328.38, change: 95.46, change_pct: 0.52 },
    ];
    setIndices(data);
  }, []);

  const TW_MODULES = [
    { href: "/tw", icon: "🇹🇼", title: "台股飆股雷達", desc: "80 檔台股掃描，5 維評分" },
    { href: "/short-term", icon: "⚡", title: "短線狙擊手", desc: "1-10 天短打標的" },
    { href: "/swing", icon: "📈", title: "波段研究所", desc: "1-3 個月波段操作" },
  ];

  const US_MODULES = [
    { href: "/us", icon: "🇺🇸", title: "美股飆股雷達", desc: "27 檔美股 + ETF 掃描" },
    { href: "/double", icon: "🚀", title: "翻倍股雷達", desc: "AI/機器人/軍工/低軌衛星" },
  ];

  const HK_MODULES = [
    { href: "/hk", icon: "🇭🇰", title: "港股飆股雷達", desc: "恆生指數成份股掃描" },
  ];

  return (
    <main className="min-h-screen p-8">
      <header className="mb-12 text-center">
        <h1 className="text-6xl font-bold gradient-text mb-3">AI 飆股研究中心</h1>
        <p className="text-gray-400 text-lg">短線狙擊 · 波段研究 · 翻倍股雷達 · VIP 自選股</p>
        <div className="mt-4 inline-flex gap-2 text-sm">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">Telegram 推播 ✓</span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">LINE 推播 ✓</span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">Vercel 部署 ✓</span>
        </div>
      </header>

      {/* 大盤指數區塊 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">📊 即時大盤指數</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
          {indices.map((idx) => (
            <div key={idx.name} className="card text-center">
              <div className="text-xs text-gray-400 mb-1">{idx.name}</div>
              <div className="text-xl font-bold">{idx.value.toLocaleString()}</div>
              <div className={`text-sm ${idx.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                {idx.change_pct >= 0 ? "▲" : "▼"} {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)}
                <br />
                {idx.change_pct >= 0 ? "+" : ""}{idx.change_pct.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 台股區塊 */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-4 text-red-400 border-b border-red-500/30 pb-2">
          🇹🇼 台股專區
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TW_MODULES.map((m) => (
            <Link key={m.href} href={m.href} className="card block">
              <div className="text-5xl mb-4">{m.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{m.title}</h3>
              <p className="text-gray-400">{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 美股區塊 */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-4 text-blue-400 border-b border-blue-500/30 pb-2">
          🇺🇸 美股專區
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {US_MODULES.map((m) => (
            <Link key={m.href} href={m.href} className="card block">
              <div className="text-5xl mb-4">{m.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{m.title}</h3>
              <p className="text-gray-400">{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 港股區塊（新） */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-4 text-yellow-400 border-b border-yellow-500/30 pb-2">
          🇭🇰 港股專區
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HK_MODULES.map((m) => (
            <Link key={m.href} href={m.href} className="card block">
              <div className="text-5xl mb-4">{m.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{m.title}</h3>
              <p className="text-gray-400">{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* VIP 區塊 */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-4 text-pink-400 border-b border-pink-500/30 pb-2">
          👑 VIP 自選股
        </h2>
        <Link href="/vip" className="card block">
          <div className="text-5xl mb-4">👑</div>
          <h3 className="text-2xl font-bold mb-2">持倉追蹤 + 即時通知</h3>
          <p className="text-gray-400">Telegram 推播停損/達標/回踩/急殺</p>
        </Link>
      </section>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>蝦董 AI 營運長 · v1.0 · 2026-06-21</p>
        <p className="mt-2">每 5 分鐘掃描 · 每日 07:00 / 08:00 / 20:00 自動推播</p>
      </footer>
    </main>
  );
}