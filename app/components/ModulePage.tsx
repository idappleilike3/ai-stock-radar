"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface StockData {
  ticker: string;
  price: number;
  change_pct: number;
  score: number;
  reasons: string[];
}

export default function ModulePage({
  title,
  market,
  icon,
  color,
}: {
  title: string;
  market: string;
  icon: string;
  color: string;
}) {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    // 模擬從後端 API 抓資料
    const mockData: StockData[] = [
      { ticker: "2330", price: 2410, change_pct: 1.05, score: 85, reasons: ["站穩月線", "法人買超"] },
      { ticker: "2454", price: 4390, change_pct: 2.3, score: 80, reasons: ["多頭排列"] },
      { ticker: "2317", price: 268, change_pct: -0.5, score: 75, reasons: ["量能放大"] },
    ];
    setTimeout(() => {
      setData(mockData);
      setLastUpdate(new Date().toLocaleString("zh-TW"));
      setLoading(false);
    }, 500);
  }, [market]);

  return (
    <main className="min-h-screen p-8">
      <header className="mb-8">
        <Link href="/" className="text-gray-400 hover:text-white text-sm">← 返回首頁</Link>
        <h1 className={`text-5xl font-bold mt-4 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {icon} {title}
        </h1>
        <p className="text-gray-400 mt-2">最後更新: {lastUpdate || "載入中..."}</p>
      </header>

      {loading ? (
        <div className="text-center text-gray-400 py-20">掃描中...</div>
      ) : (
        <section className="grid gap-4">
          {data.map((s) => (
            <div key={s.ticker} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">{s.ticker}</h3>
                  <p className="text-3xl mt-2">${s.price.toLocaleString()}</p>
                  <p className={`text-lg ${s.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {s.change_pct >= 0 ? "+" : ""}{s.change_pct.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">評分</div>
                  <div className="text-4xl font-bold text-yellow-400">{s.score}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {s.reasons.map((r, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}