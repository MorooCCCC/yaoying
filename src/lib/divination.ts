// 六爻排盘引擎
// 基于干支历法计算旬空、月破等

export interface GanZhiInfo {
  year: string;
  month: string;
  day: string;
  hour: string;
  yearGan: string;
  yearZhi: string;
  monthGan: string;
  monthZhi: string;
  dayGan: string;
  dayZhi: string;
  hourGan: string;
  hourZhi: string;
  xunkong: string[]; // 旬空
  yuepao: string;    // 月破
}

// 天干
export const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
// 地支
export const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
// 五行
export const WUXING_GAN: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水"
};
export const WUXING_ZHI: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水"
};

// 计算干支纪年（简化版）
export function getGanZhi(date: Date): GanZhiInfo {
  // 使用简化算法，实际项目中应使用 lunar-javascript
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  // 年干支（以1984甲子年为基准）
  const yearIdx = (year - 1984 + 60) % 60;
  const yearGanIdx = yearIdx % 10;
  const yearZhiIdx = yearIdx % 12;
  const yearGan = TIANGAN[yearGanIdx];
  const yearZhi = DIZHI[yearZhiIdx];

  // 月干支（简化）
  const monthBase = (year - 1984) * 12 + (month - 1);
  const monthGanIdx = ((monthBase % 10) + 10) % 10;
  const monthZhiIdx = ((monthBase % 12) + 12) % 12;
  const monthGan = TIANGAN[monthGanIdx];
  const monthZhi = DIZHI[monthZhiIdx];

  // 日干支（简化，以2000-01-01为甲子日）
  const base = new Date(2000, 0, 1);
  const diff = Math.floor((date.getTime() - base.getTime()) / 86400000);
  const dayIdx = ((diff % 60) + 60) % 60;
  const dayGanIdx = dayIdx % 10;
  const dayZhiIdx = dayIdx % 12;
  const dayGan = TIANGAN[dayGanIdx];
  const dayZhi = DIZHI[dayZhiIdx];

  // 时干支
  const hourZhiIdx = Math.floor(hour / 2) % 12;
  const hourBase = dayGanIdx * 2;
  const hourGanIdx = (hourBase + hourZhiIdx) % 10;
  const hourGan = TIANGAN[hourGanIdx];
  const hourZhi = DIZHI[hourZhiIdx];

  // 旬空：每旬10天，最后2地支为空
  const xunkongStart = dayZhiIdx - dayGanIdx;
  const xunkongIdx1 = ((xunkongStart + 10) % 12);
  const xunkongIdx2 = ((xunkongStart + 11) % 12);
  const xunkong = [DIZHI[xunkongIdx1], DIZHI[xunkongIdx2]];

  // 月破：与月建相冲的地支
  const yuepaoIdx = (monthZhiIdx + 6) % 12;
  const yuepao = DIZHI[yuepaoIdx];

  return {
    year: `${yearGan}${yearZhi}`,
    month: `${monthGan}${monthZhi}`,
    day: `${dayGan}${dayZhi}`,
    hour: `${hourGan}${hourZhi}`,
    yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi,
    xunkong, yuepao
  };
}

// 爻的类型
export type YaoType = 0 | 1; // 0=阴，1=阳
export type CoinResult = 0 | 1; // 正面=1，反面=0

// 三枚铜钱生成一爻
// 规则：3正=老阳(动阳)，2正1反=少阴，1正2反=少阳，0正=老阴(动阴)
export interface YaoResult {
  coins: [CoinResult, CoinResult, CoinResult];
  count: number;       // 正面数量 0-3
  type: YaoType;       // 本卦爻型
  isMoving: boolean;   // 是否动爻
  changeType: YaoType; // 变卦爻型
  label: string;       // 爻名：初九/六二/etc
  name: string;        // 老阳/少阴/少阳/老阴
}

const YAO_NAMES = ["初", "二", "三", "四", "五", "上"];

export function generateYao(position: number): YaoResult {
  // 三枚铜钱随机翻
  const coins: [CoinResult, CoinResult, CoinResult] = [
    Math.random() > 0.5 ? 1 : 0,
    Math.random() > 0.5 ? 1 : 0,
    Math.random() > 0.5 ? 1 : 0,
  ];
  const count = coins.reduce((a, b) => a + b, 0);
  
  let type: YaoType;
  let isMoving: boolean;
  let changeType: YaoType;
  let name: string;
  
  if (count === 3) {
    // 老阳 → 变阴
    type = 1; isMoving = true; changeType = 0; name = "老阳";
  } else if (count === 2) {
    // 少阴 → 不变
    type = 0; isMoving = false; changeType = 0; name = "少阴";
  } else if (count === 1) {
    // 少阳 → 不变
    type = 1; isMoving = false; changeType = 1; name = "少阳";
  } else {
    // 老阴 → 变阳
    type = 0; isMoving = true; changeType = 1; name = "老阴";
  }
  
  const posName = YAO_NAMES[position - 1];
  const typeName = type === 1 ? "九" : "六";
  const label = `${posName}${typeName}`;

  return { coins, count, type, isMoving, changeType, label, name };
}

// 六爻排盘完整结果
export interface DivinationResult {
  ganZhi: GanZhiInfo;
  yaos: YaoResult[];       // 6爻，index 0 = 初爻
  originalLines: YaoType[]; // 本卦爻线
  changedLines: YaoType[];  // 变卦爻线
  movingPositions: number[]; // 动爻位置 (1-based)
  timestamp: Date;
}

export function buildDivination(yaos: YaoResult[], date: Date): DivinationResult {
  const ganZhi = getGanZhi(date);
  const originalLines = yaos.map(y => y.type) as YaoType[];
  const changedLines = yaos.map(y => y.changeType) as YaoType[];
  const movingPositions = yaos
    .map((y, i) => y.isMoving ? i + 1 : 0)
    .filter(p => p > 0);

  return {
    ganZhi,
    yaos,
    originalLines,
    changedLines,
    movingPositions,
    timestamp: date,
  };
}

// 卦象强弱评估
export function assessGuaStrength(lines: YaoType[], ganZhi: GanZhiInfo): string {
  const yangCount = lines.filter(l => l === 1).length;
  const yinCount = 6 - yangCount;
  
  if (yangCount > yinCount) {
    return "阳气旺盛，主事进取，宜积极行动";
  } else if (yangCount < yinCount) {
    return "阴气偏重，主事收敛，宜韬光养晦";
  } else {
    return "阴阳平衡，中道而行，随机应变";
  }
}
