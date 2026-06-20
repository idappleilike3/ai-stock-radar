import { NextResponse } from "next/server";

const STOCKS = {
  tw: ["2330", "2317", "2454", "2308", "2303", "2382", "2379", "3034", "3711"],
  us: ["AAPL", "MSFT", "NVDA", "TSLA", "AMD", "MU", "TSM", "MRVL"],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const market = searchParams.get("market") || "tw";

  // 真實部署時呼叫 stock-radar Python API 或內建邏輯
  // 簡化版：回傳 mock 資料
  const tickers = STOCKS[market as keyof typeof STOCKS] || STOCKS.tw;

  return NextResponse.json({
    success: true,
    market,
    tickers,
    timestamp: new Date().toISOString(),
    note: "呼叫本地 stock-radar Python 邏輯或 Vercel Cron",
  });
}