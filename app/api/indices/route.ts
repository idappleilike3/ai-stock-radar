import { NextResponse } from "next/server";

// 真實大盤指數抓取
const INDICES = [
  { ticker: "^TWII", name: "台灣加權" },
  { ticker: "IXC", name: "櫃買指數" },  // fallback
  { ticker: "^DJI", name: "道瓊工業" },
  { ticker: "^GSPC", name: "S&P 500" },
  { ticker: "^IXIC", name: "那斯達克" },
  { ticker: "^HSI", name: "恆生指數" },
];

export async function GET() {
  try {
    // 用 yahoo-finance2 或 yfinance API
    const yahooFinance = (await import("yahoo-finance2")).default;
    const results = await Promise.all(
      INDICES.map(async (idx) => {
        try {
          const quote = await yahooFinance.quote(idx.ticker);
          return {
            name: idx.name,
            value: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            change_pct: quote.regularMarketChangePercent || 0,
          };
        } catch {
          return { name: idx.name, value: 0, change: 0, change_pct: 0 };
        }
      })
    );
    return NextResponse.json({ success: true, indices: results, timestamp: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}