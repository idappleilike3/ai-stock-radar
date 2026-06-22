// 台股 80 檔股票池（用於每日 AI 評分掃描）
// 來源：公開市場資訊（2026-06 基準）
// 注：AI 評分僅供研究示範，不構成投資建議

export interface TwStock {
  id: string;
  name: string;
  en: string;
  sector: string;
  tag: 'semi' | 'ai' | 'fin' | 'evt' | 'bio';
  base: number;
}

export const TW_STOCKS: TwStock[] = [
  // ============ 半導體 / IC 設計(20) ============
  { id: '2330', name: '台積電',     en: 'TSMC',          sector: '半導體', tag: 'semi', base: 968 },
  { id: '2454', name: '聯發科',     en: 'MediaTek',      sector: 'IC設計', tag: 'semi', base: 1480 },
  { id: '2303', name: '聯電',       en: 'UMC',           sector: '半導體', tag: 'semi', base: 48.5 },
  { id: '2379', name: '瑞昱',       en: 'Realtek',       sector: 'IC設計', tag: 'semi', base: 538 },
  { id: '3034', name: '聯詠',       en: 'Novatek',       sector: 'IC設計', tag: 'semi', base: 612 },
  { id: '3443', name: '創意',       en: 'GlobalUnichip', sector: 'IC設計', tag: 'ai',   base: 1820 },
  { id: '6669', name: '緯穎',       en: 'Wiwynn',        sector: '伺服器', tag: 'ai',   base: 2680 },
  { id: '3529', name: '力旺',       en: 'eMemory',       sector: 'IP矽智財', tag: 'ai', base: 2150 },
  { id: '5347', name: '世界先進',   en: 'VIS',           sector: '半導體', tag: 'semi', base: 142 },
  { id: '3711', name: '日月光投控', en: 'ASE Tech',      sector: '封測',   tag: 'semi', base: 178 },
  { id: '2408', name: '南亞科',     en: 'Nanya',         sector: '記憶體', tag: 'semi', base: 78.4 },
  { id: '3527', name: '聚積',       en: 'Macroblock',    sector: 'IC設計', tag: 'ai',   base: 156 },
  { id: '8299', name: '群聯',       en: 'Phison',        sector: 'IC設計', tag: 'ai',   base: 612 },
  { id: '4966', name: '譜瑞-KY',    en: 'Parade',        sector: 'IC設計', tag: 'ai',   base: 718 },
  { id: '5274', name: '信驊',       en: 'Aspeed',        sector: 'IC設計', tag: 'ai',   base: 4520 },
  { id: '6415', name: '矽力-KY',    en: 'Silergy',       sector: 'IC設計', tag: 'semi', base: 712 },
  { id: '6531', name: '愛普',       en: 'Ap Memory',     sector: '記憶體', tag: 'ai',   base: 218 },
  { id: '8081', name: '致新',       en: 'Global Mixed',  sector: 'IC設計', tag: 'semi', base: 168 },
  { id: '3035', name: '智原',       en: 'Faraday',       sector: 'IP矽智財', tag: 'ai', base: 268 },
  { id: '6643', name: 'M31',        en: 'M31',           sector: 'IP矽智財', tag: 'ai', base: 988 },

  // ============ AI / 伺服器 / 散熱(15) ============
  { id: '2382', name: '廣達',       en: 'Quanta',        sector: '伺服器', tag: 'ai',   base: 278 },
  { id: '2356', name: '英業達',     en: 'Inventec',      sector: '伺服器', tag: 'ai',   base: 52.8 },
  { id: '3231', name: '緯創',       en: 'Wistron',       sector: '伺服器', tag: 'ai',   base: 118 },
  { id: '2376', name: '技嘉',       en: 'GIGABYTE',      sector: '伺服器', tag: 'ai',   base: 268 },
  { id: '2377', name: '微星',       en: 'MSI',           sector: '伺服器', tag: 'ai',   base: 188 },
  { id: '3017', name: '奇鋐',       en: 'AVC',           sector: '散熱',   tag: 'ai',   base: 458 },
  { id: '3324', name: '雙鴻',       en: 'Auras',         sector: '散熱',   tag: 'ai',   base: 612 },
  { id: '3653', name: '健策',       en: 'Jentech',       sector: '散熱',   tag: 'ai',   base: 868 },
  { id: '2357', name: '華碩',       en: 'ASUS',          sector: '電腦',   tag: 'ai',   base: 558 },
  { id: '2353', name: '宏碁',       en: 'Acer',          sector: '電腦',   tag: 'ai',   base: 38.6 },
  { id: '2317', name: '鴻海',       en: 'Hon Hai',       sector: 'EMS',    tag: 'ai',   base: 218 },
  { id: '2324', name: '仁寶',       en: 'Compal',        sector: '電腦',   tag: 'ai',   base: 36.4 },
  { id: '2352', name: '佳世達',     en: 'Qisda',         sector: '電腦',   tag: 'ai',   base: 38.2 },
  { id: '2476', name: '鉅祥',       en: 'Juxiang',       sector: '電子',   tag: 'ai',   base: 78.6 },
  { id: '8210', name: '勤誠',       en: 'Chenbro',       sector: '伺服器機殼', tag: 'ai', base: 312 },

  // ============ 電子零組 / PCB(10) ============
  { id: '3706', name: '欣興',       en: 'Unimicron',     sector: 'PCB',    tag: 'ai',   base: 178 },
  { id: '2367', name: '燿華',       en: 'Elite Material',sector: 'PCB',    tag: 'ai',   base: 38.4 },
  { id: '3044', name: '健鼎',       en: 'Tripod',        sector: 'PCB',    tag: 'ai',   base: 142 },
  { id: '3189', name: '景碩',       en: 'Kinsus',        sector: 'PCB',    tag: 'ai',   base: 138 },
  { id: '4958', name: '臻鼎-KY',    en: 'Zhen Ding',     sector: 'PCB',    tag: 'ai',   base: 158 },
  { id: '5469', name: '瀚宇博',     en: 'Hon Hua',       sector: 'PCB',    tag: 'ai',   base: 78.4 },
  { id: '6153', name: '嘉聯益',     en: 'Career Tech',   sector: 'PCB',    tag: 'ai',   base: 32.6 },
  { id: '6213', name: '聯茂',       en: 'ITEQ',          sector: 'PCB',    tag: 'ai',   base: 168 },
  { id: '6271', name: '同欣電',     en: 'Tong Hsing',    sector: '封測',   tag: 'semi', base: 138 },
  { id: '8046', name: '南亞科',     en: 'Nanya Tech',    sector: '記憶體', tag: 'semi', base: 68.2 },

  // ============ 金融(12) ============
  { id: '2881', name: '富邦金',     en: 'Fubon',         sector: '金控',   tag: 'fin',  base: 92.4 },
  { id: '2882', name: '國泰金',     en: 'Cathay',        sector: '金控',   tag: 'fin',  base: 71.2 },
  { id: '2884', name: '玉山金',     en: 'E.Sun',         sector: '金控',   tag: 'fin',  base: 32.8 },
  { id: '2885', name: '元大金',     en: 'Yuanta',        sector: '金控',   tag: 'fin',  base: 38.4 },
  { id: '2886', name: '兆豐金',     en: 'Mega',          sector: '金控',   tag: 'fin',  base: 45.6 },
  { id: '2887', name: '台新金',     en: 'Taishin',       sector: '金控',   tag: 'fin',  base: 19.8 },
  { id: '2891', name: '中信金',     en: 'CTBC',          sector: '金控',   tag: 'fin',  base: 42.6 },
  { id: '2892', name: '第一金',     en: 'First Holding', sector: '金控',   tag: 'fin',  base: 31.4 },
  { id: '5880', name: '合庫金',     en: 'TCB',           sector: '金控',   tag: 'fin',  base: 28.6 },
  { id: '2823', name: '中壽',       en: 'Chung Life',    sector: '保險',   tag: 'fin',  base: 38.2 },
  { id: '2880', name: '華南金',     en: 'Hua Nan',       sector: '金控',   tag: 'fin',  base: 28.4 },
  { id: '2883', name: '開發金',     en: 'KGI',           sector: '金控',   tag: 'fin',  base: 17.8 },

  // ============ 塑化 / 傳產(8) ============
  { id: '1301', name: '台塑',       en: 'Formosa',       sector: '塑膠',   tag: 'fin',  base: 51.8 },
  { id: '1303', name: '南亞',       en: 'Nan Ya',        sector: '塑膠',   tag: 'fin',  base: 48.2 },
  { id: '1326', name: '台化',       en: 'Formosa Chem',  sector: '塑膠',   tag: 'fin',  base: 42.6 },
  { id: '6505', name: '台塑化',     en: 'FPCC',          sector: '石化',   tag: 'fin',  base: 78.4 },
  { id: '1717', name: '長興',       en: 'Eternal',       sector: '化工',   tag: 'fin',  base: 38.4 },
  { id: '1101', name: '台泥',       en: 'TCC',           sector: '水泥',   tag: 'fin',  base: 32.6 },
  { id: '1102', name: '亞泥',       en: 'Asia Cement',   sector: '水泥',   tag: 'fin',  base: 38.8 },
  { id: '1216', name: '統一',       en: 'Uni-President', sector: '食品',   tag: 'fin',  base: 88.4 },

  // ============ 車用 / 航運(8) ============
  { id: '2207', name: '和泰車',     en: 'Hotai',         sector: '車用',   tag: 'evt',  base: 528 },
  { id: '2227', name: '裕日車',     en: 'Yulon Nissan',  sector: '車用',   tag: 'evt',  base: 218 },
  { id: '1513', name: '中興電',     en: 'Chung Hsin',    sector: '重電',   tag: 'evt',  base: 168 },
  { id: '1519', name: '華城',       en: 'Fortune',       sector: '重電',   tag: 'evt',  base: 612 },
  { id: '2603', name: '長榮',       en: 'Evergreen',     sector: '航運',   tag: 'fin',  base: 178 },
  { id: '2609', name: '陽明',       en: 'Yang Ming',     sector: '航運',   tag: 'fin',  base: 78.4 },
  { id: '2615', name: '萬海',       en: 'Wan Hai',       sector: '航運',   tag: 'fin',  base: 88.6 },
  { id: '2618', name: '長榮航',     en: 'EVA Air',       sector: '航空',   tag: 'fin',  base: 38.4 },

  // ============ 生技 / 醫療(7) ============
  { id: '4128', name: '中天',       en: 'Microbio',      sector: '生技',   tag: 'bio',  base: 32.6 },
  { id: '6472', name: '保瑞',       en: 'Bora',          sector: '學名藥', tag: 'bio',  base: 718 },
  { id: '1762', name: '中化生',     en: 'CCSB',          sector: '生技',   tag: 'bio',  base: 42.6 },
  { id: '1789', name: '神隆',       en: 'Sci Pharm',     sector: '生技',   tag: 'bio',  base: 28.4 },
  { id: '4123', name: '晟德',       en: 'Centerlab',     sector: '生技',   tag: 'bio',  base: 48.2 },
  { id: '4126', name: '太醫',       en: 'Pacific Hosp',  sector: '醫材',   tag: 'bio',  base: 88.6 },
  { id: '4147', name: '中裕',       en: 'TaiMed',        sector: '生技',   tag: 'bio',  base: 88.4 }
];
