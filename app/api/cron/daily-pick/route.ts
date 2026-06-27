// /api/cron/daily-pick — 台股盤前作戰計畫（08:00）
// 三類分群：短線/波段/翻倍 + 完整欄位 + 異常驗證 + 持有紀律 + 觀望選項
// v2.0 — 2026-06-23 升級（潘珮淩規格書）

import { NextResponse } from "next/server";
import { TW_STOCKS, EXCLUDED_STOCKS, TwStock } from "@/lib/tw-stocks";

interface StockScore {
  id: string;
  name: string;
  sector: string;
  tag: TwStock["tag"];
  price: number;
  change: number;
  ret5_pct: number;
  ret20_pct: number;
  volume_ratio: number;
  momentum: number;
  trend: number;
  volume: number;
  strength: number;
  fund: number;
  industry: number;
  financial: number;
  theme: number;
  total: number;
  rank: "A" | "B" | "C" | "D";
  signal: string;
  category: "short" | "mid" | "long" | "avoid";
  reasons: string[];
  warning?: string;
  isAnomaly: boolean;
  buy_zone: [number, number];
  support_zone: [number, number];
  pressure_zone: [number, number];
  stop_loss: number;
  target1: number;
  target2: number;
  target3?: number;
  risk: "低" | "中" | "高";
}

