"use client";
import { useEffect, useState } from "react";

interface Index {
  name: string;
  value: number;
  change: number;
  change_pct: number;
}

interface Stock {
  ticker: string;
  name: string;
  market: string;
  current_price: number;
  change_pct: number;
  ai_total: number;
  entry_zone: string;
  stop_loss: string;
  target1: string;
}

const TAB_MODULES = {
  tw: {
    name: "🇹🇼 台股",
    stocks: [
      { ticker: "2330", name: "台積電", market: "TW", current_price: 2410, change_pct: 1.05, ai_total: 85, entry_zone: "2361-2482", stop_loss: "2241", target1: "2747" },
      { ticker: "2454", name: "聯發科", market: "TW", current_price: 4390, change_pct: 2.3, ai_total: 78, entry_zone: "4302-4521", stop_loss: "4082", target1: "5004" },
      { ticker: "2317", name: "鴻海", market: "TW", current_price: 268, change_pct: -0.5, ai_total: 72, entry_zone: "263-276", stop_loss: "249", target1: "305" },
      { ticker: "2344", name: "華邦電", market: "TW", current_price: 218.5, change_pct: 9.8, ai_total: 82, entry_zone: "214-225", stop_loss: "203", target1: "249" },
      { ticker: "2885", name: "元大金", market: "TW", current_price: 68, change_pct: 4.4, ai_total: 74, entry_zone: "66-70", stop_loss: "63", target1: "77" },
    ],
  },
  us: {
    name: "🇺🇸 美股",
    stocks: [
      { ticker: "NVDA", name: "NVIDIA", market: "US", current_price: 210, change_pct: 1.2, ai_total: 88, entry_zone: "206-217", stop_loss: "195", target1: "240" },
      { ticker: "TSM", name: "台積電ADR", market: "US", current_price: 462, change_pct: 6.94, ai_total: 84, entry_zone: "453-476", stop_loss: "430", target1: "527" },
      { ticker: "MU", name: "Micron", market: "US", current_price: 1134, change_pct: 5.5, ai_total: 81, entry_zone: "1111-1168", stop_loss: "1054", target1: "1293" },
      { ticker: "MRVL", name: "Marvell", market: "US", current_price: 310, change_pct: 7.27, ai_total: 80, entry_zone: "304-320", stop_loss: "289", target1: "354" },
      { ticker: "AMD", name: "AMD", market: "US", current_price: 540, change_pct: 3.2, ai_total: 76, entry_zone: "527-554", stop_loss: "502", target1: "615" },
    ],
  },
  hk: {
    name: "🇭🇰 港股",
    stocks: [
      { ticker: "0700", name: "騰訊控股", market: "HK", current_price: 380, change_pct: 1.8, ai_total: 80, entry_zone: "372-392", stop_loss: "353", target1: "434" },
      { ticker: "9988", name: "阿里巴巴", market: "HK", current_price: 78, change_pct: 2.5, ai_total: 75, entry_zone: "76-80", stop_loss: "73", target1: "89" },
      { ticker: "3690", name: "美團", market: "HK", current_price: 115, change_pct: 3.8, ai_total: 78, entry_zone: "113-118", stop_loss: "107", target1: "131" },
      { ticker: "1810", name: "小米", market: "HK", current_price: 18.5, change_pct: 5.2, ai_total: 73, entry_zone: "18-19", stop_loss: "17", target1: "21" },
    ],
  },
};

