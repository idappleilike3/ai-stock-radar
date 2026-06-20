# AI 飆股研究中心

蝦董 v1 Dashboard · 2026-06-21

## 6 個模組

- 台股飆股雷達 - 80 檔台股掃描
- 美股飆股雷達 - 27 檔美股 + ETF
- 短線狙擊手 - 1-10 天短打
- 波段研究所 - 1-3 個月波段
- 翻倍股雷達 - 1 年期（AI/機器人/軍工/低軌衛星）
- VIP 自選股 - 持倉追蹤 + 即時通知

## 通知

- Telegram Bot（已綁定）
- LINE Messaging API（需 Channel Access Token）

## 部署到 Vercel

1. Push 到 GitHub
2. vercel.com 連接 GitHub repo
3. 設定環境變數：
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_CHAT_ID
   - LINE_CHANNEL_ACCESS_TOKEN（選填）
   - LINE_USER_ID（選填）
4. 部署完成 → 取得 https://xxx.vercel.app