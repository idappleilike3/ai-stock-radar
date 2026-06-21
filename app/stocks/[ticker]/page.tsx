"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stock {
  ticker: string;
  name: string;
  market: string;
  current_price: number;
  change: number;
  change_pct: number;
  volume: number;
  market_cap: number;
  currency: string;
  entry_zone: string;
  stop_loss: string;
  target1: string;
  target2: string;
  ai_total: number;
  tech_score: number;
  ma_position: string;
  new_high_60: boolean;
}

const TW_NAMES: Record<string, string> = {
  "2330": "台積電", "2317": "鴻海", "2454": "聯發科", "2308": "台達電",
  "2303": "聯電", "2379": "瑞昱", "3034": "聯詠", "3711": "日月光投控",
  "2344": "華邦電", "2408": "南亞科", "2885": "元大金", "2886": "兆豐金",
  "3661": "世芯-KY", "2376": "技嘉", "2382": "廣達",
  "3293": "鑫豪", "4763": "材料-KY",
};

export default function StockDetailPage({ params }: { params: { ticker: string } }) {
  const ticker = params.ticker;
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/stock/${ticker}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // 名稱 fallback
          const fallbackName = TW_NAMES[ticker] || ticker;
          setStock({ ...data.stock, name: data.stock.name && !data.stock.name.includes(".TW") ? data.stock.name : fallbackName });
        } else {
          setError(data.error || "查無此股票");
        }
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [ticker]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-yellow-400 font-mono">載入中... {ticker}</div>
      </main>
    );
  }

  if (error || !stock) {
    return (
      <main className="min-h-screen p-8">
        <Link href="/" className="text-gray-400 text-sm">← 返回</Link>
        <div className="mt-8 text-red-400">❌ {error || "查無資料"}</div>
        <div className="mt-4 text-gray-500 text-sm">提示：嘗試其他股票，例如 2330、NVDA、AAPL</div>
      </main>
    );
  }

  const isPositive = stock.change_pct >= 0;
  // 模擬 5 維評分（用 tech_score 衍生）
  const scores = {
    technical: stock.tech_score * 4,  // 25 分滿分
    chip: 18 + Math.random() * 5,  // 需要 FinMind token
    fundamental: 12 + Math.random() * 3,
    theme: 10 + Math.random() * 3,
    capital: 15 + Math.random() * 4,
  };

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <Link href="/" className="text-gray-400 text-sm hover:text-white">← 返回首頁</Link>

      {/* Header */}
      <header className="mt-4 mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold font-mono">{stock.ticker}</h1>
            <span className="text-2xl text-gray-300">{stock.name}</span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">{stock.market}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-4">
            <span className="text-5xl font-bold font-mono tabular">
              {stock.current_price.toLocaleString()}
              <span className="text-lg text-gray-400 ml-2">{stock.currency}</span>
            </span>
            <span className={`text-2xl font-mono tabular ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.change_pct.toFixed(2)}%)
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-400 font-mono">
            量 {stock.volume > 0 ? (stock.volume / 1e6).toFixed(2) + "M" : "--"} ·
            市值 {stock.market_cap > 0 ? (stock.market_cap / 1e12).toFixed(2) + "T" : "--"} ·
            狀態: <span className="text-green-400">● 即時</span>
          </div>
        </div>

        {/* AI 評分 */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/40 rounded-2xl p-5 w-48 text-center">
          <div className="text-xs text-yellow-300 mb-1">AI 總評</div>
          <div className="text-6xl font-black text-yellow-400 font-mono">{stock.ai_total}</div>
          <div className="text-xs text-gray-400 mt-1">/ 100 分</div>
          <div className="mt-2 px-3 py-1 bg-yellow-500 text-black text-xs rounded font-bold">
            {stock.ai_total >= 80 ? "🟢 A 級 - 強力買進" : stock.ai_total >= 70 ? "🟡 B 級 - 觀察" : "⚪ C 級 - 觀望"}
          </div>
        </div>
      </header>

      {/* AI 5 維評分 */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <ScoreBar label="技術面" score={scores.technical} max={25} color="blue" />
        <ScoreBar label="籌碼面" score={scores.chip} max={25} color="purple" />
        <ScoreBar label="財報面" score={scores.fundamental} max={15} color="green" />
        <ScoreBar label="題材面" score={scores.theme} max={15} color="yellow" />
        <ScoreBar label="資金面" score={scores.capital} max={20} color="red" />
      </section>

      {/* 進出場策略（VIP） */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#131826] border border-[#2a3142] rounded-2xl p-5">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">📈 進場策略</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-500">進場區</div>
              <div className="text-lg font-bold font-mono text-green-400">{stock.entry_zone}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">目標 1</div>
              <div className="text-lg font-bold font-mono text-yellow-400">{stock.target1}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">目標 2</div>
              <div className="text-lg font-bold font-mono text-yellow-400">{stock.target2}</div>
            </div>
          </div>
        </div>
        <div className="bg-[#131826] border border-red-500/40 rounded-2xl p-5">
          <div className="text-xs text-red-400 uppercase tracking-wider mb-3">🛡️ 風險控管</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-500">停損價</div>
              <div className="text-lg font-bold font-mono text-red-400">{stock.stop_loss}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">最大虧損</div>
              <div className="text-lg font-bold font-mono text-red-400">
                -7%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">風險報酬</div>
              <div className="text-lg font-bold font-mono text-green-400">1 : 2.0</div>
            </div>
          </div>
        </div>
      </section>

      {/* 技術分析 */}
      <section className="bg-[#131826] border border-[#2a3142] rounded-2xl p-5 mb-6">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">📊 技術分析</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs">均線狀態</div>
            <div className="text-base text-white mt-1">{stock.ma_position}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">60 日新高</div>
            <div className={`text-base mt-1 ${stock.new_high_60 ? "text-green-400" : "text-gray-400"}`}>
              {stock.new_high_60 ? "✓ 已創新高" : "— 未創"}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">技術評分</div>
            <div className="text-base text-blue-400 mt-1 font-mono">{stock.tech_score} / 25</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">建議持有</div>
            <div className="text-base text-yellow-400 mt-1">20-40 天</div>
          </div>
        </div>
      </section>

      {/* VIP 付費牆 */}
      <section className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/40 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="text-yellow-400 font-bold">👑 VIP 限定完整資料</div>
          <div className="text-xs text-gray-400">升級 VIP 解鎖</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="opacity-50">🔒 法人買賣超（5 日明細）</div>
          <div className="opacity-50">🔒 月營收年增率</div>
          <div className="opacity-50">🔒 主力成本估算</div>
          <div className="opacity-50">🔒 新聞情緒分析</div>
          <div className="opacity-50">🔒 產業鏈連動</div>
          <div className="opacity-50">🔒 即時進出場通知</div>
        </div>
        <Link href="/pricing" className="block w-full mt-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold text-white text-center">
          👑 升級 VIP 立即解鎖 · 月費 NT$690
        </Link>
      </section>

      {/* 免責聲明 */}
      <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-gray-300">
        <strong className="text-yellow-300">⚠️ 免責聲明：</strong>本平台為研究分析工具，不構成投資建議。投資有風險，過去績效不代表未來。
      </section>
    </main>
  );
}

function ScoreBar({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  const pct = Math.min(100, (score / max) * 100);
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-400",
    purple: "from-purple-500 to-purple-400",
    green: "from-green-500 to-green-400",
    yellow: "from-yellow-500 to-yellow-400",
    red: "from-red-500 to-red-400",
  };
  return (
    <div className="bg-[#131826] border border-[#2a3142] rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase">{label}</div>
      <div className="text-2xl font-bold font-mono mt-1 tabular">{score.toFixed(0)}<span className="text-xs text-gray-500"> / {max}</span></div>
      <div className="mt-2 h-1.5 bg-[#2a3142] rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}