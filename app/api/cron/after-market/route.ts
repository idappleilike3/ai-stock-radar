// /api/cron/after-market — 台股盤後飆股雷達（20:00）
// 收盤後掃描 + 次日作戰計畫
// v1.0 — 2026-06-23

import { NextResponse } from "next/server";
import { TW_STOCKS, EXCLUDED_STOCKS } from "@/lib/tw-stocks";

// 共用 scoring 邏輯（簡化版，避免重複程式碼）
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

function quickScore(closes: number[], volumes: number[]) {
  const price = closes[closes.length - 1] || 0;
  const prev = closes[closes.length - 2] || price;
  const change = ((price / prev) - 1) * 100;
  const ma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const ma60 = closes.slice(-60).reduce((a, b) => a + b, 0) / Math.min(60, closes.length);
  const high60 = Math.max(...closes.slice(-60));
  const low60 = Math.min(...closes.slice(-60));

  const trend = Math.max(0, Math.min(100, 50 + ((price / ma20) - 1) * 200));
  let strength = 0;
  if (price > ma5) strength += 30;
  if (ma5 > ma20) strength += 35;
  if (ma20 > ma60) strength += 35;
  const vol5 = volumes.slice(-6, -1).reduce((a, b) => a + b, 0) / 5;
  const todayVol = volumes[volumes.length - 1] || 0;
  const volume_ratio = vol5 > 0 ? todayVol / vol5 : 1;
  const volume = Math.max(0, Math.min(100, 50 + (volume_ratio - 1) * 50));

  const total = Math.round(trend * 0.4 + strength * 0.35 + volume * 0.25);

  return {
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    volume_ratio: Math.round(volume_ratio * 100) / 100,
    total,
    ma20: Math.round(ma20 * 100) / 100,
    high60: Math.round(high60 * 100) / 100,
    low60: Math.round(low60 * 100) / 100,
    stop_loss: Math.round(Math.max(low60 * 0.98, price * 0.93) * 100) / 100,
    target1: Math.round(price + (price - Math.max(low60 * 0.98, price * 0.93)) * 2),
    target2: Math.round(price + (price - Math.max(low60 * 0.98, price * 0.93)) * 3),
  };
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "蝦董內部專用";
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 過濾黑名單（2026-06-28 蝦董親定）
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
      return { id: s.id, name: s.name, sector: s.sector, tag: s.tag, ...quickScore(closes, volumes) };
    })
  );

  const valid = results.filter((r): r is NonNullable<typeof r> => r !== null);

  // ⚠️ 異常股排除（單日 > 15% 視為異常，Yahoo Finance 除權息調整問題）
  const anomalies = valid.filter(s => Math.abs(s.change) > 15);
  const normal = valid.filter(s => Math.abs(s.change) <= 15);

  const top = normal.sort((a, b) => b.total - a.total).slice(0, 10);
  const hasGradeA = top.some(s => s.total >= 80);
  const today = new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", weekday: "short" });

  const lines: string[] = [
    `🌙 *台股盤後飆股雷達* — ${today}`,
    `收盤掃描 ${focusStocks.length} 檔｜次日作戰參考`,
    ``,
  ];

  if (!hasGradeA) {
    lines.push(`🟡 *今日盤後觀望*`, `無 A 級訊號，明日等待放量突破。`, ``);
  } else {
    lines.push(`📊 *今日盤後 Top 10*（明日觀察名單）`, ``);
    top.forEach((s, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      const changeIcon = s.change >= 0 ? "🟢" : "🔴";
      lines.push(
        `${medal} *${s.name}* (${s.id}) [${s.total}分]`,
        `   💰 收盤 ${s.price} ${changeIcon} ${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}%｜量比 ${s.volume_ratio}x`,
        `   🏷️ ${s.sector}｜MA20 ${s.ma20}｜60日高低 ${s.low60}-${s.high60}`,
        `   🔴 停損 ${s.stop_loss}｜🎯 目標 ①${s.target1} ②${s.target2}`,
        ``,
      );
    });
  }

  // ⚠️ 異常資料區
  if (anomalies.length > 0) {
    lines.push(
      `⚠️ *異常資料需驗證*（${anomalies.length} 檔）`,
      `以下股票單日 > 15% 視為異常（可能為除權息調整問題），*不列入推薦*。`,
      ``,
    );
    anomalies.forEach(s => {
      const changeIcon = s.change >= 0 ? "🟢" : "🔴";
      lines.push(
        `• *${s.name}* (${s.id}) ${changeIcon} 收盤 ${s.price}｜當日 ${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}%`,
        ``,
      );
    });
  }

  lines.push(
    `━━━━━━━━━━━━`,
    `📋 *明日觀察重點*`,
    `• 開盤量能：> 昨日 1.3 倍視為強勢`,
    `• 突破盤前壓力位：進場訊號`,
    `• 跌破盤前支撐位：觀望不追`,
    `• 收盤守住 MA20：續抱｜跌破：減碼`,
    ``,
    `🔗 https://ai-stock-radar.vercel.app`,
  );

  const message = lines.join("\n");

  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = parseInt((process.env.TELEGRAM_CHAT_ID || "").replace(/[^0-9]/g, ""), 10);

  if (!token || !chatId) {
    return NextResponse.json({ success: false, error: "Telegram token/chat_id not set" }, { status: 500 });
  }

  const tgResp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, disable_web_page_preview: true }),
  });
  const tgData = await tgResp.json();

  return NextResponse.json({
    success: tgData.ok,
    scanned: focusStocks.length,
    top10: top.map(s => ({ id: s.id, name: s.name, total: s.total, price: s.price })),
    telegram: tgData,
    elapsedMs: Date.now() - startTime,
  });
}
