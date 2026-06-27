// /api/debug/env — 除錯用，看 Vercel runtime 環境變數實際值
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== "Bearer shrimp-boss-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  const chatId = process.env.TELEGRAM_CHAT_ID || "";
  const cronSecret = process.env.CRON_SECRET || "";
  return NextResponse.json({
    token_length: token.length,
    token_first5: token.substring(0, 5),
    token_last3: token.substring(token.length - 3),
    chat_id: chatId,
    chat_id_int: parseInt(chatId, 10),
    cron_secret_length: cronSecret.length,
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
  });
}
