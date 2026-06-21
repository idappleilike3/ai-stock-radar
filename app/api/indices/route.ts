import { NextResponse } from "next/server";

// 用 Yahoo Finance 公開 API（不需 token）
const INDICES = [
  { ticker: "^TWII", name: "台灣加權" },
  { ticker: "^DJI", name: "道瓊工業" },
  { ticker: "^GSPC", name: "S&P 500" },
  { ticker: "^IXIC", name: "那斯達克" },
  { ticker: "^HSI", name: "恆生指數" },
];

async function fetchQuote(ticker: string) {
  try {
    const resp = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=2d&interval=1d`,
      { next: { revalidate: 60 } }
    );
    if (!resp.ok) return { value: 0, change: 0, change_pct: 0 };
    const data = await resp.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return { value: 0, change: 0, change_pct: 0 };
    return {
      value: meta.regularMarketPrice || 0,
      change: meta.regularMarketPrice - meta.chartPreviousClose || 0,
      change_pct: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100) || 0,
    };
  } catch {
    return { value: 0, change: 0, change_pct: 0 };
  }
}

export async function GET() {
  const results = await Promise.all(
    INDICES.map(async (idx) => ({
      name: idx.name,
      ticker: idx.ticker,
      ...(await fetchQuote(idx.ticker)),
    }))
  );
  return NextResponse.json({
    success: true,
    indices: results,
    timestamp: new Date().toISOString(),
  });
}