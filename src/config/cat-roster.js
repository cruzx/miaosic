export const CAT_ROSTER = [
  {
    id: "crown-c",
    note: "C",
    name: "Crown C",
    title: "国王猫",
    rarity: "Starter",
    emoji: "👑",
    color: "#ffd86f",
    personality: "稳、可靠、像旋律里的家。",
    skill: "命中 C 音时额外显示音高锚点。",
    learningTip: "先记住 C 的稳定感，再用它比较其他音。"
  },
  {
    id: "scout-d",
    note: "D",
    name: "Scout D",
    title: "探险猫",
    rarity: "Common",
    emoji: "🧭",
    color: "#7fe19e",
    personality: "向前、轻快、准备出发。",
    skill: "连续命中时缩短下一轮听音冷却。",
    learningTip: "D 往往像从 C 迈出去的一步。"
  },
  {
    id: "mage-e",
    note: "E",
    name: "Mage E",
    title: "魔法猫",
    rarity: "Rare",
    emoji: "✨",
    color: "#8fd3ff",
    personality: "明亮、跳跃、带一点魔法感。",
    skill: "Perfect 时触发星光轨迹。",
    learningTip: "E 比 C、D 更亮，适合作为高低判断锚点。"
  },
  {
    id: "groove-g",
    note: "G",
    name: "Groove G",
    title: "爵士猫",
    rarity: "Epic",
    emoji: "🎷",
    color: "#a9b6ff",
    personality: "松弛、弹性、像副歌要起飞。",
    skill: "在五声音阶关卡中提升连击奖励。",
    learningTip: "G 经常让旋律打开空间，听起来更高、更远。"
  },
  {
    id: "star-a",
    note: "A",
    name: "Star A",
    title: "摇滚猫",
    rarity: "Epic",
    emoji: "🎸",
    color: "#ff9fbd",
    personality: "外放、自由、舞台感很强。",
    skill: "高连击时放大舞台灯光反馈。",
    learningTip: "A 适合训练开放感，不要和 G 的起飞感混在一起。"
  },
  {
    id: "royal-harmony",
    note: "Chord",
    name: "Royal Harmony",
    title: "和弦王冠猫",
    rarity: "Legendary",
    emoji: "💎",
    color: "#ff8fa2",
    personality: "会把音符组合成情绪颜色。",
    skill: "和弦关卡显示亮 / 柔 / 紧三种听感提示。",
    learningTip: "和弦不是多个音叠起来而已，它会直接改变情绪。"
  }
];

export function getUnlockedCats(stageId, learnedCount) {
  const count = stageId === "chord3" ? 6 : stageId === "note5" ? Math.min(5, 3 + Math.floor(learnedCount / 2)) : Math.min(3, 1 + Math.floor(learnedCount / 3));
  return CAT_ROSTER.slice(0, Math.max(1, count));
}
