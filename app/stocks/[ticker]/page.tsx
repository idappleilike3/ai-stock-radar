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
    // 模擬資料（真實部署時從 API 抓）
    setStock({
      ticker: ticker,
      name: "示例股票",
      market: "TW",
      current_price: 245.5,
      change_pct: 3.2,

      entry_zone: "240 ~ 250",
      stop_loss: 228,
      target1: 280,
      target2: 312,
      win_rate: "65-75%",
      risk_level: "中等",
      tech_score: 22,
      chip_score: 18,
      fund_score: 12,
      theme_score: 13,
      institutional_net: "+15,230 張",
      industry_trend: "AI 伺服器爆發",
      ai_total: 82,

      why_pick: "突破 60 日新高 + 法人連 3 日買超 + 月線轉強 + 量能放大 2.3x",
      pattern: "平台整理後帶量突破，屬於中期趨勢啟動型態",
      ma_position: "5MA > 10MA > 20MA > 60MA，均線完美多頭排列",
      volume_change: "近 5 日均量較前 20 日放大 2.3 倍，主力明顯進場",
      chip_concentration: "持股集中度 68%，前 20 大股東持有穩定",
      institutional_buy_sell: "外資 +8,500 張、投信 +4,200 張、自營商 +2,530 張，合計 +15,230 張（連 3 日買超）",
      financial_growth: "近 3 月營收年增 28%，月增 12%，基本面轉強",
      theme_industry: "AI 伺服器 + ASIC 雙題材，受惠於 hyperscaler 訂單",
      entry_strategy: "建議分 3 批進場：第 1 批 1/3 在 240-245，第 2 批 1/3 在 235-240 回測 5MA，第 3 批 1/3 在突破新高加碼",
      ai_risk_alert: "⚠️ 風險點：股價已漲 35%，距 60 日均線偏離 18%，需嚴設停損 228。爆量後若量縮需減倉。",
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