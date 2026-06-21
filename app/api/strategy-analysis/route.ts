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

/**
 * 策略分析：對單檔股票跑多個策略，回測比較
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  if (!ticker) return NextResponse.json({ success: false, error: "缺少 ticker" }, { status: 400 });

  try {
    const yahooFinance = (await import("yahoo-finance2")).default;
    const symbol = /^\d+$/.test(ticker) ? `${ticker}.TW` : ticker;

    // 抓 1 年歷史
    const end = new Date();
    const start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
    const history = await yahooFinance.historical(symbol, {
      period1: start,
      period2: end,
      interval: "1d",
    });

    if (history.length < 60) {
      return NextResponse.json({ success: false, error: "歷史資料不足" }, { status: 400 });
    }

    const close = history.map((h: any) => h.close);
    const volume = history.map((h: any) => h.volume);

    // 5 種策略
    const strategies: Strategy[] = [
      runMA20Breakout(close, volume),
      runVolumeBreakout(close, volume),
      runMomentum5(close, volume),
      runMeanReversion(close, volume),
      runGoldenCross(close, volume),
    ];

    // 計算最佳
    const best = strategies.reduce((a, b) => (a.score > b.score ? a : b));

    const quote = await yahooFinance.quote(symbol);

    return NextResponse.json({
      success: true,
      ticker,
      name: quote.longName || quote.shortName || ticker,
      strategies,
      best_strategy: best.name,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// === 5 種策略實作 ===

function runMA20Breakout(close: number[], volume: number[]): Strategy {
  // 策略: 突破 20 日均線 + 量能放大 1.5x
  const trades: number[] = [];
  let position = false;
  let entry = 0;

  for (let i = 20; i < close.length; i++) {
    const ma20 = close.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
    const vol_ma5 = volume.slice(i - 5, i).reduce((a, b) => a + b, 0) / 5;

    if (!position && close[i] > ma20 && volume[i] > vol_ma5 * 1.5) {
      position = true;
      entry = close[i];
    } else if (position && (close[i] < ma20 * 0.97 || close[i] > close[i - 1] * 1.15)) {
      trades.push((close[i] / entry - 1) * 100);
      position = false;
    }
  }

  return calcStats(trades, "均線 20 突破", "股價突破 20 日均線 + 量能放大 1.5x 進場，跌破 3% 出場");
}

function runVolumeBreakout(close: number[], volume: number[]): Strategy {
  // 策略: 爆量 3x 進場
  const trades: number[] = [];
  let position = false;
  let entry = 0;
  const vol_ma20 = volume.slice(0, 20).reduce((a, b) => a + b, 0) / 20;

  for (let i = 20; i < close.length; i++) {
    const cur_vol_ma5 = volume.slice(i - 5, i).reduce((a, b) => a + b, 0) / 5;

    if (!position && volume[i] > cur_vol_ma5 * 3 && close[i] > close[i - 1] * 1.02) {
      position = true;
      entry = close[i];
    } else if (position && close[i] < entry * 0.93) {
      trades.push((close[i] / entry - 1) * 100);
      position = false;
    }
  }
  return calcStats(trades, "爆量突破", "成交量爆 3 倍進場，跌 7% 出場");
}

function runMomentum5(close: number[], volume: number[]): Strategy {
  // 策略: 5 日動能 > 5% 進場
  const trades: number[] = [];
  let position = false;
  let entry = 0;

  for (let i = 5; i < close.length; i++) {
    const ret5 = (close[i] / close[i - 5] - 1) * 100;

    if (!position && ret5 > 5) {
      position = true;
      entry = close[i];
    } else if (position && (close[i] < entry * 0.95 || ret5 < -5)) {
      trades.push((close[i] / entry - 1) * 100);
      position = false;
    }
  }
  return calcStats(trades, "5 日動能", "5 日漲幅 > 5% 進場，跌 5% 出場");
}

function runMeanReversion(close: number[], volume: number[]): Strategy {
  // 策略: 跌 10% 反彈進場
  const trades: number[] = [];
  let position = false;
  let entry = 0;

  for (let i = 20; i < close.length; i++) {
    const ma20 = close.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
    const deviation = (close[i] / ma20 - 1) * 100;

    if (!position && deviation < -10) {
      position = true;
      entry = close[i];
    } else if (position && (close[i] > ma20 || close[i] < entry * 0.95)) {
      trades.push((close[i] / entry - 1) * 100);
      position = false;
    }
  }
  return calcStats(trades, "均值回歸", "跌破月線 10% 反彈進場，漲回月線出場");
}

function runGoldenCross(close: number[], volume: number[]): Strategy {
  // 策略: 5MA 黃金交叉 20MA
  const trades: number[] = [];
  let position = false;
  let entry = 0;

  for (let i = 20; i < close.length; i++) {
    const ma5_now = close.slice(i - 5, i).reduce((a, b) => a + b, 0) / 5;
    const ma20_now = close.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
    const ma5_prev = close.slice(i - 6, i - 1).reduce((a, b) => a + b, 0) / 5;
    const ma20_prev = close.slice(i - 21, i - 1).reduce((a, b) => a + b, 0) / 20;

    const cross_up = ma5_prev < ma20_prev && ma5_now > ma20_now;
    const cross_down = ma5_prev > ma20_prev && ma5_now < ma20_now;

    if (!position && cross_up) {
      position = true;
      entry = close[i];
    } else if (position && cross_down) {
      trades.push((close[i] / entry - 1) * 100);
      position = false;
    }
  }
  return calcStats(trades, "黃金交叉", "5MA 向上穿越 20MA 進場，死亡交叉出場");
}

function calcStats(trades: number[], name: string, description: string): Strategy {
  if (trades.length === 0) {
    return {
      name,
      description,
      win_rate: 0,
      avg_return: 0,
      max_drawdown: 0,
      trades: 0,
      sharpe: 0,
      score: 0,
    };
  }

  const wins = trades.filter(t => t > 0);
  const win_rate = (wins.length / trades.length) * 100;
  const avg_return = trades.reduce((a, b) => a + b, 0) / trades.length;

  // 最大回撤
  let peak = 0;
  let max_dd = 0;
  let cum = 0;
  for (const t of trades) {
    cum += t;
    if (cum > peak) peak = cum;
    const dd = peak - cum;
    if (dd > max_dd) max_dd = dd;
  }

  // 夏普比率
  const avg = avg_return;
  const std = Math.sqrt(trades.reduce((s, t) => s + (t - avg) ** 2, 0) / trades.length);
  const sharpe = std > 0 ? (avg / std) * Math.sqrt(252 / 20) : 0;

  // 綜合評分
  const score = Math.min(100, Math.max(0,
    win_rate * 0.4 + Math.min(avg_return * 5, 30) + Math.min(sharpe * 10, 20) + (trades.length > 5 ? 10 : 0)
  ));

  return {
    name,
    description,
    win_rate,
    avg_return,
    max_drawdown: max_dd,
    trades: trades.length,
    sharpe,
    score: Math.round(score),
  };
}