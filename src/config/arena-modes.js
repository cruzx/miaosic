export const ARENA_MODES = [
  {
    id: "gem-jam",
    name: "宝石争霸",
    map: "和弦广场",
    icon: "💎",
    rule: "占领中央音符池，收集正确和弦宝石。",
    musicRule: "系统播放 Cmaj / Am / Fmaj / G，玩家用对应技能抢点。",
    reward: "和声奖杯"
  },
  {
    id: "note-ball",
    name: "音符足球",
    map: "低音球场",
    icon: "⚽",
    rule: "带球进门前，需要命中正确音符路径。",
    musicRule: "旋律按 C-D-E-G-A 排列，走错音符会减速。",
    reward: "节奏徽章"
  },
  {
    id: "solo-loop",
    name: "单人乱斗",
    map: "采样矿井",
    icon: "☠️",
    rule: "击败敌人并收集散落采样。",
    musicRule: "每个采样都是一个音色，组合后触发大招。",
    reward: "音色碎片"
  }
];

export const HERO_ARCHETYPES = [
  {
    id: "rock-cat",
    name: "RockCat",
    title: "摇滚猫",
    role: "爆发输出",
    weapon: "电吉他",
    hp: 6600,
    attack: "3 x 960",
    super: "音浪冲击",
    color: "#ff8b1f"
  },
  {
    id: "piano-mew",
    name: "PianoMew",
    title: "钢琴喵",
    role: "控制辅助",
    weapon: "键盘法阵",
    hp: 5700,
    attack: "2 x 820",
    super: "和声护盾",
    color: "#8fd3ff"
  },
  {
    id: "dj-panda",
    name: "DJ Panda",
    title: "节拍熊猫",
    role: "范围压制",
    weapon: "低音炮",
    hp: 6900,
    attack: "1 x 1420",
    super: "低频震荡",
    color: "#ffffff"
  },
  {
    id: "violin-girl",
    name: "ViolinGirl",
    title: "小提琴手",
    role: "远程穿透",
    weapon: "弦刃",
    hp: 5100,
    attack: "1 x 1180",
    super: "高音穿刺",
    color: "#9b35ff"
  }
];
