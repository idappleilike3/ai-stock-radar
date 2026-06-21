import { NextResponse } from "next/server";

interface Holding {
  ticker: string;
  shares: number;
  unit: "股" | "張";
}

const TW_NAMES: Record<string, string> = {
  "2330": "台積電", "2317": "鴻海", "2454": "聯發科", "2308": "台達電",
  "2303": "聯電", "2379": "瑞昱", "3034": "聯詠", "2344": "華邦電",
  "2408": "南亞科", "2885": "元大金", "2886": "兆豐金", "3293": "鑫豪",
};

function getName(ticker: string, apiName?: string): string {
  if (apiName && !apiName.includes(".TW") && apiName.length > 3) return apiName;
  return TW_NAMES[ticker] || ticker;
}

async function fetchStock(ticker: string) {
  try {
    const symbol = /^\d+$/.test(ticker) ? `${ticker}.TW` : ticker;
    const resp = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`,
      { next: { revalidate: 300 } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.chart?.result?.[0] || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { holdings, cost_prices = {} } = body as { holdings: Holding[]; cost_prices: Record<string, number> };

    const results = [];

    for (const h of holdings) {
      try {
        const data = await fetchStock(h.ticker);
        if (!data) {
          results.push({
            ticker: h.ticker,
            name: h.ticker,
            cost: 0, current: 0, shares: h.shares, unit: h.unit,
            pnl_pct: 0, pnl_amt: 0, market_value: 0,
            advice: "無法分析", reason: "無法取得報價，請檢查代號",
            stop_loss: 0, target1: 0, target2: 0,
            risk_level: "未知", tech_score: 0,
          });
          continue;
        }

        const meta = data.meta;
        const closes = (data.indicators?.quote?.[0]?.close || []).filter((c: number | null) => c !== null);
        const price = closes[closes.length - 1] || 0;
        const ma5 = closes.slice(-5).reduce((a: number, b: number) => a + b, 0) / 5;
        const ma20 = closes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
        const ma60 = closes.slice(-60).reduce((a: number, b: number) => a + b, 0) / Math.min(60, closes.length);
        const high_60 = Math.max(...closes);
        const low_60 = Math.min(...closes.slice(-60));

        const shares_in_shares = h.unit === "張" ? h.shares * 1000 : h.shares;
        const cost = cost_prices[h.ticker] || ma20;
        const pnl_pct = (price / cost - 1) * 100;
        const pnl_amt = (price - cost) * shares_in_shares;
        const market_value = price * shares_in_shares;

        let tech_score = 0;
        if (price > ma5 && ma5 > ma20 && ma20 > ma60) tech_score = 22;
        else if (price > ma20 && ma20 > ma60) tech_score = 15;
        else if (price > ma20) tech_score = 8;
        else tech_score = 3;

        const stop_loss = Math.max(low_60 * 0.98, price * 0.93);
        const risk = price - stop_loss;
        const target1 = price + risk * 2;
        const target2 = price + risk * 3;

        let advice = "續抱";
        let reason = "";

        if (pnl_pct >= 25) {
          advice = "停利";
          reason = `已獲利 ${pnl_pct.toFixed(1)}%，建議出場 1/3 鎖利，2/3 改追蹤停損`;
        } else if (pnl_pct >= 12) {
          advice = "續抱";
          reason = `獲利 ${pnl_pct.toFixed(1)}%，趨勢強，續抱到目標 ${target1.toFixed(0)}`;
        } else if (pnl_pct <= -7) {
          advice = "停損";
          reason = `虧損 ${pnl_pct.toFixed(1)}% 觸停損線 (${stop_loss.toFixed(2)})，立即出場`;
        } else if (pnl_pct <= -4) {
          advice = "減碼";
          reason = `虧損 ${pnl_pct.toFixed(1)}%，建議減碼 1/2，跌破 ${stop_loss.toFixed(2)} 全出`;
        } else if (price >= high_60 * 0.95 && tech_score >= 15) {
          advice = "加碼";
          reason = `接近 60 日新高 ${high_60.toFixed(2)}，技術強可加碼 1/3`;
        } else {
          advice = "續抱";
          reason = `損益 ${pnl_pct >= 0 ? "+" : ""}${pnl_pct.toFixed(1)}%，技術面 ${tech_score}/25，續抱觀察`;
        }

        results.push({
          ticker: h.ticker,
          name: getName(h.ticker, meta.longName || meta.shortName),
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
          risk_level: "中",
          tech_score,
        });
      } catch {
        results.push({
          ticker: h.ticker,
          name: h.ticker,
          cost: 0, current: 0, shares: h.shares, unit: h.unit,
          pnl_pct: 0, pnl_amt: 0, market_value: 0,
          advice: "錯誤", reason: "處理失敗",
          stop_loss: 0, target1: 0, target2: 0,
          risk_level: "未知", tech_score: 0,
        });
      }
    }

    return NextResponse.json({ success: true, advice: results, timestamp: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}