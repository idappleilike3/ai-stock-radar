"use client";
import Link from "next/link";

const PLANS = [
  {
    name: "免費會員",
    price: "NT$0",
    period: "永久",
    color: "from-gray-600 to-gray-700",
    features: [
      "每日 3 檔股票訊號",
      "延遲 1 小時訊號",
      "基礎技術分析",
      "公開排行榜",
      "台美港大盤指數",
    ],
    cta: "免費註冊",
    tier: "free",
  },
  {
    name: "VIP 月費",
    price: "NT$690",
    period: "每月",
    color: "from-yellow-500 to-orange-500",
    features: [
      "✅ 即時訊號（不延遲）",
      "✅ Telegram 推播",
      "✅ LINE 推播",
      "✅ 完整進出場價",
      "✅ 自選股追蹤（10 檔）",
      "✅ 每週產業報告",
      "✅ 短線狙擊 + 波段 + 翻倍股",
    ],
    cta: "立即升級",
    tier: "vip-monthly",
    popular: true,
  },
  {
    name: "VIP 季費",
    price: "NT$1,880",
    period: "每季",
    color: "from-orange-500 to-red-500",
    features: [
      "月費所有功能",
      "🎁 季付省 NT$190",
      "🎁 額外 5 檔自選股",
      "🎁 VIP 專屬策略報告",
    ],
    cta: "省錢首選",
    tier: "vip-quarterly",
    save: "省 NT$190",
  },
  {
    name: "VIP 年費",
    price: "NT$6,800",
    period: "每年",
    color: "from-red-500 to-pink-600",
    features: [
      "月費所有功能",
      "🎁 年付省 NT$1,480",
      "🎁 30 檔自選股",
      "🎁 一對一諮詢 1 次",
      "🎁 優先客服支援",
    ],
    cta: "最划算",
    tier: "vip-yearly",
    save: "省 NT$1,480",
    best: true,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen p-8">
      <header className="text-center mb-12">
        <Link href="/" className="text-gray-400 hover:text-white text-sm">← 返回首頁</Link>
        <h1 className="text-5xl font-bold gradient-text mt-4 mb-3">會員訂閱方案</h1>
        <p className="text-gray-400">選擇最適合你的方案，立即開始 AI 飆股研究</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative card ${plan.popular || plan.best ? "border-2 border-yellow-400 scale-105" : ""}`}
          >
            {plan.best && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500 text-white text-xs rounded-full">
                🔥 最划算
              </div>
            )}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-black text-xs rounded-full font-bold">
                ⭐ 熱門
              </div>
            )}

            <div className={`text-xl font-bold mb-2 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
              {plan.name}
            </div>
            <div className="text-4xl font-bold mb-1">{plan.price}</div>
            <div className="text-sm text-gray-400 mb-4">/{plan.period}</div>

            {plan.save && (
              <div className="bg-green-500/20 text-green-300 text-sm rounded p-2 mb-4">
                💰 {plan.save}
              </div>
            )}

            <ul className="space-y-2 text-sm mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="text-gray-300">{f}</li>
              ))}
            </ul>

            <Link
              href={`/payment/usdt?plan=${plan.tier}`}
              className={`block w-full py-3 rounded-lg font-bold text-center transition-all ${
                plan.tier === "free"
                  ? "bg-gray-700 text-gray-300"
                  : `bg-gradient-to-r ${plan.color} text-white hover:scale-105`
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </section>

      {/* 比較表 */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">📊 功能比較</h2>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="text-left py-2">功能</th>
              <th className="text-center py-2 text-gray-400">免費</th>
              <th className="text-center py-2 text-yellow-400">VIP</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-800"><td className="py-2">每日訊號</td><td className="text-center">3 檔延遲</td><td className="text-center text-yellow-400">無限即時</td></tr>
            <tr className="border-b border-gray-800"><td className="py-2">Telegram 推播</td><td className="text-center">✗</td><td className="text-center text-yellow-400">✓</td></tr>
            <tr className="border-b border-gray-800"><td className="py-2">LINE 推播</td><td className="text-center">✗</td><td className="text-center text-yellow-400">✓</td></tr>
            <tr className="border-b border-gray-800"><td className="py-2">完整進出場價</td><td className="text-center">✗</td><td className="text-center text-yellow-400">✓</td></tr>
            <tr className="border-b border-gray-800"><td className="py-2">自選股追蹤</td><td className="text-center">✗</td><td className="text-center text-yellow-400">10 檔</td></tr>
            <tr className="border-b border-gray-800"><td className="py-2">每週產業報告</td><td className="text-center">✗</td><td className="text-center text-yellow-400">✓</td></tr>
            <tr className="border-b border-gray-800"><td className="py-2">短線/波段/翻倍股</td><td className="text-center">僅看</td><td className="text-center text-yellow-400">完整策略</td></tr>
          </tbody>
        </table>
      </section>

      {/* 金流說明 */}
      <section className="mt-12 max-w-4xl mx-auto bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="font-bold text-blue-300 mb-2">💳 付款方式</h3>
        <p className="text-sm text-gray-300">
          支援：信用卡 / 綠界科技 / LINE Pay / ATM 轉帳。
          訂閱立即生效，可隨時取消。
        </p>
      </section>

      {/* 免責聲明 */}
      <section className="mt-8 max-w-4xl mx-auto bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="font-bold text-yellow-300 mb-2">⚠️ 免責聲明</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          本平台為研究分析工具，不構成任何投資建議。
          投資有風險，過去績效不代表未來。使用前請詳閱免責條款。
        </p>
      </section>
    </main>
  );
}