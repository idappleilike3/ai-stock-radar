// 美股 27 檔重點股（含 AI / 機器人 / Data Center / 半導體 / 光通訊 / 低軌衛星）
// v1.0 — 2026-06-23

export interface UsStock {
  id: string;       // Ticker
  name: string;     // 中文名
  en: string;       // 英文名
  sector: string;
  tag: 'ai' | 'semi' | 'auto' | 'energy' | 'fin' | 'comm' | 'bio' | 'rocket';
  base: number;
}

export const US_STOCKS: UsStock[] = [
  // ============ AI / Data Center（10）============
  { id: 'NVDA', name: '輝達',     en: 'NVIDIA',        sector: 'AI 晶片',     tag: 'ai',     base: 950 },
  { id: 'MSFT', name: '微軟',     en: 'Microsoft',     sector: '雲端 AI',     tag: 'ai',     base: 420 },
  { id: 'GOOGL',name: '谷歌',     en: 'Alphabet',      sector: 'AI 搜尋',     tag: 'ai',     base: 175 },
  { id: 'META', name: 'Meta',     en: 'Meta Platforms',sector: '社群 AI',     tag: 'ai',     base: 500 },
  { id: 'AMZN', name: '亞馬遜',   en: 'Amazon',        sector: '雲端 AI',     tag: 'ai',     base: 185 },
  { id: 'ORCL', name: '甲骨文',   en: 'Oracle',        sector: '資料庫',       tag: 'ai',     base: 140 },
  { id: 'CRM',  name: 'Salesforce',en: 'Salesforce',   sector: 'SaaS AI',     tag: 'ai',     base: 280 },
  { id: 'PLTR', name: 'Palantir', en: 'Palantir',      sector: 'AI 數據',     tag: 'ai',     base: 25 },
  { id: 'CRWD', name: 'CrowdStrike',en: 'CrowdStrike',  sector: '資安',         tag: 'ai',     base: 350 },
  { id: 'SNOW', name: 'Snowflake',en: 'Snowflake',     sector: 'Data Cloud',  tag: 'ai',     base: 175 },

  // ============ 半導體 / ASIC（5）============
  { id: 'AMD',  name: '超微',     en: 'AMD',           sector: 'AI 晶片',     tag: 'semi',   base: 165 },
  { id: 'AVGO', name: '博通',     en: 'Broadcom',      sector: 'ASIC 晶片',   tag: 'semi',   base: 1400 },
  { id: 'MU',   name: '美光',     en: 'Micron',        sector: '記憶體',       tag: 'semi',   base: 105 },
  { id: 'TSM',  name: '台積電 ADR',en: 'TSMC',         sector: '晶圓代工',     tag: 'semi',   base: 175 },
  { id: 'AMAT', name: '應材',     en: 'Applied Mat',   sector: '半導體設備',   tag: 'semi',   base: 220 },

  // ============ 機器人 / 自動化（3）============
  { id: 'TSLA', name: '特斯拉',   en: 'Tesla',         sector: '電動車/機器人',tag: 'auto',   base: 250 },
  { id: 'INTC', name: '英特爾',   en: 'Intel',         sector: '晶片+代工',   tag: 'semi',   base: 32 },
  { id: 'ISRG', name: '直覺手術', en: 'Intuitive Surgical',sector: '醫療機器人',tag: 'bio',  base: 460 },

  // ============ 光通訊 / 低軌衛星（4）============
  { id: 'COHR', name: 'Coherent', en: 'Coherent',      sector: '光通訊',       tag: 'comm',   base: 95 },
  { id: 'LITE', name: 'Lumentum', en: 'Lumentum',      sector: '光通訊',       tag: 'comm',   base: 75 },
  { id: 'ASTS', name: 'AST Spacemobile',en: 'AST SpaceMobile',sector:'低軌衛星',tag: 'rocket', base: 35 },
  { id: 'RKLB', name: 'Rocket Lab',en: 'Rocket Lab',    sector: '低軌衛星',     tag: 'rocket', base: 22 },

  // ============ 能源 / 軍工（3）============
  { id: 'XOM',  name: '埃克森美孚',en: 'ExxonMobil',   sector: '石油',         tag: 'energy', base: 115 },
  { id: 'LMT',  name: '洛克希德', en: 'Lockheed',      sector: '軍工',         tag: 'energy', base: 460 },
  { id: 'RTX',  name: '雷神',     en: 'RTX',           sector: '軍工',         tag: 'energy', base: 110 },

  // ============ 金融 / 其他（2）============
  { id: 'JPM',  name: '摩根大通', en: 'JPMorgan',      sector: '銀行',         tag: 'fin',    base: 200 },
  { id: 'V',    name: 'Visa',     en: 'Visa',          sector: '支付',         tag: 'fin',    base: 280 },
];
