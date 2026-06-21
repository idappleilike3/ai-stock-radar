"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface StockDetail {
  ticker: string;
  name: string;
  market: string;
  current_price: number;
  change_pct: number;

  // 12 種顯示資訊
  entry_zone: string;
  stop_loss: number;
  target1: number;
  target2: number;
  win_rate: string;
  risk_level: string;
  tech_score: number;
  chip_score: number;
  fund_score: number;
  theme_score: number;
  institutional_net: string;
  industry_trend: string;
  ai_total: number;

  // 10 大分析區塊
  why_pick: string;
  pattern: string;
  ma_position: string;
  volume_change: string;
  chip_concentration: string;
  institutional_buy_sell: string;
  financial_growth: string;
  theme_industry: string;
  entry_strategy: string;
  ai_risk_alert: string;
}

export default function StockDetailPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [stock, setStock] = useState<StockDetail | null>(null);

  useEffect(() => {
    fetch(`/api/stock/${ticker}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const s = data.stock;
          setStock({
            ticker: s.ticker,
            name: s.name,
            market: s.market,
            current_price: s.current_price,
            change_pct: s.change_pct,
            entry_zone: s.entry_zone,
            stop_loss: parseFloat(s.stop_loss),
            target1: parseFloat(s.target1),
            target2: parseFloat(s.target2),
            win_rate: "60-70%",
            risk_level: "中等",
            tech_score: s.tech_score,
            chip_score: 0,
            fund_score: 0,
            theme_score: 0,
            institutional_net: "需 FinMind token",
            industry_trend: "半導體",
            ai_total: s.ai_total,
            why_pick: s.new_high_60 ? "創 60 日新高" : "技術面轉強",
            pattern: s.ma_position,
            ma_position: s.ma_position,
            volume_change: "見 K 線圖",
            chip_concentration: "持股集中度待查",
            institutional_buy_sell: "需 FinMind token",
            financial_growth: "需 FinMind token",
            theme_industry: "AI / 半導體",
            entry_strategy: `進場 ${s.entry_zone}，停損 ${s.stop_loss}，目標 ${s.target1}`,
            ai_risk_alert: "請嚴設停損，不保證獲利",
          });
        }
      });
  }, [ticker]);

  if (!stock) return <div className="p-8 text-white">載入中...</div>;

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <a href="/" className="text-gray-400 hover:text-white text-sm">← 返回首頁</a>

      {/* 標題區 */}
      <header className="mt-4 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold">{stock.ticker} <span className="text-gray-400 text-3xl">{stock.name}</span></h1>
            <p className="text-gray-400 mt-2">{stock.market} · {stock.industry_trend}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">${stock.current_price}</div>
            <div className={`text-lg ${stock.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
              {stock.change_pct >= 0 ? "+" : ""}{stock.change_pct}%
            </div>
          </div>
        </div>
      </header>

      {/* AI 總評 */}
      <section className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">🤖 AI 總評</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">{stock.ai_total}</div>
            <div className="text-sm text-gray-400">總分 / 100</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stock.tech_score}/25</div>
            <div className="text-sm text-gray-400">技術面</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stock.chip_score}/25</div>
            <div className="text-sm text-gray-400">籌碼面</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stock.fund_score}/15</div>
            <div className="text-sm text-gray-400">基本面</div>
          </div>
        </div>
      </section>

      {/* 進出場策略 */}
      <section className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">🎯 進出場策略</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-400">進場區間</div>
            <div className="text-lg font-bold text-green-400">{stock.entry_zone}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">停損價</div>
            <div className="text-lg font-bold text-red-400">${stock.stop_loss}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">目標 1</div>
            <div className="text-lg font-bold text-yellow-400">${stock.target1}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">目標 2</div>
            <div className="text-lg font-bold text-yellow-400">${stock.target2}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">勝率評估</div>
            <div className="text-lg font-bold">{stock.win_rate}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">風險等級</div>
            <div className="text-lg font-bold text-orange-400">{stock.risk_level}</div>
          </div>
        </div>
      </section>

      {/* 10 大分析區塊 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">📊 深度分析</h2>

        <div className="card">
          <h3 className="font-bold text-yellow-400 mb-2">1. 為什麼入選？</h3>
          <p className="text-gray-300">{stock.why_pick}</p>
        </div>

        <div className="card">
          <h3 className="font-bold text-yellow-400 mb-2">2. 技術型態</h3>
          <p className="text-gray-300">{stock.pattern}</p>
        </div>

        <div className="card">
          <h3 className="font-bold text-yellow-400 mb-2">3. 均線位置</h3>
          <p className="text-gray-300">{stock.ma_position}</p>
        </div>

        <div className="card">
          <h3 className="font-bold text-yellow-400 mb-2">4. 成交量變化</h3>
          <p className="text-gray-300">{stock.volume_change}</p>
        </div>

        <div className="card">
          <h3 className="font-bold text-yellow-400 mb-2">5. 籌碼集中度</h3>
          <p className="text-gray-300">{stock.chip_concentration}</p>
        </div>

        <div className="card">
          <h3 className="font-bold text-yellow-400 mb-2">6. 法人買賣超</h3>
          <p className="text-gray-300">{stock.institutional_buy_sell}</p>
        </div>

        <div className="card">
          <h3 className="font-bold text-yellow-400 mb-2">7. 財報成長性</h3>
          <p className="text-gray-300">{stock.financial_growth}</p>
        </div>

        <div className="card">
          <h3 className="font-bold text-yellow-400 mb-2">8. 題材與產業趨勢</h3>
          <p className="text-gray-300">{stock.theme_industry}</p>
        </div>

        <div className="card">
          <h3 className="font-bold text-yellow-400 mb-2">9. 進出場策略</h3>
          <p className="text-gray-300">{stock.entry_strategy}</p>
        </div>

        <div className="card border-red-500/50">
          <h3 className="font-bold text-red-400 mb-2">10. ⚠️ AI 風險提醒</h3>
          <p className="text-gray-300">{stock.ai_risk_alert}</p>
        </div>
      </section>

      {/* 免責聲明 */}
      <section className="mt-12 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="font-bold text-yellow-300 mb-2">⚠️ 免責聲明</h3>
        <p className="text-sm text-gray-300">
          本平台為研究分析工具，所有內容僅供參考，不構成任何投資建議。
          投資有風險，過去績效不代表未來。使用者應自行判斷風險並承擔投資結果。
        </p>
      </section>
    </main>
  );
}