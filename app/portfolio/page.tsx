"use client";
import { useState } from "react";
import Link from "next/link";

interface Holding {
  ticker: string;
  shares: number;
  unit: "股" | "張";
}

interface Advice {
  ticker: string;
  name: string;
  cost: number;
  current: number;
  shares: number;
  unit: string;
  pnl_pct: number;
  pnl_amt: number;
  market_value: number;
  advice: string;
  reason: string;
  stop_loss: number;
  target1: number;
  target2: number;
  risk_level: string;
  tech_score: number;
}

export default function PortfolioPage() {
  const [input, setInput] = useState("");
  const [costPrices, setCostPrices] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Advice[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 解析輸入：MU 100股 / 華邦電 20張
  const parseInput = (text: string): Holding[] => {
    const holdings: Holding[] = [];
    const lines = text.split(/[\n,;]/).map(l => l.trim()).filter(Boolean);
    const nameMap: Record<string, string> = {
      "聯電": "2303", "台積電": "2330", "華邦電": "2344", "南亞科": "2408",
      "旺宏": "2337", "聯發科": "2454", "鴻海": "2317", "聯詠": "3034",
      "元大金": "2885", "兆豐金": "2886", "MRVL": "MRVL", "TSM": "TSM",
      "MU": "MU", "NVDA": "NVDA", "AMD": "AMD", "AAPL": "AAPL",
    };

    for (const line of lines) {
      // 解析：名稱/代號 數字 單位
      const match = line.match(/^([\u4e00-\u9fa5A-Za-z]+)\s*(\d+)\s*(股|張)?$/);
      if (!match) continue;
      const name = match[1];
      const shares = parseInt(match[2]);
      const unit = (match[3] as "股" | "張") || "股";
      const ticker = /^\d+$/.test(name) ? name : (nameMap[name] || name);
      holdings.push({ ticker, shares, unit });
    }
    return holdings;
  };

  const handleCheck = async () => {
    setLoading(true);
    setError("");
    setResults(null);

    const holdings = parseInput(input);
    if (holdings.length === 0) {
      setError("請輸入正確格式，例如：MU 100股 / 華邦電 20張");
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch("/api/portfolio-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings, cost_prices: costPrices }),
      });
      const data = await resp.json();
      if (data.success) {
        setResults(data.advice);
      } else {
        setError(data.error || "分析失敗");
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <Link href="/" className="text-gray-400 hover:text-white text-sm">← 返回首頁</Link>

      <header className="mt-4 mb-10 text-center">
        <h1 className="text-5xl font-bold gradient-text mb-3">🩺 AI 持股健檢</h1>
        <p className="text-gray-400">輸入你的持股，AI 立刻告訴你：續抱 / 停利 / 停損 / 減碼</p>
        <p className="text-sm text-yellow-400 mt-2">⭐ VIP 最愛功能 · 月省 20 小時分析時間</p>
      </header>

      {/* 輸入區 */}
      <section className="card mb-8">
        <h2 className="text-xl font-bold mb-3">📝 輸入你的持股</h2>
        <p className="text-sm text-gray-400 mb-3">
          格式：每行一筆，或用逗號分隔。<br/>
          範例：<br/>
          <code className="bg-black/30 px-2 py-1 rounded">MU 100股</code><br/>
          <code className="bg-black/30 px-2 py-1 rounded">華邦電 20張</code><br/>
          <code className="bg-black/30 px-2 py-1 rounded">聯電 10張, 台積電 5張</code>
        </p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="MU 100股&#10;華邦電 20張&#10;聯電 10張"
          className="w-full h-32 bg-black/30 border border-gray-700 rounded p-3 text-white font-mono text-sm"
        />

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-400">💡 進階：填成本價（不填則用最新收盤估算）</summary>
          <div className="mt-2 space-y-2">
            <p className="text-xs text-gray-500">格式：MU=200, 華邦電=180</p>
            <input
              type="text"
              placeholder="MU=200, 華邦電=180"
              onChange={(e) => {
                const map: Record<string, number> = {};
                e.target.value.split(/[,;]/).forEach(p => {
                  const [k, v] = p.split("=").map(s => s.trim());
                  if (k && v) map[k] = parseFloat(v);
                });
                setCostPrices(map);
              }}
              className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm"
            />
          </div>
        </details>

        <button
          onClick={handleCheck}
          disabled={loading}
          className="mt-4 w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? "🔍 AI 分析中..." : "🚀 開始 AI 健檢"}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
            ❌ {error}
          </div>
        )}
      </section>

      {/* 結果區 */}
      {results && results.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">📊 AI 健檢結果</h2>

          {results.map((r, i) => {
            const adviceColors: Record<string, string> = {
              "續抱": "bg-green-500/30 text-green-300 border-green-500",
              "停利": "bg-yellow-500/30 text-yellow-300 border-yellow-500",
              "停損": "bg-red-500/30 text-red-300 border-red-500",
              "減碼": "bg-orange-500/30 text-orange-300 border-orange-500",
              "加碼": "bg-blue-500/30 text-blue-300 border-blue-500",
            };
            const adviceColor = adviceColors[r.advice] || adviceColors["續抱"];

            return (
              <div key={i} className={`card border-2 ${adviceColor}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{r.ticker} {r.name}</h3>
                    <p className="text-sm text-gray-400">{r.shares.toLocaleString()} {r.unit} · 成本 ${r.cost.toFixed(2)}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border-2 ${adviceColor} font-bold text-lg`}>
                    {r.advice}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-400">現價</div>
                    <div className="text-lg font-bold">${r.current.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">損益</div>
                    <div className={`text-lg font-bold ${r.pnl_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {r.pnl_pct >= 0 ? "+" : ""}{r.pnl_pct.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">損益金額</div>
                    <div className={`text-lg font-bold ${r.pnl_amt >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {r.pnl_amt >= 0 ? "+" : ""}${r.pnl_amt.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">市值</div>
                    <div className="text-lg font-bold">${r.market_value.toFixed(0)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-gray-400">停損：</span>
                    <span className="text-red-400 font-bold">${r.stop_loss.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">目標1：</span>
                    <span className="text-yellow-400 font-bold">${r.target1.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">目標2：</span>
                    <span className="text-yellow-400 font-bold">${r.target2.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-black/30 rounded p-3 text-sm text-gray-300">
                  <span className="text-yellow-400 font-bold">💡 AI 分析：</span>{r.reason}
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>技術面: {r.tech_score}/25</span>
                  <span>風險: {r.risk_level}</span>
                </div>
              </div>
            );
          })}

          <div className="card bg-blue-500/10 border-blue-500/30">
            <h3 className="font-bold text-blue-300 mb-2">📲 想每天收到這份報告？</h3>
            <p className="text-sm text-gray-300 mb-3">
              升級 VIP，每日盤前/盤後自動推送你的持股建議 + 即時停損/達標通知
            </p>
            <Link href="/pricing" className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold text-white">
              👑 升級 VIP · 月費 NT$690
            </Link>
          </div>
        </section>
      )}

      <section className="mt-12 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="font-bold text-yellow-300 mb-2">⚠️ 免責聲明</h3>
        <p className="text-sm text-gray-300">
          本平台為研究分析工具，不構成任何投資建議。投資有風險，使用者應自行判斷風險並承擔投資結果。
        </p>
      </section>
    </main>
  );
}