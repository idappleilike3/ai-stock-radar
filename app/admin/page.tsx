"use client";
import { useState } from "react";

const PUSH_TEMPLATES = {
  telegram: `[HOT] 華邦電 2344
━━━━━━━━━━━━━━━
📊 AI 評分：82 分 (A 級)
🎯 進場：$214 ~ $225
🛑 停損：$203
🎁 目標 1：$249 (+16%)
🎁 目標 2：$312 (+46%)
⏰ 持有週期：20-40 天
━━━━━━━━━━━━━━━
💡 訊號：突破 120 日新高 + 創 60 日新高 + 法人買超 5,000 張 + 量能放大 2.3x
━━━━━━━━━━━━━━━
本平台為研究分析工具，不構成投資建議`,

  line: `🔥 華邦電 2344 突破訊號

AI 評分 82 分
進場 $214-225
停損 $203
目標 $249 / $312

看多理由：
• 突破 120 日新高
• 法人連 3 日買超
• 量能 2.3x 爆量

⚠️ 本平台不構成投資建議`,

  watchlist_alert: `📊 自選股警示

華邦電 2344
現價 $218.5 (+9.8%)

AI 建議：續抱
理由：漲幅擴大，站穩 5MA
建議：嚴守停損 $203`,

  stop_loss: `🛑 停損出場訊號

華邦電 2344
現價 $201 (-7.2%)
已跌破停損 $203

建議：立即全部出場
原因：跌破關鍵支撐 + 月線轉弱`,

  take_profit: `🎯 達標出場訊號

華邦電 2344
現價 $250 (+14.8%)
已達目標 1

建議：出場 1/3
剩餘 2/3：停損移到成本`,
};

export default function AdminPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <a href="/" className="text-gray-400 text-sm">← 返回首頁</a>
      <h1 className="text-4xl font-bold gradient-text mt-4 mb-8">📡 推播文案範本</h1>

      <section className="space-y-6">
        {Object.entries(PUSH_TEMPLATES).map(([key, content]) => (
          <div key={key} className="card">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-yellow-400">
                {key === "telegram" && "📨 Telegram 推播格式"}
                {key === "line" && "💬 LINE 推播格式"}
                {key === "watchlist_alert" && "📊 自選股警示"}
                {key === "stop_loss" && "🛑 停損出場"}
                {key === "take_profit" && "🎯 達標出場"}
              </h2>
              <button
                onClick={() => copy(key, content)}
                className="px-3 py-1 bg-blue-500/30 text-blue-300 rounded text-sm hover:bg-blue-500/50"
              >
                {copied === key ? "✓ 已複製" : "📋 複製"}
              </button>
            </div>
            <pre className="bg-black/50 p-4 rounded text-sm text-gray-300 whitespace-pre-wrap font-mono">
{content}
            </pre>
          </div>
        ))}
      </section>

      {/* 股票資料庫 Schema */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">🗄️ 股票資料庫欄位</h2>
        <div className="card">
          <pre className="bg-black/50 p-4 rounded text-sm text-gray-300 font-mono overflow-x-auto">{`CREATE TABLE stocks (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  name VARCHAR(50),
  market VARCHAR(5),  -- TW/US/HK
  industry VARCHAR(50),
  current_price DECIMAL(10,2),
  change_pct DECIMAL(5,2),
  volume BIGINT,
  -- 5 維評分
  tech_score INT,  -- 技術面 0-25
  chip_score INT,  -- 籌碼面 0-25
  fund_score INT,  -- 基本面 0-15
  industry_score INT,  -- 產業 0-20
  theme_score INT,  -- 題材 0-15
  ai_total INT,  -- 總分 0-100
  grade CHAR(1),  -- A/B/C/D
  -- 進出場
  entry_low DECIMAL(10,2),
  entry_high DECIMAL(10,2),
  stop_loss DECIMAL(10,2),
  target1 DECIMAL(10,2),
  target2 DECIMAL(10,2),
  -- 風險
  win_rate VARCHAR(10),
  risk_level VARCHAR(10),
  -- 籌碼
  institutional_net BIGINT,
  -- 文字
  why_pick TEXT,
  pattern TEXT,
  entry_strategy TEXT,
  ai_risk_alert TEXT,
  -- 時間
  scanned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_ticker (ticker),
  INDEX idx_market (market),
  INDEX idx_grade (grade)
);

CREATE TABLE holdings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  ticker VARCHAR(10),
  cost DECIMAL(10,2),
  shares INT,
  target1 DECIMAL(10,2),
  target2 DECIMAL(10,2),
  stop_loss DECIMAL(10,2),
  notify_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE push_history (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),
  alert_type VARCHAR(20),  -- STOP/T1/T2/PB/HOLD/LOSS
  message TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(100),
  tier VARCHAR(20),  -- free/vip-monthly/vip-quarterly/vip-yearly
  amount INT,
  stripe_id VARCHAR(100),
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);`}</pre>
        </div>
      </section>

      {/* 金流 + 會員設定指南 */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">🔧 金流 + 會員設定指南</h2>
        <div className="card text-sm text-gray-300 space-y-3">
          <p><strong>1. 金流 (Stripe)</strong></p>
          <ul className="list-disc list-inside ml-4 text-gray-400">
            <li>註冊 https://stripe.com → 取得 Secret Key + Publishable Key</li>
            <li>Vercel 環境變數加 STRIPE_SECRET_KEY + STRIPE_PUBLIC_KEY</li>
            <li>Webhook 設定：https://your-domain.vercel.app/api/stripe/webhook</li>
          </ul>

          <p><strong>2. 會員系統 (Supabase)</strong></p>
          <ul className="list-disc list-inside ml-4 text-gray-400">
            <li>註冊 https://supabase.com → 創建專案</li>
            <li>取得 NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>啟用 Auth → Email/Password 或 Google 登入</li>
            <li>執行上面的 SQL 建立資料表</li>
          </ul>

          <p><strong>3. LINE 推播</strong></p>
          <ul className="list-disc list-inside ml-4 text-gray-400">
            <li>LINE 官方帳號後台 → Messaging API 開啟</li>
            <li>取得 Channel Access Token + User ID</li>
            <li>Vercel 環境變數加 LINE_CHANNEL_ACCESS_TOKEN + LINE_USER_ID</li>
          </ul>
        </div>
      </section>

      <section className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="font-bold text-yellow-300 mb-2">⚠️ 免責聲明</h3>
        <p className="text-sm text-gray-300">
          本平台為研究分析工具，不構成任何投資建議。投資有風險，使用者應自行判斷風險並承擔投資結果。
        </p>
      </section>
    </main>
  );
}