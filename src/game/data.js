const NOTE_FREQUENCIES = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88
};

const NOTE_META = {
  C: { solfege: "Do", memory: "稳稳落地，像回到家。" },
  D: { solfege: "Re", memory: "向前一步，声音开始出发。" },
  E: { solfege: "Mi", memory: "更明亮，像抬头见到光。" },
  F: { solfege: "Fa", memory: "稍微悬着，像故事还没讲完。" },
  G: { solfege: "So", memory: "开阔有力，像站上小山坡。" },
  A: { solfege: "La", memory: "更高更远，像风把声音托起来。" },
  B: { solfege: "Ti", memory: "很想继续向上，带着一点期待。" }
};

const NOTE_CATS = [
  {
    id: "cloud",
    name: "云朵",
    token: "C",
    body: 0xf7fbff,
    accent: 0x37aef0,
    dark: 0x173f59,
    pattern: "ears"
  },
  {
    id: "sprout",
    name: "芽芽",
    token: "D",
    body: 0xaee58c,
    accent: 0x31a95b,
    dark: 0x17452e,
    pattern: "forehead"
  },
  {
    id: "glint",
    name: "闪闪",
    token: "E",
    body: 0xffcf66,
    accent: 0xf47e35,
    dark: 0x5d3519,
    pattern: "cheeks"
  },
  {
    id: "sea-salt",
    name: "海盐",
    token: "G",
    body: 0x82d4ff,
    accent: 0x267fc8,
    dark: 0x173f5d,
    pattern: "tail"
  },
  {
    id: "berry",
    name: "莓莓",
    token: "A",
    body: 0xff9fc1,
    accent: 0xd94a82,
    dark: 0x5a213c,
    pattern: "forehead"
  }
];

const CHORD_CATS = [
  {
    id: "sunbeam",
    name: "晴光",
    token: "major",
    body: 0xffc94f,
    accent: 0xf07c2f,
    dark: 0x5a3417,
    pattern: "cheeks"
  },
  {
    id: "moonshade",
    name: "月影",
    token: "minor",
    body: 0x91b8ff,
    accent: 0x5962d2,
    dark: 0x252d58,
    pattern: "ears"
  },
  {
    id: "mist",
    name: "迷雾",
    token: "diminished",
    body: 0xc5a8e6,
    accent: 0x7f58ad,
    dark: 0x40284f,
    pattern: "tail"
  }
];

const NOTE_TOKENS = Object.fromEntries(
  Object.entries(NOTE_FREQUENCIES).map(([note, frequency]) => [
    note,
    {
      id: note,
      kind: "note",
      label: note,
      solfege: NOTE_META[note].solfege,
      frequency,
      frequencies: [frequency],
      memory: NOTE_META[note].memory
    }
  ])
);

const CHORD_TOKENS = {
  major: {
    id: "major",
    kind: "chord",
    label: "大三和弦",
    solfege: "明亮",
    frequencies: [261.63, 329.63, 392.0],
    memory: "明亮、稳定，像阳光照进房间。"
  },
  minor: {
    id: "minor",
    kind: "chord",
    label: "小三和弦",
    solfege: "柔和",
    frequencies: [261.63, 311.13, 392.0],
    memory: "柔和、内收，像安静的月光。"
  },
  diminished: {
    id: "diminished",
    kind: "chord",
    label: "减三和弦",
    solfege: "紧张",
    frequencies: [261.63, 311.13, 369.99],
    memory: "紧张、悬着，像转角后藏着秘密。"
  }
};

export const TOKENS = {
  ...NOTE_TOKENS,
  ...CHORD_TOKENS
};

export const STAGES = [
  {
    id: "note3",
    name: "初声草坡",
    shortName: "三音寻声",
    description: "先认识 Do、Re、Mi，完成最清楚的一次听声与投喂。",
    tokenIds: ["C", "D", "E"],
    catIds: ["cloud", "sprout", "glint"],
    rounds: 6,
    unlockAt: 0,
    accent: "#ffd44e"
  },
  {
    id: "note5",
    name: "旋律风原",
    shortName: "五音巡游",
    description: "岛上的猫更多了，先判断高低区间，再锁定具体声音。",
    tokenIds: ["C", "D", "E", "G", "A"],
    catIds: ["cloud", "sprout", "glint", "sea-salt", "berry"],
    rounds: 8,
    unlockAt: 6,
    accent: "#55b8ee"
  },
  {
    id: "chord3",
    name: "和声月湾",
    shortName: "和弦颜色",
    description: "把明亮、柔和、紧张听成三种可以被抓住的声音颜色。",
    tokenIds: ["major", "minor", "diminished"],
    catIds: ["sunbeam", "moonshade", "mist"],
    rounds: 8,
    unlockAt: 14,
    accent: "#a57bd2"
  }
];

export const CAT_ROSTER = [...NOTE_CATS, ...CHORD_CATS];

export function getStage(stageId) {
  return STAGES.find((stage) => stage.id === stageId) || STAGES[0];
}

export function getCat(catId) {
  return CAT_ROSTER.find((cat) => cat.id === catId) || NOTE_CATS[0];
}

export function getToken(tokenId) {
  return TOKENS[tokenId] || TOKENS.C;
}

export function getCatForToken(stage, tokenId) {
  const catId = stage.catIds.find((id) => getCat(id).token === tokenId);
  return getCat(catId || stage.catIds[0]);
}

export function getStageCats(stageId) {
  const stage = getStage(stageId);
  return stage.catIds.map(getCat);
}

export function getTotalMastery(mastery = {}) {
  return Object.values(mastery).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}
