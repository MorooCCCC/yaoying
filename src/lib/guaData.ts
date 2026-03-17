// 64卦完整数据
// 每卦包含：卦名、卦序、上卦/下卦、卦辞、六爻爻辞
export interface YaoData {
  position: number; // 1-6，初爻到上爻
  type: "yang" | "yin"; // 阳爻/阴爻
  isMoving: boolean;   // 是否动爻
  text: string;        // 爻辞
}

export interface GuaData {
  id: number;
  name: string;       // 卦名
  nameEn: string;
  symbol: string;     // 卦符 ☰ ☷ etc.
  lines: [0|1, 0|1, 0|1, 0|1, 0|1, 0|1]; // 初爻到上爻，1=阳，0=阴
  upper: string;      // 上卦三画名
  lower: string;      // 下卦三画名
  description: string; // 卦辞
  yao: string[];      // 6 爻辞 [初, 二, 三, 四, 五, 上]
  nature: string;     // 卦德
}

// 八卦三画名
export const TRIGRAMS: Record<string, { name: string; symbol: string; element: string; direction: string }> = {
  "111": { name: "乾", symbol: "☰", element: "天", direction: "西北" },
  "000": { name: "坤", symbol: "☷", element: "地", direction: "西南" },
  "100": { name: "震", symbol: "☳", element: "雷", direction: "东" },
  "010": { name: "坎", symbol: "☵", element: "水", direction: "北" },
  "001": { name: "艮", symbol: "☶", element: "山", direction: "东北" },
  "011": { name: "巽", symbol: "☴", element: "风", direction: "东南" },
  "101": { name: "离", symbol: "☲", element: "火", direction: "南" },
  "110": { name: "兑", symbol: "☱", element: "泽", direction: "西" },
};