export default function Home() {
  const [indices, setIndices] = useState<Index[]>([]);
  const [activeTab, setActiveTab] = useState<"tw" | "us" | "hk">("tw");
  const [activeSection, setActiveSection] = useState<string>("dashboard");
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

  const currentStocks = TAB_MODULES[activeTab].stocks;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 動態背景 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#1a1a3e] to-[#0a0e27]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* 頂部導航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📡</div>
            <div>
              <div className="text-xl font-bold gradient-text">AI 飆股研究中心</div>
              <div className="text-xs text-gray-400">台股 · 美股 · 港股 · 即時推播</div>
            </div>
          </div>
          <div className="hidden md:flex gap-6 text-sm text-gray-300">
            <a href="#dashboard" className="hover:text-yellow-400 transition">首頁</a>
            <a href="#stocks" className="hover:text-yellow-400 transition">選股</a>
            <a href="#portfolio" className="hover:text-yellow-400 transition">健檢</a>
            <a href="#pricing" className="hover:text-yellow-400 transition">定價</a>
            <a href="/admin" className="hover:text-yellow-400 transition">後台</a>
          </div>
          <a href="#pricing" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold text-sm">
            👑 VIP
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section id="dashboard" className="max-w-7xl mx-auto px-6 pt-16 pb-8 text-center">
        <div className="inline-block mb-4 px-4 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-300 text-sm">
          🔥 即時 AI 分析 · 每日更新 · VIP 月費 NT$690 起
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-4">
          <span className="gradient-text">AI 飆股研究中心</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          不是叫你亂追高 — 用 AI 每天篩出 <span className="text-yellow-400 font-bold">強勢股</span>、
          <span className="text-red-400 font-bold">風險股</span>、<span className="text-blue-400 font-bold">可觀察股</span>，
          <br/>即時推播進出場訊號
        </p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap text-sm">
          <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-green-300">✓ Telegram 推播</span>
          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-blue-300">✓ LINE 推播</span>
          <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300">✓ 即時訊號</span>
          <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-300">✓ AI 持股健檢</span>
        </div>
      </section>

      {/* 大盤指數 */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>📊</span><span>即時大盤指數</span>
          {loading && <span className="text-xs text-gray-500 ml-auto">載入中...</span>}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {indices.map((idx) => (
            <div
              key={idx.name}
              className="glass-card"
            >
              <div className="text-xs text-gray-400 mb-1">{idx.name}</div>
              <div className="text-xl font-bold">
                {idx.value > 0 ? idx.value.toLocaleString() : "--"}
              </div>
              <div className={`text-xs ${idx.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                {idx.value > 0 ? (
                  <>{idx.change_pct >= 0 ? "▲" : "▼"} {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)} ({idx.change_pct >= 0 ? "+" : ""}{idx.change_pct.toFixed(2)}%)</>
                ) : "--"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 飆股雷達 (Tabs) */}
      <section id="stocks" className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🎯</span><span>飆股雷達</span>
          <span className="ml-auto text-xs text-gray-500">每日 5 檔 · A 級推薦</span>
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(Object.keys(TAB_MODULES) as Array<keyof typeof TAB_MODULES>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                activeTab === key
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black scale-105"
                  : "glass-card text-gray-300 hover:text-white"
              }`}
            >
              {TAB_MODULES[key].name}
            </button>
          ))}
        </div>

        {/* 股票卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentStocks.map((s) => (
            <div key={s.ticker} className="glass-card-hover">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{s.ticker}</h3>
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">A級</span>
                  </div>
                  <div className="text-sm text-gray-400">{s.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${s.current_price.toLocaleString()}</div>
                  <div className={`text-sm font-bold ${s.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {s.change_pct >= 0 ? "+" : ""}{s.change_pct}%
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-lg p-3 mb-3">
                <div className="text-xs text-yellow-300 mb-1">AI 總評</div>
                <div className="text-3xl font-black text-yellow-400">{s.ai_total}<span className="text-sm text-gray-400">/100</span></div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">進場</div>
                  <div className="text-green-400 font-bold">{s.entry_zone}</div>
                </div>
                <div>
                  <div className="text-gray-500">停損</div>
                  <div className="text-red-400 font-bold">${s.stop_loss}</div>
                </div>
                <div>
                  <div className="text-gray-500">目標</div>
                  <div className="text-yellow-400 font-bold">${s.target1}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 功能區塊 */}
      <section id="portfolio" className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>👑</span><span>VIP 功能</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/portfolio" className="glass-card-hover relative">
            <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-red-500 text-white rounded font-bold animate-pulse">HOT</span>
            <div className="text-5xl mb-3">🩺</div>
            <h3 className="text-xl font-bold mb-2">AI 持股健檢</h3>
            <p className="text-sm text-gray-400">輸入持股 → 立刻告訴你續抱/停利/停損/減碼</p>
          </a>
          <a href="/vip" className="glass-card-hover">
            <div className="text-5xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2">自選股追蹤</h3>
            <p className="text-sm text-gray-400">每日續抱 / 減倉 / 停損通知</p>
          </a>
          <a href="/admin" className="glass-card-hover">
            <div className="text-5xl mb-3">🔔</div>
            <h3 className="text-xl font-bold mb-2">即時推播</h3>
            <p className="text-sm text-gray-400">Telegram + LINE 整合</p>
          </a>
          <a href="/admin" className="glass-card-hover">
            <div className="text-5xl mb-3">📈</div>
            <h3 className="text-xl font-bold mb-2">產業報告</h3>
            <p className="text-sm text-gray-400">VIP 限定深度分析</p>
          </a>
        </div>
      </section>

      {/* 定價 */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>💎</span><span>會員方案</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card">
            <div className="text-xl font-bold mb-2 text-gray-300">免費</div>
            <div className="text-4xl font-black mb-1">NT$0</div>
            <div className="text-sm text-gray-400 mb-4">/永久</div>
            <ul className="text-sm space-y-2 text-gray-400">
              <li>✓ 每日 3 檔延遲訊號</li>
              <li>✓ 基礎技術分析</li>
              <li>✓ 大盤指數</li>
            </ul>
            <button className="w-full mt-4 py-2 bg-gray-700 rounded text-gray-300 text-sm">免費使用</button>
          </div>
          <div className="glass-card-hover border-2 border-yellow-400">
            <div className="text-xs text-yellow-400 mb-1">⭐ 熱門</div>
            <div className="text-xl font-bold mb-2 text-yellow-400">VIP 月費</div>
            <div className="text-4xl font-black mb-1">NT$690</div>
            <div className="text-sm text-gray-400 mb-4">/每月</div>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>✓ 即時訊號（不延遲）</li>
              <li>✓ Telegram + LINE 推播</li>
              <li>✓ 完整進出場價</li>
              <li>✓ 自選股 10 檔</li>
            </ul>
            <a href="/payment/usdt" className="block w-full mt-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded text-white font-bold text-sm text-center">立即升級</a>
          </div>
          <div className="glass-card-hover">
            <div className="text-xs text-orange-400 mb-1">💰 省 NT$190</div>
            <div className="text-xl font-bold mb-2 text-orange-400">VIP 季費</div>
            <div className="text-4xl font-black mb-1">NT$1,880</div>
            <div className="text-sm text-gray-400 mb-4">/每季</div>
            <ul className="text-sm space-y-2 text-gray-400">
              <li>✓ 月費所有功能</li>
              <li>✓ 額外 5 檔自選股</li>
            </ul>
            <a href="/payment/usdt" className="block w-full mt-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded text-white font-bold text-sm text-center">省錢首選</a>
          </div>
          <div className="glass-card-hover border-2 border-red-400">
            <div className="text-xs text-red-400 mb-1">🔥 最划算</div>
            <div className="text-xl font-bold mb-2 text-red-400">VIP 年費</div>
            <div className="text-4xl font-black mb-1">NT$6,800</div>
            <div className="text-sm text-gray-400 mb-4">/每年</div>
            <ul className="text-sm space-y-2 text-gray-400">
              <li>✓ 月費所有功能</li>
              <li>✓ 省 NT$1,480</li>
              <li>✓ 30 檔自選股</li>
            </ul>
            <a href="/payment/usdt" className="block w-full mt-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded text-white font-bold text-sm text-center">最划算</a>
          </div>
        </div>
      </section>

      {/* 免責聲明 */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="glass-card border-l-4 border-yellow-500">
          <h3 className="font-bold text-yellow-300 mb-2 flex items-center gap-2">
            <span>⚠️</span><span>免責聲明</span>
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            本平台為研究分析工具，所有內容僅供參考，不構成任何投資建議。
            投資有風險，過去績效不代表未來。使用者應自行判斷風險並承擔投資結果。
            本平台不負責任何因使用本平台資訊所造成的損失。
          </p>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-500 text-sm border-t border-white/10">
        <p>蝦董 AI 營運長 · v1.0 · 2026-06-21</p>
        <p className="mt-1">每 5 分鐘掃描 · 每日 07:00 / 08:00 / 20:00 自動推播</p>
      </footer>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s;
        }
        .glass-card-hover {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s;
          cursor: pointer;
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .glass-card-hover:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(245, 158, 11, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(245, 158, 11, 0.15);
        }
        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}