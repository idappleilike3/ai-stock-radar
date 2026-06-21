"use client";
import { useState } from "react";
import Link from "next/link";

const FEATURES = [
  { icon: "⚡", title: "即時訊號", desc: "訊號一出，立刻通知，不延遲" },
  { icon: "📡", title: "Telegram 推播", desc: "整合 Telegram Bot，訊息直達手機" },
  { icon: "💬", title: "LINE 推播", desc: "整合 LINE Messaging API" },
  { icon: "🎯", title: "完整進出場價", desc: "進場區間 / 停損 / 目標 1+2" },
  { icon: "📊", title: "自選股追蹤（10 檔）", desc: "每日續抱 / 減倉 / 停損提醒" },
  { icon: "📈", title: "每週產業報告", desc: "VIP 限定深度分析" },
  { icon: "⚡", title: "短線狙擊手", desc: "1-10 天短打訊號" },
  { icon: "📈", title: "波段研究所", desc: "1-3 個月波段策略" },
  { icon: "🚀", title: "翻倍股雷達", desc: "1 年期高成長候選" },
];

export default function VIPPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [holdings, setHoldings] = useState([
    { ticker: "2330", name: "台積電", cost: 1100, shares: 100, current: 2410 },
    { ticker: "TSM", name: "台積電ADR", cost: 200, shares: 50, current: 462 },
  ]);

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <Link href="/" className="text-gray-400 hover:text-white text-sm">← 返回首頁</Link>

      <header className="mt-4 mb-10 text-center">
        <h1 className="text-5xl font-bold gradient-text mb-3">👑 VIP 會員中心</h1>
        <p className="text-gray-400">即時推播 · 進出場策略 · 自選股追蹤 · 深度分析</p>
      </header>

      {/* 功能展示 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">VIP 9 大功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="card">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-bold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 自選股追蹤（示意） */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">📊 你的自選股</h2>
        <div className="card">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-2">代號</th>
                <th className="text-left py-2">名稱</th>
                <th className="text-right py-2">成本</th>
                <th className="text-right py-2">股數</th>
                <th className="text-right py-2">現價</th>
                <th className="text-right py-2">損益</th>
                <th className="text-center py-2">AI 建議</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {holdings.map((h) => {
                const pnl = ((h.current - h.cost) / h.cost) * 100;
                const pnl_amt = (h.current - h.cost) * h.shares;
                return (
                  <tr key={h.ticker} className="border-b border-gray-800">
                    <td className="py-3">{h.ticker}</td>
                    <td className="py-3">{h.name}</td>
                    <td className="text-right py-3">${h.cost}</td>
                    <td className="text-right py-3">{h.shares}</td>
                    <td className="text-right py-3">${h.current}</td>
                    <td className={`text-right py-3 ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {pnl >= 0 ? "+" : ""}{pnl.toFixed(1)}% (${pnl_amt >= 0 ? "+" : ""}{pnl_amt.toFixed(0)})
                    </td>
                    <td className="text-center py-3">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">續抱</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="新增股票代號 (例: 2330)"
              className="flex-1 bg-gray-800 px-4 py-2 rounded text-white"
            />
            <button className="px-4 py-2 bg-yellow-500 text-black font-bold rounded">
              新增
            </button>
          </div>
        </div>
      </section>

      {/* 推播設定 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🔔 推播設定</h2>
        <div className="card space-y-3">
          <label className="flex items-center justify-between">
            <span>Telegram 推播</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between">
            <span>LINE 推播</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between">
            <span>停損出場通知</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between">
            <span>達標出場通知</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between">
            <span>回踩加碼點</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between">
            <span>急殺警示 (-5%)</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
        </div>
      </section>

      {/* 升級 CTA */}
      {!isLoggedIn && (
        <section className="text-center mb-12">
          <Link href="/pricing" className="inline-block px-10 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-lg hover:scale-105 transition-all">
            👑 升級 VIP · 月費 NT$690 起 →
          </Link>
        </section>
      )}

      {/* 免責聲明 */}
      <section className="mt-12 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="font-bold text-yellow-300 mb-2">⚠️ 免責聲明</h3>
        <p className="text-sm text-gray-300">
          本平台為研究分析工具，不構成任何投資建議。
          投資有風險，使用者應自行判斷風險並承擔投資結果。
        </p>
      </section>
    </main>
  );
}