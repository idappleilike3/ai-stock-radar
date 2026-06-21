import { NextResponse } from "next/server";

// 台股中文名稱對照表（fallback 當 Yahoo 沒回傳名稱時使用）
const TW_NAMES: Record<string, string> = {
  "2330": "台積電", "2317": "鴻海", "2454": "聯發科", "2308": "台達電",
  "2303": "聯電", "2379": "瑞昱", "3034": "聯詠", "3711": "日月光投控",
  "6669": "緯穎", "3529": "力旺", "3443": "創意", "5347": "世界",
  "8299": "群聯", "6531": "愛普", "2382": "廣達", "2376": "技嘉",
  "2324": "仁寶", "6213": "聯茂", "3017": "奇鋐", "3661": "世芯-KY",
  "2344": "華邦電", "2408": "南亞科", "2313": "華通", "2357": "華碩",
  "3037": "欣興", "4958": "臻鼎-KY", "2368": "金像電", "3189": "景碩",
  "2881": "富邦金", "2882": "國泰金", "2884": "玉山金", "2885": "元大金",
  "2886": "兆豐金", "2603": "長榮", "2609": "陽明", "2615": "萬海",
  "2002": "中鋼", "1301": "台塑", "1303": "南亞", "1326": "台化",
  "3293": "鑫豪", "4763": "材料-KY", "6655": "科定", "8069": "元太",
};

function getDisplayName(ticker: string, apiName?: string): string {
  // 優先順序：API 回傳名稱 → 中文對照表 → 代號
  if (apiName && !apiName.includes(".TW") && apiName.length > 3) {
    return apiName;
  }
  const cleanTicker = ticker.replace(".TW", "");
  return TW_NAMES[cleanTicker] || cleanTicker;
}

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
        name: meta.longName || meta.shortName || symbol.replace(".TW", ""),
        display_name: getDisplayName(ticker, meta.longName || meta.shortName),
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