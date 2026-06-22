// /api/cron/daily-pick — 每日 8:00 自動掃描台股 Top 10 + 推播 Telegram
// 觸發：Vercel Cron (0 8 * * 1-5) 或手動 Bearer Token
// 流程：抓 30 檔台股 Yahoo Finance → 4 維 AI 評分 → Top 10 → TG 推播

import { NextResponse } from "next/server";
import { TW_STOCKS } from "@/lib/tw-stocks";

interface StockScore {
  id: string;
  name: string;
  sector: string;
  tag: string;
  price: number;
  change: number;
  momentum: number;   // 5 日動能 (0-100)
  trend: number;      // 趨勢強度 (0-100)
  volume: number;     // 量能爆發 (0-100)
  strength: number;   // 均線多頭 (0-100)
  total: number;      // 綜合分數 (0-100)
  signal: "🔥 強力買進" | "🟢 偏多" | "⚪ 中性" | "🟡 偏空" | "🔴 賣出";
  reasons: string[];
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

function scoreStock(meta: any, closes: number[], volumes: number[]): Omit<StockScore, "id" | "name" | "sector" | "tag"> {
  const price = closes[closes.length - 1] || 0;
  const prev = closes[closes.length - 2] || price;
  const change = ((price / prev) - 1) * 100;

  // 1) 動能：5 日漲幅
  const ret5 = closes.length >= 5 ? ((price / closes[closes.length - 6]) - 1) * 100 : 0;
  const momentum = Math.max(0, Math.min(100, 50 + ret5 * 5));

  // 2) 趨勢：價格在 MA20 之上幅度
  const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length);
  const trend = Math.max(0, Math.min(100, 50 + ((price / ma20) - 1) * 200));

  // 3) 量能：今日量 vs 5 日均量
  const vol5 = volumes.slice(-6, -1).reduce((a, b) => a + b, 0) / 5;
  const todayVol = volumes[volumes.length - 1] || 0;
  const volRatio = vol5 > 0 ? todayVol / vol5 : 1;
  const volume = Math.max(0, Math.min(100, 50 + (volRatio - 1) * 50));

  // 4) 強度：多頭排列 (價格>MA5>MA20>MA60)
  const ma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, closes.length);
  const ma60 = closes.slice(-60).reduce((a, b) => a + b, 0) / Math.min(60, closes.length);
  let strength = 0;
  if (price > ma5) strength += 30;
  if (ma5 > ma20) strength += 30;
  if (ma20 > ma60) strength += 25;
  if (price > ma20) strength += 15;

  const total = Math.round(momentum * 0.25 + trend * 0.25 + volume * 0.25 + strength * 0.25);

  let signal: StockScore["signal"];
  if (total >= 80) signal = "🔥 強力買進";
  else if (total >= 65) signal = "🟢 偏多";
  else if (total >= 45) signal = "⚪ 中性";
  else if (total >= 30) signal = "🟡 偏空";
  else signal = "🔴 賣出";

  // 推薦理由
  const reasons: string[] = [];
  if (ret5 > 3) reasons.push(`5日漲 ${ret5.toFixed(1)}%`);
  if (volRatio > 1.5) reasons.push(`量能放大 ${volRatio.toFixed(1)}x`);
  if (price > ma20 && ma20 > ma60) reasons.push("多頭排列");
  if (change > 0) reasons.push(`當日 +${change.toFixed(2)}%`);

  return { price, change, momentum, trend, volume, strength, total, signal, reasons };
}

export async function GET(request: Request) {
  const startTime = Date.now();

  // 認證（Bearer Token 或 Cron Secret）
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "蝦董內部專用";
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 只掃前 30 檔（半導體 + AI 伺服器 + PCB 重點股），節省時間
  const focusStocks = TW_STOCKS.slice(0, 30);

  // 並行抓取
  const results = await Promise.all(
    focusStocks.map(async (s) => {
      const data = await fetchStock(s.id);
      if (!data) return null;
      const closes = (data.indicators?.quote?.[0]?.close || []).filter((c: number | null) => c !== null);
      const volumes = (data.indicators?.quote?.[0]?.volume || []).filter((v: number | null) => v !== null);
      if (closes.length < 60) return null;
      const score = scoreStock(data.meta, closes, volumes);
      return { id: s.id, name: s.name, sector: s.sector, tag: s.tag, ...score };
    })
  );

  // 過濾 null + 排序取 Top 10
  const validResults = results.filter((r): r is StockScore => r !== null);
  const top10 = validResults.sort((a, b) => b.total - a.total).slice(0, 10);

  // 組 Telegram 訊息（Markdown 格式）
  const today = new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", weekday: "short" });
  const lines = [
    `🚀 *每日 AI 飆股雷達* — ${today}`,
    `掃描 ${focusStocks.length} 檔重點股｜AI 評分 0-100`,
    ``,
  ];

  top10.forEach((s, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
    const changeIcon = s.change >= 0 ? "📈" : "📉";
    lines.push(
      `${medal} *${s.name}* (${s.id}) ${s.signal}`,
      `   💰 ${s.price} ${changeIcon} ${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}% ｜ AI 分數 *${s.total}*`,
      `   📊 動能 ${s.momentum} 趨勢 ${s.trend} 量能 ${s.volume} 強度 ${s.strength}`,
      `   🏷️ ${s.sector}${s.reasons.length > 0 ? ` ｜ ${s.reasons.join("、")}` : ""}`,
      ``
    );
  });

  const strongBuy = top10.filter(s => s.total >= 80).length;
  const bullish = top10.filter(s => s.total >= 65).length;
  lines.push(
    `━━━━━━━━━━━━`,
    `📈 *今日訊號*：🔥 ${strongBuy} 強力買進 ｜ 🟢 ${bullish} 偏多`,
    `🔗 看完整分析：https://ai-stock-radar.vercel.app`,
    `⏰ 執行時間 ${Date.now() - startTime}ms`
  );

  const message = lines.join("\n");

  // 推 Telegram
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ success: false, error: "Telegram token/chat_id not set" }, { status: 500 });
  }

  const tgResp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });

  const tgData = await tgResp.json();

  return NextResponse.json({
    success: tgData.ok,
    scanned: focusStocks.length,
    top10: top10.map(s => ({ id: s.id, name: s.name, total: s.total, signal: s.signal, price: s.price })),
    telegram: tgData,
    elapsedMs: Date.now() - startTime,
  });
}
