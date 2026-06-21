"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Index {
  name: string;
  value: number;
  change: number;
  change_pct: number;
}

const SECTIONS = [
  {
    flag: "🇹🇼",
    title: "台股專區",
    color: "from-red-500 to-orange-500",
    modules: [
      { href: "/tw", icon: "📡", title: "台股飆股雷達", desc: "80 檔台股掃描", tier: "free" },
      { href: "/short-term", icon: "⚡", title: "短線狙擊手", desc: "1-10 天短打", tier: "vip" },
      { href: "/swing", icon: "📈", title: "波段研究所", desc: "1-3 個月波段", tier: "vip" },
      { href: "/tw/rank", icon: "🏆", title: "台股飆股榜", desc: "每日 Top 5 + Top 10", tier: "free" },
    ],
  },
  {
    flag: "🇺🇸",
    title: "美股專區",
    color: "from-blue-500 to-cyan-500",
    modules: [
      { href: "/us", icon: "📡", title: "美股飆股雷達", desc: "27 檔美股掃描", tier: "free" },
      { href: "/double", icon: "🚀", title: "翻倍股雷達", desc: "AI/機器人/軍工/低軌", tier: "vip" },
      { href: "/us/rank", icon: "💪", title: "美股強勢榜", desc: "每日 Top 5 + Top 10", tier: "free" },
    ],
  },
  {
    flag: "🇭🇰",
    title: "港股專區",
    color: "from-yellow-500 to-orange-500",
    modules: [
      { href: "/hk", icon: "📡", title: "港股飆股雷達", desc: "恆生指數成份股", tier: "free" },
      { href: "/hk/rank", icon: "💰", title: "港股資金榜", desc: "每日 Top 5 + Top 10", tier: "free" },
    ],
  },
];

export default function Home() {
  const [indices, setIndices] = useState<Index[]>([
    { name: "台灣加權", value: 0, change: 0, change_pct: 0 },
    { name: "櫃買指數", value: 0, change: 0, change_pct: 0 },
    { name: "道瓊工業", value: 0, change: 0, change_pct: 0 },
    { name: "S&P 500", value: 0, change: 0, change_pct: 0 },
    { name: "那斯達克", value: 0, change: 0, change_pct: 0 },
    { name: "恆生指數", value: 0, change: 0, change_pct: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/indices")
      .then(r => r.json())
      .then(data => {
        if (data.success) setIndices(data.indices);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen p-8">
      <header className="mb-10 text-center">
        <h1 className="text-6xl font-bold gradient-text mb-3">AI 飆股研究中心</h1>
        <p className="text-gray-400 text-lg mb-4">
          不是叫你亂追高 — 用 AI 每天篩出<strong className="text-yellow-400">強勢股、風險股、可觀察股</strong>，即時推播進出場訊號
        </p>
        <div className="inline-flex gap-2 text-sm">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">Telegram 推播 ✓</span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">LINE 推播 ✓</span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">即時訊號 ✓</span>
        </div>
        <div className="mt-4">
          <Link href="/pricing" className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold">
            👑 升級 VIP · 月費 NT$690 起
          </Link>
        </div>
      </header>

      {/* 大盤指數 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">
          📊 即時大盤指數 {loading && <span className="text-xs text-gray-500">(載入中...)</span>}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
          {indices.map((idx) => (
            <div key={idx.name} className="card text-center">
              <div className="text-xs text-gray-400 mb-1">{idx.name}</div>
              <div className="text-xl font-bold">
                {idx.value > 0 ? idx.value.toLocaleString() : "--"}
              </div>
              <div className={`text-sm ${idx.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                {idx.value > 0 ? (
                  <>
                    {idx.change_pct >= 0 ? "▲" : "▼"} {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)} ({idx.change_pct >= 0 ? "+" : ""}{idx.change_pct.toFixed(2)}%)
                  </>
                ) : "--"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 三大市場分區塊 */}
      {SECTIONS.map((sec) => (
        <section key={sec.title} className="mb-10">
          <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${sec.color} bg-clip-text text-transparent border-b border-white/10 pb-2`}>
            {sec.flag} {sec.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sec.modules.map((m) => (
              <Link key={m.href} href={m.href} className="card block relative">
                {m.tier === "vip" && (
                  <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-yellow-500/30 text-yellow-300 rounded">VIP</span>
                )}
                {m.tier === "free" && (
                  <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-green-500/30 text-green-300 rounded">FREE</span>
                )}
                <div className="text-4xl mb-3">{m.icon}</div>
                <h3 className="text-lg font-bold mb-1">{m.title}</h3>
                <p className="text-sm text-gray-400">{m.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* VIP 專區 */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-4 text-pink-400 border-b border-pink-500/30 pb-2">
          👑 VIP 自選股 + 推播
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/vip" className="card block">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-bold mb-1">VIP 自選股追蹤</h3>
            <p className="text-sm text-gray-400">每日續抱 / 減倉 / 停損通知</p>
          </Link>
          <Link href="/vip/notify" className="card block">
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="text-lg font-bold mb-1">Telegram / LINE 推播</h3>
            <p className="text-sm text-gray-400">即時訊號不漏接</p>
          </Link>
          <Link href="/vip/report" className="card block">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-lg font-bold mb-1">每週產業報告</h3>
            <p className="text-sm text-gray-400">VIP 限定深度分析</p>
          </Link>
        </div>
      </section>

      {/* 免責聲明 */}
      <section className="mt-12 max-w-4xl mx-auto">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <h3 className="font-bold text-yellow-300 mb-2">⚠️ 免責聲明</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            本平台為研究分析工具，所有內容僅供參考，不構成任何投資建議。
            投資有風險，決策需謹慎。使用者應自行判斷風險並承擔投資結果。
            本站不負責任何因使用本平台資訊所造成的損失。
          </p>
        </div>
      </section>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>蝦董 AI 營運長 · v1.0 · 2026-06-21</p>
        <p className="mt-2">每 5 分鐘掃描 · 每日 07:00 / 08:00 / 20:00 自動推播</p>
      </footer>
    </main>
  );
}