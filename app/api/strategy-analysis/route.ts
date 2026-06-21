import { NextResponse } from "next/server";

interface Strategy {
  name: string;
  description: string;
  win_rate: number;
  avg_return: number;
  max_drawdown: number;
  trades: number;
  sharpe: number;
  score: number;
}

async function fetchHistory(ticker: string) {
  try {
    const resp = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1y&interval=1d`,
      { next: { revalidate: 3600 } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const closes = (result.indicators?.quote?.[0]?.close || []).filter((c: number | null) => c !== null);
    const volumes = (result.indicators?.quote?.[0]?.volume || []).filter((v: number | null) => v !== null);
    return { closes, volumes, meta: result.meta };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  if (!ticker) return NextResponse.json({ success: false, error: "缺少 ticker" }, { status: 400 });

  const symbol = /^\d+$/.test(ticker) ? `${ticker}.TW` : ticker;
  const data = await fetchHistory(symbol);
  if (!data || data.closes.length < 60) {
    return NextResponse.json({ success: false, error: "歷史資料不足" }, { status: 400 });
  }

  const { closes, volumes, meta } = data;
  const strategies: Strategy[] = [
    runMA20Breakout(closes, volumes),
    runVolumeBreakout(closes, volumes),
    runMomentum5(closes, volumes),
    runGoldenCross(closes, volumes),
    runMeanReversion(closes, volumes),
  ];

  const best = strategies.reduce((a, b) => (a.score > b.score ? a : b));

  return NextResponse.json({
    success: true,
    ticker,
    name: meta.longName || meta.shortName || ticker,
    strategies,
    best_strategy: best.name,
  });
}

function runMA20Breakout(close: number[], volume: number[]): Strategy {
  const trades: number[] = [];
  let position = false, entry = 0;
  for (let i = 20; i < close.length; i++) {
    const ma20 = close.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
    const vol_ma5 = volume.slice(i - 5, i).reduce((a, b) => a + b, 0) / 5;
    if (!position && close[i] > ma20 && volume[i] > vol_ma5 * 1.5) {
      position = true; entry = close[i];
    } else if (position && (close[i] < ma20 * 0.97 || close[i] > close[i - 1] * 1.15)) {
      trades.push((close[i] / entry - 1) * 100); position = false;
    }
  }
  return calcStats("均線 20 突破", "突破 20MA + 量能 1.5x", trades);
}

function runVolumeBreakout(close: number[], volume: number[]): Strategy {
  const trades: number[] = [];
  let position = false, entry = 0;
  for (let i = 20; i < close.length; i++) {
    const vol_ma5 = volume.slice(i - 5, i).reduce((a, b) => a + b, 0) / 5;
    if (!position && volume[i] > vol_ma5 * 3 && close[i] > close[i - 1] * 1.02) {
      position = true; entry = close[i];
    } else if (position && close[i] < entry * 0.93) {
      trades.push((close[i] / entry - 1) * 100); position = false;
    }
  }
  return calcStats("爆量突破", "量能爆 3 倍進場", trades);
}

function runMomentum5(close: number[], volume: number[]): Strategy {
  const trades: number[] = [];
  let position = false, entry = 0;
  for (let i = 5; i < close.length; i++) {
    const ret5 = (close[i] / close[i - 5] - 1) * 100;
    if (!position && ret5 > 5) {
      position = true; entry = close[i];
    } else if (position && (close[i] < entry * 0.95 || ret5 < -5)) {
      trades.push((close[i] / entry - 1) * 100); position = false;
    }
  }
  return calcStats("5 日動能", "5 日漲 > 5%", trades);
}

function runGoldenCross(close: number[], volume: number[]): Strategy {
  const trades: number[] = [];
  let position = false, entry = 0;
  for (let i = 20; i < close.length; i++) {
    const ma5_now = close.slice(i - 5, i).reduce((a, b) => a + b, 0) / 5;
    const ma20_now = close.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
    const ma5_prev = close.slice(i - 6, i - 1).reduce((a, b) => a + b, 0) / 5;
    const ma20_prev = close.slice(i - 21, i - 1).reduce((a, b) => a + b, 0) / 20;
    const cross_up = ma5_prev < ma20_prev && ma5_now > ma20_now;
    const cross_down = ma5_prev > ma20_prev && ma5_now < ma20_now;
    if (!position && cross_up) { position = true; entry = close[i]; }
    else if (position && cross_down) {
      trades.push((close[i] / entry - 1) * 100); position = false;
    }
  }
  return calcStats("黃金交叉", "5MA 穿越 20MA", trades);
}

function runMeanReversion(close: number[], volume: number[]): Strategy {
  const trades: number[] = [];
  let position = false, entry = 0;
  for (let i = 20; i < close.length; i++) {
    const ma20 = close.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
    const deviation = (close[i] / ma20 - 1) * 100;
    if (!position && deviation < -10) {
      position = true; entry = close[i];
    } else if (position && (close[i] > ma20 || close[i] < entry * 0.95)) {
      trades.push((close[i] / entry - 1) * 100); position = false;
    }
  }
  return calcStats("均值回歸", "跌破月線 10% 反彈", trades);
}

function calcStats(name: string, description: string, trades: number[]): Strategy {
  if (trades.length === 0) {
    return { name, description, win_rate: 0, avg_return: 0, max_drawdown: 0, trades: 0, sharpe: 0, score: 0 };
  }
  const wins = trades.filter(t => t > 0);
  const win_rate = wins.length / trades.length * 100;
  const avg_return = trades.reduce((a, b) => a + b, 0) / trades.length;
  let peak = 0, max_dd = 0, cum = 0;
  for (const t of trades) {
    cum += t;
    if (cum > peak) peak = cum;
    const dd = peak - cum;
    if (dd > max_dd) max_dd = dd;
  }
  const std = Math.sqrt(trades.reduce((s, t) => s + (t - avg_return) ** 2, 0) / trades.length);
  const sharpe = std > 0 ? (avg_return / std) * Math.sqrt(252 / 20) : 0;
  const score = Math.min(100, Math.max(0,
    win_rate * 0.4 + Math.min(avg_return * 5, 30) + Math.min(sharpe * 10, 20) + (trades.length > 5 ? 10 : 0)
  ));
  return { name, description, win_rate, avg_return, max_drawdown: max_dd, trades: trades.length, sharpe, score: Math.round(score) };
}