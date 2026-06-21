import { NextResponse } from "next/server";

interface Holding {
  ticker: string;
  shares: number;
  unit: "股" | "張";
}

interface Advice {
  ticker: string;
  name: string;
  cost: number;
  current: number;
  shares: number;
  unit: string;
  pnl_pct: number;
  pnl_amt: number;
  market_value: number;
  advice: string;
  reason: string;
  stop_loss: number;
  target1: number;
  target2: number;
  risk_level: string;
  tech_score: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { holdings, cost_prices = {} } = body as { holdings: Holding[]; cost_prices: Record<string, number> };

    const yahooFinance = (await import("yahoo-finance2")).default;
    const results: Advice[] = [];

    for (const h of holdings) {
      try {
        // 自動加 .TW 後綴（台股純數字代號）
        const symbol = /^\d+$/.test(h.ticker) ? `${h.ticker}.TW` : h.ticker;
        const quote = await yahooFinance.quote(symbol);
        const price = quote.regularMarketPrice || 0;

        // 抓 60 日歷史算技術指標
        const end = new Date();
        const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        const history = await yahooFinance.historical(symbol, {
          period1: start,
          period2: end,
          interval: "1d",
        });

        const close = history.map((x: any) => x.close);
        const ma5 = close.slice(-5).reduce((a: number, b: number) => a + b, 0) / 5;
        const ma20 = close.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
        const ma60 = close.slice(-60).reduce((a: number, b: number) => a + b, 0) / 20;
        const high_60 = Math.max(...close.slice(-60));
        const low_60 = Math.min(...close.slice(-60));

        // 換算張數 → 股數
        const shares_in_shares = h.unit === "張" ? h.shares * 1000 : h.shares;

        // 成本價：優先用使用者輸入，否則用 60 日均價估算
        const cost = cost_prices[h.ticker] || (ma20 || price);

        const pnl_pct = (price / cost - 1) * 100;
        const pnl_amt = (price - cost) * shares_in_shares;
        const market_value = price * shares_in_shares;

        // 技術分數
        let tech_score = 0;
        if (price > ma5 && ma5 > ma20 && ma20 > ma60) tech_score = 22;
        else if (price > ma20 && ma20 > ma60) tech_score = 15;
        else if (price > ma20) tech_score = 8;
        else tech_score = 3;

        // 停損 / 目標
        const stop_loss = Math.max(low_60 * 0.98, price * 0.93);
        const risk = price - stop_loss;
        const target1 = price + risk * 2;
        const target2 = price + risk * 3;

        // 風險等級
        const vol = history.length > 20
          ? Math.sqrt(history.slice(-20).reduce((s: number, x: any, i: number, arr: any[]) => {
              if (i === 0) return 0;
              const ret = (x.close - arr[i - 1].close) / arr[i - 1].close;
              return s + ret * ret;
            }, 0) / 19) * Math.sqrt(252) * 100
          : 0;
        let risk_level = "低";
        if (vol > 50) risk_level = "高";
        else if (vol > 30) risk_level = "中";

        // AI 建議邏輯
        let advice = "續抱";
        let reason = "";

        if (pnl_pct >= 25) {
          advice = "停利";
          reason = `已獲利 ${pnl_pct.toFixed(1)}%，建議出場 1/3 鎖住利潤，剩下 2/3 改追蹤停損。`;
        } else if (pnl_pct >= 12) {
          advice = "續抱";
          reason = `已獲利 ${pnl_pct.toFixed(1)}%，趨勢仍強，建議續抱到 ${target1.toFixed(0)} 目標。`;
        } else if (pnl_pct <= -7) {
          advice = "停損";
          reason = `虧損 ${pnl_pct.toFixed(1)}% 觸及停損線（${stop_loss.toFixed(2)}），建議立即出場。`;
        } else if (pnl_pct <= -4) {
          advice = "減碼";
          reason = `虧損 ${pnl_pct.toFixed(1)}%，建議減碼 1/2 降低風險，若跌破 ${stop_loss.toFixed(2)} 全部出場。`;
        } else if (price < ma20 && pnl_pct < 5) {
          advice = "續抱";
          reason = `雖跌破月線 ($${ma20.toFixed(2)})，但跌幅有限，嚴設停損 ${stop_loss.toFixed(2)}。`;
        } else if (price >= high_60 * 0.95 && tech_score >= 18) {
          advice = "加碼";
          reason = `接近 60 日新高 $${high_60.toFixed(2)}，技術面強勁，可加碼 1/3 突破加倉。`;
        } else if (pnl_pct < 3) {
          advice = "續抱";
          reason = `目前損益持平 (${pnl_pct.toFixed(1)}%)，技術面 ${tech_score}/25 偏中性，建議續抱觀察。`;
        } else {
          advice = "續抱";
          reason = `獲利 ${pnl_pct.toFixed(1)}%，趨勢健康，建議續抱。`;
        }

        results.push({
          ticker: h.ticker,
          name: quote.longName || quote.shortName || h.ticker,
          cost,
          current: price,
          shares: h.shares,
          unit: h.unit,
          pnl_pct,
          pnl_amt,
          market_value,
          advice,
          reason,
          stop_loss,
          target1,
          target2,
          risk_level,
          tech_score,
        });
      } catch (e) {
        // 個股抓不到，給預設建議
        results.push({
          ticker: h.ticker,
          name: h.ticker,
          cost: 0,
          current: 0,
          shares: h.shares,
          unit: h.unit,
          pnl_pct: 0,
          pnl_amt: 0,
          market_value: 0,
          advice: "無法分析",
          reason: "無法取得報價，請檢查代號是否正確",
          stop_loss: 0,
          target1: 0,
          target2: 0,
          risk_level: "未知",
          tech_score: 0,
        });
      }
    }

    return NextResponse.json({ success: true, advice: results, timestamp: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}