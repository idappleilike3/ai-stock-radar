import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * USDT 收款 API (防盜版)
 *
 * 防盜重點:
 * 1. 錢包地址從環境變數讀取 (不寫死)
 * 2. 每筆訂單有 unique ID + HMAC 簽名
 * 3. 後端驗證金額 (不信前端)
 * 4. 訂單狀態存伺服器 (不存前端)
 */

const PLANS = {
  "vip-monthly": { name: "VIP 月費", price: 690, days: 30 },
  "vip-quarterly": { name: "VIP 季費", price: 1880, days: 90 },
  "vip-yearly": { name: "VIP 年費", price: 6800, days: 365 },
};

// HMAC 簽名密鑰（環境變數，不要 hardcode）
const SECRET = process.env.PAYMENT_SECRET || "CHANGE_ME_IN_PRODUCTION";

interface Order {
  id: string;
  user_id: string;
  plan: string;
  amount_twd: number;
  amount_usdt: number;
  wallet_address: string;
  status: "pending" | "paid" | "expired" | "refunded";
  created_at: string;
  expires_at: string;
  hmac: string;
}

// 簡易訂單儲存（正式環境用資料庫）
const orders: Map<string, Order> = new Map();

function generateOrderId(): string {
  return "ORD-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function generateHMAC(order: Order): string {
  const payload = `${order.id}|${order.user_id}|${order.plan}|${order.amount_twd}|${order.created_at}`;
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function verifyHMAC(order: Order): boolean {
  const expected = generateHMAC(order);
  return crypto.timingSafeEqual(Buffer.from(order.hmac), Buffer.from(expected));
}

// USDT/TWD 匯率（正式環境用即時 API）
const USDT_TWD_RATE = 32.5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, user_id } = body;

    // 1. 驗證方案
    if (!PLANS[plan]) {
      return NextResponse.json({ success: false, error: "無效方案" }, { status: 400 });
    }

    // 2. 計算金額（後端計算，不信前端傳來的）
    const planInfo = PLANS[plan];
    const amount_twd = planInfo.price;
    const amount_usdt = parseFloat((amount_twd / USDT_TWD_RATE).toFixed(2));

    // 3. 錢包地址從環境變數讀取（防盜重點 1）
    const wallet_address = process.env.USDT_WALLET_ADDRESS || "TRC20_DEFAULT_WALLET";

    // 4. 建立訂單
    const now = new Date();
    const order: Order = {
      id: generateOrderId(),
      user_id: user_id || "guest",
      plan,
      amount_twd,
      amount_usdt,
      wallet_address,
      status: "pending",
      created_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 分鐘過期
      hmac: "",
    };
    order.hmac = generateHMAC(order);

    // 5. 儲存訂單（簡化用記憶體，正式用資料庫）
    orders.set(order.id, order);

    // 6. 產生付款資訊（不暴露 SECRET）
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        plan: order.plan,
        plan_name: planInfo.name,
        amount_twd: order.amount_twd,
        amount_usdt: order.amount_usdt,
        wallet_address: order.wallet_address,
        network: "TRC20",  // USDT-TRC20 手續費最低
        expires_at: order.expires_at,
        hmac: order.hmac,
      },
      instructions: [
        `1. 開啟你的 USDT 钱包`,
        `2. 發送 ${order.amount_usdt} USDT 到 ${order.wallet_address}`,
        `3. 網路選擇: TRC20 (手續費最低)`,
        `4. 備註填寫: ${order.id}`,
        `5. 30 分鐘內完成付款，訂單自動失效`,
      ],
      warning: "⚠️ 請務必使用 TRC20 網路，使用其他網路將遺失資金！",
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// 查詢訂單狀態
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const order_id = searchParams.get("order_id");

  if (!order_id) {
    return NextResponse.json({ success: false, error: "缺少 order_id" }, { status: 400 });
  }

  const order = orders.get(order_id);
  if (!order) {
    return NextResponse.json({ success: false, error: "訂單不存在" }, { status: 404 });
  }

  // 驗證 HMAC（防偽）
  if (!verifyHMAC(order)) {
    return NextResponse.json({ success: false, error: "訂單驗證失敗" }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    order: {
      id: order.id,
      plan: order.plan,
      amount_twd: order.amount_twd,
      amount_usdt: order.amount_usdt,
      status: order.status,
      expires_at: order.expires_at,
    },
  });
}