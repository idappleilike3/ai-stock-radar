"use client";
import { useState } from "react";
import Link from "next/link";

const PLANS = [
  { id: "vip-monthly", name: "VIP 月費", price: 690 },
  { id: "vip-quarterly", name: "VIP 季費", price: 1880 },
  { id: "vip-yearly", name: "VIP 年費", price: 6800 },
];

export default function USDTPaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState("vip-monthly");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/payment/usdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, user_id: email || "guest" }),
      });
      const data = await resp.json();
      if (data.success) setOrder(data.order);
    } catch {
      alert("建立訂單失敗");
    }
    setLoading(false);
  };

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <Link href="/" className="text-gray-400 text-sm">← 返回首頁</Link>
      <h1 className="text-4xl font-bold mt-4 mb-2 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
        💰 USDT 付款
      </h1>
      <p className="text-gray-400 mb-6">TRC20 網路，手續費最低</p>

      {!order ? (
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">選擇方案</h2>
          <div className="space-y-3">
            {PLANS.map((p) => (
              <label
                key={p.id}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPlan === p.id ? "border-yellow-400 bg-yellow-500/10" : "border-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={p.id}
                  checked={selectedPlan === p.id}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="mr-3"
                />
                <span className="font-bold">{p.name}</span>
                <span className="float-right text-yellow-400">NT$ {p.price.toLocaleString()}</span>
              </label>
            ))}
          </div>

          <input
            type="email"
            placeholder="你的 Email（用於開通 VIP）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-4 bg-black/40 border border-gray-700 rounded p-3 text-white"
          />

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg disabled:opacity-50"
          >
            {loading ? "建立訂單中..." : "🚀 下一步"}
          </button>
        </section>
      ) : (
        <section className="bg-white/5 border-2 border-yellow-400 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">{order.plan_name}</h2>
          <p className="text-sm text-gray-400 mb-4">訂單編號: {order.id}</p>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded p-4 mb-4 text-center">
            <div className="text-sm text-gray-400">應付金額</div>
            <div className="text-3xl font-bold text-yellow-400">{order.amount_usdt} USDT</div>
            <div className="text-xs text-gray-500">≈ NT$ {order.amount_twd}</div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded p-3 mb-4 text-sm">
            ⚠️ 務必使用 <strong>TRC20</strong> 網路，使用其他網路將遺失資金！
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">付款地址（TRC20）</div>
              <div className="flex gap-2">
                <input type="text" value={order.wallet_address} readOnly className="flex-1 bg-black/40 border border-gray-700 rounded p-3 text-white font-mono text-sm" />
                <button onClick={() => copy("wallet", order.wallet_address)} className="px-4 py-3 bg-blue-500/30 text-blue-300 rounded font-bold">
                  {copied === "wallet" ? "✓" : "📋"}
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">備註（必填）</div>
              <div className="flex gap-2">
                <input type="text" value={order.id} readOnly className="flex-1 bg-black/40 border border-gray-700 rounded p-3 text-white font-mono text-sm" />
                <button onClick={() => copy("order", order.id)} className="px-4 py-3 bg-blue-500/30 text-blue-300 rounded font-bold">
                  {copied === "order" ? "✓" : "📋"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-black/30 rounded p-3 text-sm text-gray-300">
            <div className="font-bold mb-2">📋 付款步驟：</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>開啟 USDT 錢包（如 Binance）</li>
              <li>選擇「提領 / 轉帳 USDT」</li>
              <li>貼上付款地址</li>
              <li>網路選擇 <strong className="text-yellow-400">TRC20</strong></li>
              <li>金額輸入 <strong className="text-yellow-400">{order.amount_usdt} USDT</strong></li>
              <li>備註填寫 <strong className="text-yellow-400">{order.id}</strong></li>
              <li>30 分鐘內完成</li>
            </ol>
          </div>
        </section>
      )}

      <section className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-gray-300">
        <p className="font-bold text-yellow-300 mb-2">⚠️ 風險聲明</p>
        <ul className="list-disc list-inside space-y-1">
          <li>加密貨幣付款不受金融消費者保護法保障</li>
          <li>付款前請確認錢包地址正確</li>
          <li>USDT 價格波動風險由付款人自行承擔</li>
        </ul>
      </section>
    </main>
  );
}