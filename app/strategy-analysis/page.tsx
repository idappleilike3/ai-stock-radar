"use client";
import { useState } from "react";
import Link from "next/link";

interface Strategy {
  name: string;
  description: string;
  win_rate: number;
  avg_return: number;
  max_drawdown: number;
  trades: number;
  sharpe: number;
  score: number;
}

interface StockResult {
  ticker: string;
  name: string;
  strategies: Strategy[];
  best_strategy: string;
}

export default function StrategyAnalysisPage() {
  const [ticker, setTicker] = useState("");
  const [result, setResult] = useState<StockResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(`/api/strategy-analysis?ticker=${encodeURIComponent(ticker)}`);
      const data = await resp.json();
      if (data.success) setResult(data);
    } catch (e) {
      alert("分析失敗");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <Link href="/" className="text-gray-400 hover:text-white text-sm">← 返回首頁</Link>
      <h1 className="text-4xl font-bold gradient-text mt-4 mb-2">🧪 策略分析</h1>
      <p className="text-gray-400 mb-2">針對單檔股票跑多個策略，找出最好的策略組合</p>

      <section className="glass-card mb-8" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 24 }}>
        <h2 className="text-xl font-bold mb-3">📖 什麼是策略分析？</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          策略回測結果不錯時，要區分「策略真的好」還是「剛好選到好的股票」。
          同一檔股票可能對某些策略有效，對其他無效。
          <br/><br/>
          <strong>策略分析</strong>會對<strong>單檔股票</strong>跑多個策略，回測每個策略的勝率、報酬、最大回撤，
          幫你找出對<strong>這檔股票最有效的策略</strong>，以及<strong>不同策略的優缺點組合</strong>。
        </p>
      </section>

      {/* 輸入區 */}
      <section className="glass-card mb-8" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 24 }}>
        <h2 className="text-xl font-bold mb-3">📝 輸入股票代號</h2>
        <p className="text-xs text-gray-400 mb-3">台股輸入 4-6 碼（如 2330），美股輸入代號（如 NVDA, AAPL）</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="例如: 2330 / NVDA / 華邦電 / MRVL"
            className="flex-1 bg-black/30 border border-gray-700 rounded p-3 text-white"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg disabled:opacity-50"
          >
            {loading ? "分析中..." : "🧪 開始分析"}
          </button>
        </div>
      </section>

      {/* 結果 */}
      {result && (
        <section>
          <h2 className="text-2xl font-bold mb-4">
            📊 {result.ticker} {result.name} 策略分析結果
          </h2>
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-lg p-4 mb-4">
            🏆 對 {result.name} 最佳策略：<strong className="text-yellow-400">{result.best_strategy}</strong>
          </div>

          <div className="space-y-3">
            {result.strategies.map((s) => (
              <div
                key={s.name}
                className="glass-card"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 12,
                  padding: 16,
                  border: s.name === result.best_strategy ? "2px solid #f59e0b" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {s.name}
                      {s.name === result.best_strategy && (
                        <span className="text-xs px-2 py-1 bg-yellow-500 text-black rounded">🏆 最佳</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{s.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">綜合評分</div>
                    <div className="text-3xl font-black text-yellow-400">{s.score}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                  <div className="bg-black/30 rounded p-2 text-center">
                    <div className="text-xs text-gray-400">勝率</div>
                    <div className="text-lg font-bold text-green-400">{s.win_rate.toFixed(1)}%</div>
                  </div>
                  <div className="bg-black/30 rounded p-2 text-center">
                    <div className="text-xs text-gray-400">平均報酬</div>
                    <div className={`text-lg font-bold ${s.avg_return >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {s.avg_return >= 0 ? "+" : ""}{s.avg_return.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-black/30 rounded p-2 text-center">
                    <div className="text-xs text-gray-400">最大回撤</div>
                    <div className="text-lg font-bold text-red-400">-{s.max_drawdown.toFixed(1)}%</div>
                  </div>
                  <div className="bg-black/30 rounded p-2 text-center">
                    <div className="text-xs text-gray-400">交易次數</div>
                    <div className="text-lg font-bold text-blue-400">{s.trades}</div>
                  </div>
                  <div className="bg-black/30 rounded p-2 text-center">
                    <div className="text-xs text-gray-400">夏普比率</div>
                    <div className="text-lg font-bold text-purple-400">{s.sharpe.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 策略建議 */}
          <section className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <h3 className="font-bold text-blue-300 mb-2">💡 AI 建議</h3>
            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              <li>單一策略可能過擬合，建議用 <strong>2-3 個策略組合</strong> 分散風險</li>
              <li>夏普比率 &gt; 1.0 為良好，&gt; 2.0 為優秀</li>
              <li>最大回撤 &lt; 20% 較安全</li>
              <li>勝率 &gt; 50% 配合正期望值才有用</li>
              <li>建議每月檢視一次策略表現，定期汰弱留強</li>
            </ul>
          </section>
        </section>
      )}

      <section className="mt-12 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="font-bold text-yellow-300 mb-2">⚠️ 免責聲明</h3>
        <p className="text-sm text-gray-300">
          回測結果不代表未來表現。策略分析僅供參考，不構成投資建議。投資有風險，請謹慎評估。
        </p>
      </section>
    </main>
  );
}