import Link from "next/link";

const MODULES = [
  { href: "/tw", icon: "🇹🇼", title: "台股飆股雷達", desc: "80 檔台股掃描，5 維評分", color: "from-red-500 to-orange-500" },
  { href: "/us", icon: "🇺🇸", title: "美股飆股雷達", desc: "27 檔美股 + ETF", color: "from-blue-500 to-cyan-500" },
  { href: "/short-term", icon: "⚡", title: "短線狙擊手", desc: "1-10 天短打標的", color: "from-yellow-500 to-amber-500" },
  { href: "/swing", icon: "📈", title: "波段研究所", desc: "1-3 個月波段", color: "from-purple-500 to-pink-500" },
  { href: "/double", icon: "🚀", title: "翻倍股雷達", desc: "1 年期 AI/機器人/軍工/低軌衛星", color: "from-green-500 to-emerald-500" },
  { href: "/vip", icon: "👑", title: "VIP 自選股", desc: "持倉追蹤 + 即時通知", color: "from-pink-500 to-rose-500" },
];

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <header className="mb-12 text-center">
        <h1 className="text-6xl font-bold gradient-text mb-3">AI 飆股研究中心</h1>
        <p className="text-gray-400 text-lg">短線狙擊 · 波段研究 · 翻倍股雷達 · VIP 自選股</p>
        <div className="mt-4 inline-flex gap-2 text-sm">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">Telegram 推播 ✓</span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">LINE 推播 ✓</span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">Vercel 部署 ✓</span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {MODULES.map((m) => (
          <Link key={m.href} href={m.href} className="card block">
            <div className={`text-5xl mb-4 bg-gradient-to-r ${m.color} inline-block p-3 rounded-xl`}>
              {m.icon}
            </div>
            <h2 className="text-2xl font-bold mb-2">{m.title}</h2>
            <p className="text-gray-400">{m.desc}</p>
          </Link>
        ))}
      </section>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>蝦董 AI 營運長 · 2026-06-21 v1.0</p>
        <p className="mt-2">每 5 分鐘掃描 · 每日 07:00 / 08:00 / 20:00 自動推播</p>
      </footer>
    </main>
  );
}