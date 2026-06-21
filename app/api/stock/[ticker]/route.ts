import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker;
  try {
    const symbol = /^\d+$/.test(ticker) ? `${ticker}.TW` : ticker;

    // 抓 60 日歷史
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`;
    const resp = await fetch(url, { next: { revalidate: 300 } });
    if (!resp.ok) {
      return NextResponse.json({ success: false, error: "無法取得報價" }, { status: 500 });
    }
    const data = await resp.json();
    const result = data.chart?.result?.[0];
    if (!result) {
      return NextResponse.json({ success: false, error: "查無此股票" }, { status: 404 });
    }

    const meta = result.meta;
    const closes = result.indicators?.quote?.[0]?.close || [];
    const validCloses = closes.filter((c: number | null) => c !== null);
    const cur = validCloses[validCloses.length - 1] || 0;

    // 計算 MA
    const ma5 = validCloses.slice(-5).reduce((a: number, b: number) => a + b, 0) / 5;
    const ma20 = validCloses.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
    const ma60 = validCloses.slice(-60).reduce((a: number, b: number) => a + b, 0) / Math.min(60, validCloses.length);

    let tech_score = 0;
    let ma_position = "中性";
    if (cur > ma5 && ma5 > ma20 && ma20 > ma60) {
      tech_score = 22;
      ma_position = "完美多頭排列";
    } else if (cur > ma20 && ma20 > ma60) {
      tech_score = 15;
      ma_position = "站穩月線 + 季線向上";
    } else if (cur > ma20) {
      tech_score = 8;
      ma_position = "站穩月線";
    } else if (cur > ma5) {
      tech_score = 4;
      ma_position = "站穩 5MA";
    } else {
      ma_position = "跌破 5MA";
    }

    const high_60 = Math.max(...validCloses);
    const new_high = cur >= high_60 * 0.98;

    return NextResponse.json({
      success: true,
      stock: {
        ticker,
        name: meta.longName || meta.shortName || symbol,
        market: /^\d+$/.test(ticker) ? "TW" : "US",
        current_price: cur,
        change_pct: ((cur - meta.chartPreviousClose) / meta.chartPreviousClose * 100) || 0,
        change: cur - meta.chartPreviousClose,
        volume: meta.regularMarketVolume || 0,
        market_cap: meta.marketCap || 0,
        currency: meta.currency || "TWD",
        entry_zone: `${(cur * 0.98).toFixed(2)} ~ ${(cur * 1.02).toFixed(2)}`,
        stop_loss: (cur * 0.93).toFixed(2),
        target1: (cur * 1.14).toFixed(2),
        target2: (cur * 1.27).toFixed(2),
        ai_total: Math.min(85, 50 + tech_score + (new_high ? 15 : 0)),
        tech_score,
        ma_position,
        new_high_60: new_high,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}