export const GUAS: GuaData[] = [
  {
    id: 1, name: "乾", nameEn: "Qian", symbol: "☰",
    lines: [1,1,1,1,1,1], upper: "乾", lower: "乾",
    description: "乾，元亨利贞。",
    nature: "刚健中正，自强不息",
    yao: [
      "初九：潜龙，勿用。",
      "九二：见龙在田，利见大人。",
      "九三：君子终日乾乾，夕惕若厉，无咎。",
      "九四：或跃在渊，无咎。",
      "九五：飞龙在天，利见大人。",
      "上九：亢龙有悔。"
    ]
  },
  {
    id: 2, name: "坤", nameEn: "Kun", symbol: "☷",
    lines: [0,0,0,0,0,0], upper: "坤", lower: "坤",
    description: "坤，元亨，利牝马之贞。君子有攸往，先迷后得主，利。西南得朋，东北丧朋，安贞吉。",
    nature: "厚德载物，顺承天意",
    yao: [
      "初六：履霜，坚冰至。",
      "六二：直方大，不习无不利。",
      "六三：含章可贞，或从王事，无成有终。",
      "六四：括囊，无咎无誉。",
      "六五：黄裳，元吉。",
      "上六：龙战于野，其血玄黄。"
    ]
  },
  {
    id: 3, name: "屯", nameEn: "Zhun", symbol: "䷂",
    lines: [0,0,1,0,1,0], upper: "坎", lower: "震",
    description: "屯，元亨利贞，勿用有攸往，利建侯。",
    nature: "初生艰难，刚柔始交",
    yao: [
      "初九：磐桓，利居贞，利建侯。",
      "六二：屯如邅如，乘马班如，匪寇婚媾，女子贞不字，十年乃字。",
      "六三：即鹿无虞，惟入于林中，君子几不如舍，往吝。",
      "六四：乘马班如，求婚媾，往吉，无不利。",
      "九五：屯其膏，小贞吉，大贞凶。",
      "上六：乘马班如，泣血涟如。"
    ]
  },
  {
    id: 4, name: "蒙", nameEn: "Meng", symbol: "䷃",
    lines: [0,1,0,0,0,1], upper: "艮", lower: "坎",
    description: "蒙，亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告，利贞。",
    nature: "启蒙教化，循序渐进",
    yao: [
      "初六：发蒙，利用刑人，用说桎梏，以往吝。",
      "九二：包蒙吉，纳妇吉，子克家。",
      "六三：勿用取女，见金夫，不有躬，无攸利。",
      "六四：困蒙，吝。",
      "六五：童蒙，吉。",
      "上九：击蒙，不利为寇，利御寇。"
    ]
  },
  {
    id: 5, name: "需", nameEn: "Xu", symbol: "䷄",
    lines: [1,1,1,0,1,0], upper: "坎", lower: "乾",
    description: "需，有孚，光亨，贞吉，利涉大川。",
    nature: "待时而动，以诚待人",
    yao: [
      "初九：需于郊，利用恒，无咎。",
      "九二：需于沙，小有言，终吉。",
      "九三：需于泥，致寇至。",
      "六四：需于血，出自穴。",
      "九五：需于酒食，贞吉。",
      "上六：入于穴，有不速之客三人来，敬之终吉。"
    ]
  },
  {
    id: 6, name: "讼", nameEn: "Song", symbol: "䷅",
    lines: [0,1,0,1,1,1], upper: "乾", lower: "坎",
    description: "讼，有孚，窒惕，中吉，终凶，利见大人，不利涉大川。",
    nature: "勿轻起争讼，和为贵",
    yao: [
      "初六：不永所事，小有言，终吉。",
      "九二：不克讼，归而逋，其邑人三百户，无眚。",
      "六三：食旧德，贞厉，终吉，或从王事，无成。",
      "九四：不克讼，复即命渝，安贞吉。",
      "九五：讼，元吉。",
      "上九：或锡之鞶带，终朝三褫之。"
    ]
  },
  {
    id: 7, name: "师", nameEn: "Shi", symbol: "䷆",
    lines: [0,1,0,0,0,0], upper: "坤", lower: "坎",
    description: "师，贞，丈人，吉，无咎。",
    nature: "兴师动众，以正服众",
    yao: [
      "初六：师出以律，否臧凶。",
      "九二：在师中，吉，无咎，王三锡命。",
      "六三：师或舆尸，凶。",
      "六四：师左次，无咎。",
      "六五：田有禽，利执言，无咎，长子帅师，弟子舆尸，贞凶。",
      "上六：大君有命，开国承家，小人勿用。"
    ]
  },
  {
    id: 8, name: "比", nameEn: "Bi", symbol: "䷇",
    lines: [0,0,0,0,1,0], upper: "坎", lower: "坤",
    description: "比，吉，原筮，元永贞，无咎，不宁方来，后夫凶。",
    nature: "亲附辅佐，以诚相交",
    yao: [
      "初六：有孚比之，无咎，有孚盈缶，终来有他吉。",
      "六二：比之自内，贞吉。",
      "六三：比之匪人。",
      "六四：外比之，贞吉。",
      "九五：显比，王用三驱，失前禽，邑人不诫，吉。",
      "上六：比之无首，凶。"
    ]
  },
  {
    id: 11, name: "泰", nameEn: "Tai", symbol: "䷊",
    lines: [1,1,1,0,0,0], upper: "坤", lower: "乾",
    description: "泰，小往大来，吉亨。",
    nature: "天地交泰，万物繁茂",
    yao: [
      "初九：拔茅茹，以其汇，征吉。",
      "九二：包荒，用冯河，不遐遗，朋亡，得尚于中行。",
      "九三：无平不陂，无往不复，艰贞无咎，勿恤其孚，于食有福。",
      "六四：翩翩不富，以其邻，不戒以孚。",
      "六五：帝乙归妹，以祉元吉。",
      "上六：城复于隍，勿用师，自邑告命，贞吝。"
    ]
  },
  {
    id: 12, name: "否", nameEn: "Pi", symbol: "䷋",
    lines: [0,0,0,1,1,1], upper: "乾", lower: "坤",
    description: "否之匪人，不利君子贞，大往小来。",
    nature: "天地不交，万物不通",
    yao: [
      "初六：拔茅茹，以其汇，贞吉亨。",
      "六二：包承，小人吉，大人否亨。",
      "六三：包羞。",
      "九四：有命无咎，畴离祉。",
      "九五：休否，大人吉，其亡其亡，系于苞桑。",
      "上九：倾否，先否后喜。"
    ]
  },
  {
    id: 13, name: "同人", nameEn: "Tong Ren", symbol: "䷌",
    lines: [1,0,1,1,1,1], upper: "乾", lower: "离",
    description: "同人于野，亨，利涉大川，利君子贞。",
    nature: "和同于众，以公心待天下",
    yao: [
      "初九：同人于门，无咎。",
      "六二：同人于宗，吝。",
      "九三：伏戎于莽，升其高陵，三岁不兴。",
      "九四：乘其墉，弗克攻，吉。",
      "九五：同人，先号咷而后笑，大师克相遇。",
      "上九：同人于郊，无悔。"
    ]
  },
  {
    id: 14, name: "大有", nameEn: "Da You", symbol: "䷍",
    lines: [1,1,1,1,0,1], upper: "离", lower: "乾",
    description: "大有，元亨。",
    nature: "盛大富有，守正而吉",
    yao: [
      "初九：无交害，匪咎，艰则无咎。",
      "九二：大车以载，有攸往，无咎。",
      "九三：公用亨于天子，小人弗克。",
      "九四：匪其彭，无咎。",
      "六五：厥孚交如威如，吉。",
      "上九：自天祐之，吉，无不利。"
    ]
  },
  {
    id: 63, name: "既济", nameEn: "Ji Ji", symbol: "䷾",
    lines: [1,0,1,0,1,0], upper: "坎", lower: "离",
    description: "既济，亨，小利贞，初吉终乱。",
    nature: "事已成就，防患于未然",
    yao: [
      "初九：曳其轮，濡其尾，无咎。",
      "六二：妇丧其茀，勿逐，七日得。",
      "九三：高宗伐鬼方，三年克之，小人勿用。",
      "六四：繻有衣袽，终日戒。",
      "九五：东邻杀牛，不如西邻之禴祭，实受其福。",
      "上六：濡其首，厉。"
    ]
  },
  {
    id: 64, name: "未济", nameEn: "Wei Ji", symbol: "䷿",
    lines: [0,1,0,1,0,1], upper: "离", lower: "坎",
    description: "未济，亨，小狐汔济，濡其尾，无攸利。",
    nature: "尚未成功，继续努力",
    yao: [
      "初六：濡其尾，吝。",
      "九二：曳其轮，贞吉。",
      "六三：未济，征凶，利涉大川。",
      "九四：贞吉，悔亡，震用伐鬼方，三年有赏于大国。",
      "六五：贞吉，无悔，君子之光，有孚，吉。",
      "上九：有孚于饮酒，无咎，濡其首，有孚失是。"
    ]
  }
];

// 通过爻线查找卦 (简化版，实际应有完整64卦)
export function findGuaByLines(lines: number[]): GuaData {
  const key = lines.join("");
  const found = GUAS.find(g => g.lines.join("") === key);
  if (found) return found;
  
  // 找不到时返回最接近的（实际应有完整64卦）
  return GUAS[0];
}

// 获取三画卦信息
export function getTrigram(lines: [0|1, 0|1, 0|1]) {
  const key = lines.join("");
  return TRIGRAMS[key] || { name: "未知", symbol: "?", element: "未知", direction: "未知" };
}
