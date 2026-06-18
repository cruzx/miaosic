export const WORLD_REGIONS = [
  {
    id: "do-isle",
    note: "C",
    name: "Do 岛",
    title: "稳定之岛",
    emoji: "🏝️",
    color: "#ffd86f",
    unlock: "默认开放",
    lesson: "C / Do 是很多旋律的落脚点。先把它听成“家”的感觉。",
    mechanic: "听目标音 → 找到同声猫 → 拖到猫粮能量圈",
    reward: "国王猫 · Crown C"
  },
  {
    id: "re-forest",
    note: "D",
    name: "Re 森林",
    title: "出发之森",
    emoji: "🌲",
    color: "#7fe19e",
    unlock: "收集 3 张音高徽章",
    lesson: "D / Re 有向前走的感觉，常用来连接稳定音和明亮音。",
    mechanic: "增加干扰猫，训练目标音记忆保持",
    reward: "探险猫 · Scout D"
  },
  {
    id: "mi-academy",
    note: "E",
    name: "Mi 学院",
    title: "明亮学院",
    emoji: "🏰",
    color: "#8fd3ff",
    unlock: "完成单音 1",
    lesson: "E / Mi 更明亮，是很多开心旋律的关键音。",
    mechanic: "加入快速复听，鼓励玩家比较高低差",
    reward: "魔法猫 · Mage E"
  },
  {
    id: "so-sky",
    note: "G",
    name: "So 天空城",
    title: "高空旋律城",
    emoji: "☁️",
    color: "#a9b6ff",
    unlock: "进入五声音阶",
    lesson: "G / So 常像副歌起飞点，适合训练旋律方向感。",
    mechanic: "在更大音域内先判断高低区间",
    reward: "爵士猫 · Groove G"
  },
  {
    id: "la-theater",
    note: "A",
    name: "La 剧院",
    title: "情绪剧场",
    emoji: "🎭",
    color: "#ff9fbd",
    unlock: "收集 5 张旋律纹章",
    lesson: "A / La 常带来开放和抒情感，适合训练旋律表情。",
    mechanic: "用连击奖励推动稳定识别",
    reward: "摇滚猫 · Star A"
  },
  {
    id: "harmony-throne",
    note: "Chord",
    name: "和声王座",
    title: "三和弦试炼",
    emoji: "👑",
    color: "#ff8fa2",
    unlock: "完成五声音阶章节",
    lesson: "大三、小三、减三不是公式，是三种可以听见的情绪颜色。",
    mechanic: "根据和弦颜色找到正确猫咪阵营",
    reward: "和弦王冠 · Royal Harmony"
  }
];

export function getRegionProgress(stageId, learnedCount) {
  if (stageId === "chord3") return Math.min(WORLD_REGIONS.length, 6);
  if (stageId === "note5") return Math.min(WORLD_REGIONS.length, 3 + Math.floor(learnedCount / 2));
  return Math.max(1, Math.min(3, 1 + Math.floor(learnedCount / 3)));
}