async function fetchStock(ticker: string) {
  try {
    const symbol = `${ticker}.TW`;
    const resp = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`,
      { next: { revalidate: 600 } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.chart?.result?.[0] || null;
  } catch {
    return null;
  }
}

function scoreStock(meta: any, closes: number[], volumes: number[], stock: TwStock): Omit<StockScore, "rank" | "signal" | "category" | "reasons" | "warning" | "risk" | "isAnomaly"> {
  const price = closes[closes.length - 1] || 0;
  const prev = closes[closes.length - 2] || price;
  const change = ((price / prev) - 1) * 100;

  // === 1. 技術面（25%）===
  const ma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const ma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const ma60 = closes.slice(-60).reduce((a, b) => a + b, 0) / Math.min(60, closes.length);
  const high60 = Math.max(...closes.slice(-60));
  const low60 = Math.min(...closes.slice(-60));
  const ret5 = closes.length >= 5 ? ((price / closes[closes.length - 6]) - 1) * 100 : 0;
  const ret20 = closes.length >= 20 ? ((price / closes[closes.length - 21]) - 1) * 100 : 0;

  const momentum = Math.max(0, Math.min(100, 50 + ret5 * 5));
  const trend = Math.max(0, Math.min(100, 50 + ((price / ma20) - 1) * 200));

  const vol5 = volumes.slice(-6, -1).reduce((a, b) => a + b, 0) / 5;
  const todayVol = volumes[volumes.length - 1] || 0;
  const volume_ratio = vol5 > 0 ? todayVol / vol5 : 1;
  const volume = Math.max(0, Math.min(100, 50 + (volume_ratio - 1) * 50));

  let strength = 0;
  if (price > ma5) strength += 25;
  if (ma5 > ma10) strength += 20;
  if (ma10 > ma20) strength += 20;
  if (ma20 > ma60) strength += 20;
  if (price > ma60) strength += 15;

  const tech_total = momentum * 0.30 + trend * 0.30 + volume * 0.20 + strength * 0.20;

  // === 2. 籌碼面（25%）===
  // 簡化版：用均線糾結 + 突破作為主力訊號
  // 真實版：需 FinMind 法人買超資料（之後接）
  const chip_total = (strength + volume) / 2; // 暫代

  // === 3. 產業面（20%）===
  const industryScores: Record<string, number> = {
    ai: 95,      // AI / ASIC / Data Center / 光通訊 / 低軌衛星
    semi: 85,    // 半導體 / IC 設計
    evt: 80,     // 軍工 / 能源
    bio: 65,     // 生技
    fin: 60,     // 金融
  };
  const industry_total = industryScores[stock.tag] || 60;

  // === 4. 財報面（15%）===
  // 簡化版：用趨勢強度作為基本面代位指標
  // 真實版：需公開 API 拉營收/EPS（之後接）
  const financial_total = Math.max(0, Math.min(100, 50 + ret20 * 2));

  // === 5. 題材面（15%）===
  // 簡化版：用產業分類評分
  const theme_total = industry_total;

  // 總分（加權）
  const total = Math.round(
    tech_total * 0.25 +
    chip_total * 0.25 +
    industry_total * 0.20 +
    financial_total * 0.15 +
    theme_total * 0.15
  );

  // === 價格區間計算 ===
  const support_zone: [number, number] = [
    Math.round(low60 * 0.98),
    Math.round(ma20 * 0.97),
  ];
  const pressure_zone: [number, number] = [
    Math.round(price * 1.05),
    Math.round(high60 * 1.02),
  ];
  const buy_zone: [number, number] = [
    Math.round(ma20 * 0.99),
    Math.round(price * 1.01),
  ];
  const stop_loss = Math.max(low60 * 0.98, price * 0.93);
  const risk_amt = price - stop_loss;
  const target1 = Math.round(price + risk_amt * 2);
  const target2 = Math.round(price + risk_amt * 3);
  const target3 = Math.round(price + risk_amt * 5);

  return {
    id: stock.id,
    name: stock.name,
    sector: stock.sector,
    tag: stock.tag,
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    ret5_pct: Math.round(ret5 * 100) / 100,
    ret20_pct: Math.round(ret20 * 100) / 100,
    volume_ratio: Math.round(volume_ratio * 100) / 100,
    momentum: Math.round(momentum),
    trend: Math.round(trend),
    volume: Math.round(volume),
    strength: Math.round(strength),
    fund: Math.round(chip_total),
    industry: Math.round(industry_total),
    financial: Math.round(financial_total),
    theme: Math.round(theme_total),
    total,
    support_zone,
    pressure_zone,
    buy_zone,
    stop_loss: Math.round(stop_loss * 100) / 100,
    target1,
    target2,
    target3,
  };
}

function classify(score: Omit<StockScore, "rank" | "signal" | "category" | "reasons" | "warning" | "risk" | "isAnomaly">): {
  rank: StockScore["rank"];
  signal: string;
  category: StockScore["category"];
  risk: StockScore["risk"];
  reasons: string[];
  warning?: string;
  isAnomaly: boolean;
} {
  const reasons: string[] = [];
  let warning: string | undefined;
  let isAnomaly = false;

  // === 黑名單硬排除（2026-06-28 蝦董親定，最優先）===
  if (EXCLUDED_STOCKS.includes(score.id)) {
    isAnomaly = true;
    warning = `🚫 黑名單強制排除（異常噴出 / 個股事件）`;
  }
  // === 異常驗證（用原始 % 數，不是 clamp 後的 0-100）===
  else if (Math.abs(score.change) > 15) {
    isAnomaly = true;
    warning = `⚠️ 單日 ${score.change.toFixed(1)}% > 15% 異常資料需驗證`;
  } else if (Math.abs(score.ret5_pct) > 40) {
    isAnomaly = true;
    warning = `⚠️ 5 日 ${score.ret5_pct.toFixed(1)}% > 40% 異常資料需驗證`;
  } else if (Math.abs(score.ret20_pct) > 80) {
    isAnomaly = true;
    warning = `⚠️ 20 日 ${score.ret20_pct.toFixed(1)}% > 80% 異常資料需驗證`;
  }

  // 推薦理由
  if (score.momentum >= 70 && !isAnomaly) reasons.push(`5 日漲 +${(score.momentum - 50) / 5 | 0}%`);
  if (score.volume_ratio > 1.5 && !isAnomaly) reasons.push(`量能放大 ${score.volume_ratio.toFixed(1)}x`);
  if (score.strength >= 80) reasons.push("多頭排列");
  if (score.change > 0 && Math.abs(score.change) <= 10) reasons.push(`當日 +${score.change.toFixed(2)}%`);

  // 等級
  let rank: StockScore["rank"];
  if (isAnomaly) {
    rank = "D"; // 異常股一律 D 級（不列入評分）
  } else if (score.total >= 80) rank = "A";
  else if (score.total >= 70) rank = "B";
  else if (score.total >= 60) rank = "C";
  else rank = "D";

  // 分類（三類）
  let category: StockScore["category"];
  let signal: string;

  // ⚠️ 異常股 → 直接進 avoid，不論 score 多高
  if (isAnomaly) {
    category = "avoid";
    signal = "⚠️ 異常資料";
  }
  // 短線：動能高 + 量能放大 + 多頭
  else if (score.momentum >= 70 && score.volume >= 65 && score.strength >= 70) {
    category = "short";
    signal = "🔥 短線狙擊";
  }
  // 翻倍股：產業熱 + 趨勢穩定 + 強度高（AI/半導體）
  else if (score.industry >= 80 && score.trend >= 60 && score.strength >= 60 && (score.tag === "ai" || score.tag === "semi" || score.tag === "evt")) {
    category = "long";
    signal = "🚀 翻倍候選";
  }
  // 波段：趨勢穩 + 強度中上
  else if (score.trend >= 60 && score.strength >= 50) {
    category = "mid";
    signal = "📈 波段追蹤";
  }
  // 不建議追價
  else {
    category = "avoid";
    signal = "⚪ 觀望";
  }

  // 風險等級
  let risk: StockScore["risk"];
  if (isAnomaly) risk = "高";
  else if (score.volume_ratio > 2 || score.momentum > 100) risk = "高";
  else if (score.total >= 70) risk = "中";
  else risk = "低";

  return { rank, signal, category, risk, reasons, warning, isAnomaly };
}

function fmtStock(s: StockScore): string[] {
  const medal = s.category === "short" ? "🎯" : s.category === "mid" ? "📊" : s.category === "long" ? "🌟" : "⚪";
  const changeIcon = s.change >= 0 ? "🟢" : "🔴";
  const lines = [
    `${medal} *${s.name}* (${s.id}) ${s.signal} [${s.rank} 級 ${s.total}分]`,
    `   💰 現價 ${s.price} ${changeIcon} ${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}%`,
    `   📊 技術${s.momentum} 趨勢${s.trend} 量能${s.volume} 強度${s.strength} | 籌碼${s.fund} 產業${s.industry}`,
    `   🏷️ ${s.sector}${s.reasons.length > 0 ? ` ｜ ${s.reasons.join("、")}` : ""}`,
    `   🟢 買進區 ${s.buy_zone[0]}-${s.buy_zone[1]} ｜ 🔴 停損 ${s.stop_loss}`,
    `   🛡️ 支撐 ${s.support_zone[0]}-${s.support_zone[1]} ｜ ⚡ 壓力 ${s.pressure_zone[0]}-${s.pressure_zone[1]}`,
    `   🎯 目標 ①${s.target1} ②${s.target2} ③${s.target3 ?? "-"} ｜ ⚠️ 風險:${s.risk}`,
  ];
  if (s.warning) lines.push(`   ${s.warning}`);
  return lines;
}

export async function GET(request: Request) {
  const startTime = Date.now();

  // 認證
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "蝦董內部專用";
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 抓 30 檔台股重點股（先過濾黑名單 2026-06-28）
  const focusStocks = TW_STOCKS
    .slice(0, 30)
    .filter(s => !EXCLUDED_STOCKS.includes(s.id));

  const results = await Promise.all(
    focusStocks.map(async (s) => {
      const data = await fetchStock(s.id);
      if (!data) return null;
      const closes = (data.indicators?.quote?.[0]?.close || []).filter((c: number | null) => c !== null);
      const volumes = (data.indicators?.quote?.[0]?.volume || []).filter((v: number | null) => v !== null);
      if (closes.length < 60) return null;
      const base = scoreStock(data.meta, closes, volumes, s);
      const cls = classify(base);
      return { ...base, ...cls };
    })
  );

  const valid = results.filter((r): r is StockScore => r !== null);

  // 異常股（絕不列入推薦）
  const anomalies = valid.filter(s => s.isAnomaly).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const normal = valid.filter(s => !s.isAnomaly);

  // 三類分組（只看 normal）
  const shorts = normal.filter(s => s.category === "short").sort((a, b) => b.total - a.total);
  const mids = normal.filter(s => s.category === "mid").sort((a, b) => b.total - a.total);
  const longs = normal.filter(s => s.category === "long").sort((a, b) => b.total - a.total);
  const avoids = normal.filter(s => s.category === "avoid").sort((a, b) => a.total - b.total); // 分數最低 = 最不建議追

  // 觀望邏輯：沒有任何 A 級（80+）訊號
  const hasGradeA = normal.some(s => s.rank === "A");
  const isQuietDay = !hasGradeA;

  // 組訊息
  const today = new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", weekday: "short" });
  const lines: string[] = [
    `🚀 *台股盤前作戰計畫* — ${today}`,
    `掃描 ${focusStocks.length} 檔重點股｜AI 評分 0-100（A 級 80+ / B 級 70-79 / C 級 60-69）`,
    ``,
  ];

  if (isQuietDay) {
    lines.push(
      `🟡 *今日觀望*`,
      `目前沒有 A 級訊號。順勢而為，沒有高勝率時不進場。`,
      `等待 ①放量突破 ②法人大買 ③產業新利多 三大訊號。`,
      ``,
    );
  } else {
    // 短線狙擊
    lines.push(`🎯 *今日短線狙擊 Top 3*（5-14 天，目標 20-60%）`, ``);
    (shorts.length ? shorts : mids).slice(0, 3).forEach(s => lines.push(...fmtStock(s), ``));

    // 波段研究所
    lines.push(`📊 *今日波段追蹤 Top 3*（30-60 天，目標 30-100%）`, ``);
    mids.slice(0, 3).forEach(s => lines.push(...fmtStock(s), ``));

    // 翻倍股雷達
    lines.push(`🌟 *今日翻倍候選 Top 3*（3-12 個月，目標 100%+）`, ``);
    longs.slice(0, 3).forEach(s => lines.push(...fmtStock(s), ``));

    // 不建議追價
    lines.push(`⚪ *不建議追價 Top 3*`, ``);
    avoids.slice(0, 3).forEach(s => lines.push(...fmtStock(s), ``));
  }

  // ⚠️ 異常資料區（獨立列出，絕不列入推薦）
  if (anomalies.length > 0) {
    lines.push(
      `⚠️ *異常資料需驗證*（${anomalies.length} 檔）`,
      `以下股票因報價/除權息調整異常，*不列入任何推薦*，待驗證後手動評估。`,
      ``,
    );
    anomalies.forEach(s => {
      const changeIcon = s.change >= 0 ? "🟢" : "🔴";
      lines.push(
        `• *${s.name}* (${s.id}) ${changeIcon} 現價 ${s.price}｜當日 ${s.change.toFixed(2)}%`,
        `  5 日 ${s.ret5_pct.toFixed(1)}%｜20 日 ${s.ret20_pct.toFixed(1)}%｜${s.warning}`,
        ``,
      );
    });
  }

  // 持有紀律
  lines.push(
    `━━━━━━━━━━━━`,
    `📋 *持有紀律*（順勢而為，抱住主升段）`,
    `• 跌破 5MA：🟡 短線回調，觀察即可`,
    `• 跌破 10MA：🟡 中繼整理，觀察即可`,
    `• 跌破 20MA：⚠️ 趨勢轉弱，提高警覺`,
    `• 跌破 20MA 連 3 天站不回：🟠 減碼 50%`,
    `• 跌破 60MA：🔴 趨勢結束，建議出場`,
    `• 量縮回檔+守支撐+主力未出貨+產業強：🟢 正常回調，續抱`,
    ``,
    `🔗 https://ai-stock-radar.vercel.app`,
  );

  const message = lines.join("\n");

  // 推 Telegram
  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatIdRaw = (process.env.TELEGRAM_CHAT_ID || "").trim();
  const chatId = parseInt(chatIdRaw.replace(/[^0-9]/g, ""), 10);

  if (!token || !chatId) {
    return NextResponse.json({ success: false, error: "Telegram token/chat_id not set" }, { status: 500 });
  }

  // 如果訊息太長（>4096）分兩則
  let tgResult: any = { ok: false };
  if (message.length <= 4096) {
    const tgResp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
    });
    tgResult = await tgResp.json();
  } else {
    // 拆成前半 + 持有紀律
    const splitIdx = message.lastIndexOf("━━━━", message.indexOf("持有紀律"));
    const part1 = message.substring(0, splitIdx);
    const part2 = message.substring(splitIdx);
    const tg1 = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: part1, disable_web_page_preview: true }),
    });
    const tg2 = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: part2, disable_web_page_preview: true }),
    });
    tgResult = { ok: (await tg1.json()).ok, split: true };
  }

  return NextResponse.json({
    success: tgResult.ok,
    scanned: focusStocks.length,
    counts: { short: shorts.length, mid: mids.length, long: longs.length, avoid: avoids.length },
    isQuietDay,
    top3: {
      short: shorts.slice(0, 3).map(s => ({ id: s.id, name: s.name, total: s.total })),
      mid: mids.slice(0, 3).map(s => ({ id: s.id, name: s.name, total: s.total })),
      long: longs.slice(0, 3).map(s => ({ id: s.id, name: s.name, total: s.total })),
    },
    telegram: tgResult,
    elapsedMs: Date.now() - startTime, // 不顯示在訊息裡，但保留在 API response
  });
}

