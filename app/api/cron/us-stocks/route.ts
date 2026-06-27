// /api/cron/us-stocks — 美股盤後飆股雷達（07:00 台灣時間 = 美股盤後 16:00 EST）
// 掃描 27 檔美股重點股
// v1.0 — 2026-06-23

import { NextResponse } from "next/server";
import { US_STOCKS } from "@/lib/us-stocks";

async function fetchStock(ticker: string) {
  try {
    const resp = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=3mo&interval=1d`,
      { next: { revalidate: 600 } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.chart?.result?.[0] || null;
  } catch {
    return null;
  }
}

function scoreUs(closes: number[], volumes: number[]) {
  const price = closes[closes.length - 1] || 0;
  const prev = closes[closes.length - 2] || price;
  const change = ((price / prev) - 1) * 100;
  const ma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const ma60 = closes.slice(-60).reduce((a, b) => a + b, 0) / Math.min(60, closes.length);
  const high60 = Math.max(...closes.slice(-60));
  const low60 = Math.min(...closes.slice(-60));
  const ret5 = closes.length >= 5 ? ((price / closes[closes.length - 6]) - 1) * 100 : 0;

  const trend = Math.max(0, Math.min(100, 50 + ((price / ma20) - 1) * 200));
  const momentum = Math.max(0, Math.min(100, 50 + ret5 * 5));
  let strength = 0;
  if (price > ma5) strength += 30;
  if (ma5 > ma20) strength += 35;
  if (ma20 > ma60) strength += 35;
  const vol5 = volumes.slice(-6, -1).reduce((a, b) => a + b, 0) / 5;
  const todayVol = volumes[volumes.length - 1] || 0;
  const volume_ratio = vol5 > 0 ? todayVol / vol5 : 1;
  const volume = Math.max(0, Math.min(100, 50 + (volume_ratio - 1) * 50));
  const total = Math.round(trend * 0.35 + strength * 0.30 + volume * 0.20 + momentum * 0.15);

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

  const results = await Promise.all(
    US_STOCKS.map(async (s) => {
      const data = await fetchStock(s.id);
      if (!data) return null;
      const closes = (data.indicators?.quote?.[0]?.close || []).filter((c: number | null) => c !== null);
      const volumes = (data.indicators?.quote?.[0]?.volume || []).filter((v: number | null) => v !== null);
      if (closes.length < 60) return null;
      return { id: s.id, name: s.name, en: s.en, sector: s.sector, tag: s.tag, ...scoreUs(closes, volumes) };
    })
  );

  const valid = results.filter((r): r is NonNullable<typeof r> => r !== null);

  // ⚠️ 異常股排除
  const anomalies = valid.filter(s => Math.abs(s.change) > 15);
  const normal = valid.filter(s => Math.abs(s.change) <= 15);

  const top = normal.sort((a, b) => b.total - a.total).slice(0, 10);
  const hasGradeA = top.some(s => s.total >= 80);
  const today = new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", weekday: "short" });

  const lines: string[] = [
    `🇺🇸 *美股盤後飆股雷達* — ${today}`,
    `掃描 ${US_STOCKS.length} 檔美股重點股｜AI 評分 0-100`,
    ``,
  ];

  if (!hasGradeA) {
    lines.push(`🟡 *今日美股觀望*`, `無 A 級訊號，等待下一輪放量突破。`, ``);
  } else {
    lines.push(`🌟 *美股 Top 10 觀察名單*（影響台股明日開盤）`, ``);
    top.forEach((s, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      const changeIcon = s.change >= 0 ? "🟢" : "🔴";
      const tagEmoji = s.tag === "ai" ? "🤖" : s.tag === "semi" ? "💾" : s.tag === "rocket" ? "🚀" : s.tag === "energy" ? "⚡" : "📊";
      lines.push(
        `${medal} ${tagEmoji} *${s.name}* (${s.id}) [${s.total}分]`,
        `   💰 收盤 $${s.price} ${changeIcon} ${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}%｜量比 ${s.volume_ratio}x`,
        `   🏷️ ${s.sector}｜MA20 $${s.ma20}`,
        `   🔴 停損 $${s.stop_loss}｜🎯 目標 ①$${s.target1} ②$${s.target2}`,
        ``,
      );
    });
  }

  // ⚠️ 異常資料區
  if (anomalies.length > 0) {
    lines.push(
      `⚠️ *異常資料需驗證*（${anomalies.length} 檔）`,
      `單日 > 15% 視為異常（可能為除權息調整問題），*不列入推薦*。`,
      ``,
    );
    anomalies.forEach(s => {
      const changeIcon = s.change >= 0 ? "🟢" : "🔴";
      lines.push(
        `• *${s.name}* (${s.id}) ${changeIcon} 收盤 $${s.price}｜當日 ${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}%`,
        ``,
      );
    });
  }

  lines.push(
    `━━━━━━━━━━━━`,
    `📋 *美股對台股影響*`,
    `• NVDA / TSMC / AVGO 收漲：台股 AI 半導體明日開高機率高`,
    `• 費半下跌：台股 AI 族群可能開低`,
    `• 特斯拉大漲：機器人/低軌衛星概念股連動`,
    `• 油價波動：塑化/航運族群受影響`,
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
    scanned: US_STOCKS.length,
    top10: top.map(s => ({ id: s.id, name: s.name, total: s.total, price: s.price })),
    telegram: tgData,
    elapsedMs: Date.now() - startTime,
  });
}
