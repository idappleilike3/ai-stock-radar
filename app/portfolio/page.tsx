"use client";
import { useState } from "react";
import Link from "next/link";

export default function PortfolioPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);

    const lines = input.split(/[\n,;]/).map(l => l.trim()).filter(Boolean);
    const nameMap: Record<string, string> = {
      "聯電": "2303", "台積電": "2330", "華邦電": "2344", "南亞科": "2408",
      "旺宏": "2337", "聯發科": "2454", "鴻海": "2317", "聯詠": "3034",
      "元大金": "2885", "兆豐金": "2886", "MRVL": "MRVL", "TSM": "TSM",
      "MU": "MU", "NVDA": "NVDA", "AMD": "AMD", "AAPL": "AAPL",
    };

    const holdings: { ticker: string; shares: number; unit: "股" | "張" }[] = [];
    for (const line of lines) {
      const match = line.match(/^([\u4e00-\u9fa5A-Za-z]+)\s*(\d+)\s*(股|張)?$/);
      if (!match) continue;
      const name = match[1];
      const shares = parseInt(match[2]);
      const unit = (match[3] as "股" | "張") || "股";
      const ticker = /^\d+$/.test(name) ? name : (nameMap[name] || name);
      holdings.push({ ticker, shares, unit });
    }

    if (holdings.length === 0) {
      setError("格式錯誤，例如：MU 100股 / 華邦電 20張");
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch("/api/portfolio-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings, cost_prices: {} }),
      });
      const data = await resp.json();
      if (data.success) setResults(data.advice);
      else setError(data.error || "分析失敗");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const adviceColors: Record<string, string> = {
    "續抱": "border-green-500 text-green-300",
    "停利": "border-yellow-500 text-yellow-300",
    "停損": "border-red-500 text-red-300",
    "減碼": "border-orange-500 text-orange-300",
    "加碼": "border-blue-500 text-blue-300",
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-gray-400 text-sm">← 返回首頁</Link>
      <h1 className="text-4xl font-bold mt-4 mb-2 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
        🩺 AI 持股健檢
      </h1>
      <p className="text-gray-400 mb-6">輸入你的持股，AI 告訴你續抱 / 停利 / 停損 / 減碼</p>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="MU 100股&#10;華邦電 20張&#10;聯電 10張"
          className="w-full h-32 bg-black/40 border border-gray-700 rounded p-3 text-white font-mono text-sm"
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className="w-full mt-3 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg disabled:opacity-50"
        >
          {loading ? "🔍 分析中..." : "🚀 開始 AI 健檢"}
        </button>
        {error && <div className="mt-3 p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">❌ {error}</div>}
      </section>

      {results && results.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">📊 健檢結果</h2>
          {results.map((r, i) => (
            <div
              key={i}
              className={`bg-white/5 border-2 ${adviceColors[r.advice] || "border-gray-500"} rounded-2xl p-5`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-2xl font-bold">{r.ticker} {r.name}</h3>
                  <p className="text-sm text-gray-400">{r.shares} {r.unit} · 成本 ${r.cost.toFixed(2)}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg border-2 ${adviceColors[r.advice]} font-bold`}>
                  {r.advice}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-3">
                <div><div className="text-xs text-gray-400">現價</div><div className="text-lg font-bold">${r.current.toFixed(2)}</div></div>
                <div><div className="text-xs text-gray-400">損益</div><div className={`text-lg font-bold ${r.pnl_pct >= 0 ? "text-green-400" : "text-red-400"}`}>{r.pnl_pct >= 0 ? "+" : ""}{r.pnl_pct.toFixed(1)}%</div></div>
                <div><div className="text-xs text-gray-400">損益金額</div><div className={`text-lg font-bold ${r.pnl_amt >= 0 ? "text-green-400" : "text-red-400"}`}>{r.pnl_amt >= 0 ? "+" : ""}${r.pnl_amt.toFixed(0)}</div></div>
                <div><div className="text-xs text-gray-400">市值</div><div className="text-lg font-bold">${r.market_value.toFixed(0)}</div></div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                <div><span className="text-gray-400">停損：</span><span className="text-red-400 font-bold">${r.stop_loss.toFixed(2)}</span></div>
                <div><span className="text-gray-400">目標1：</span><span className="text-yellow-400 font-bold">${r.target1.toFixed(2)}</span></div>
                <div><span className="text-gray-400">目標2：</span><span className="text-yellow-400 font-bold">${r.target2.toFixed(2)}</span></div>
              </div>

              <div className="bg-black/30 rounded p-3 text-sm text-gray-300">
                <span className="text-yellow-400 font-bold">💡 {r.reason}</span>
              </div>
            </div>
          ))}

          <Link href="/pricing" className="block w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold text-white text-center">
            👑 升級 VIP 每日推播
          </Link>
        </section>
      )}
    </main>
  );
}