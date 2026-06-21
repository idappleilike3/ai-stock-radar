import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker;
  try {
    const yahooFinance = (await import("yahoo-finance2")).default;
    const suffix = /^\d+$/.test(ticker) ? ".TW" : "";
    const symbol = ticker + suffix;

    const quote = await yahooFinance.quote(symbol);

    // 抓近 60 日歷史計算技術指標
    const end = new Date();
    const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
    const history = await yahooFinance.historical(symbol, {
      period1: start,
      period2: end,
      interval: "1d",
    });

    // 簡單技術指標
    let tech_score = 0;
    let ma_position = "";
    if (history.length >= 60) {
      const close = history.map((h: any) => h.close);
      const ma5 = close.slice(-5).reduce((a: number, b: number) => a + b, 0) / 5;
      const ma20 = close.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
      const ma60 = close.slice(-60).reduce((a: number, b: number) => a + b, 0) / 60;
      const cur = close[close.length - 1];
      ma_position = cur > ma5 ? "站穩 5MA" : cur < ma5 ? "跌破 5MA" : "";
      ma_position += cur > ma20 ? " + 站穩月線" : "";
      ma_position += ma5 > ma20 ? " + 短期多頭" : "";
      if (cur > ma5 && ma5 > ma20 && ma20 > ma60) tech_score += 20;
      else if (cur > ma20 && ma20 > ma60) tech_score += 12;
    }

    const high_60 = history.length >= 60
      ? Math.max(...history.slice(-60).map((h: any) => h.high))
      : quote.regularMarketDayHigh || 0;
    const new_high = (quote.regularMarketPrice || 0) >= high_60 * 0.98;

    return NextResponse.json({
      success: true,
      stock: {
        ticker,
        name: quote.longName || quote.shortName || ticker,
        market: suffix ? "TW" : "US",
        current_price: quote.regularMarketPrice || 0,
        change_pct: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        market_cap: quote.marketCap || 0,
        entry_zone: `${(quote.regularMarketPrice * 0.98).toFixed(2)} ~ ${(quote.regularMarketPrice * 1.02).toFixed(2)}`,
        stop_loss: (quote.regularMarketPrice * 0.93).toFixed(2),
        target1: (quote.regularMarketPrice * 1.14).toFixed(2),
        target2: (quote.regularMarketPrice * 1.27).toFixed(2),
        ai_total: Math.min(85, 50 + tech_score + (new_high ? 15 : 0)),
        tech_score,
        ma_position,
        new_high_60: new_high,
        ipo_year: quote.firstTradeDateMilliseconds
          ? new Date(quote.firstTradeDateMilliseconds).getFullYear()
          : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}