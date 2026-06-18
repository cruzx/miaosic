export const DAILY_QUESTS = [
  {
    id: "warm-ear",
    title: "热身听音",
    target: "完成 3 次目标音播放",
    reward: "猫粮币 +30",
    learning: "建立先听后操作的基本节奏。"
  },
  {
    id: "perfect-feed",
    title: "精准投喂",
    target: "连续答对 3 回合",
    reward: "星光罐头 +1",
    learning: "训练短时音高记忆，不靠猜。"
  },
  {
    id: "note-collector",
    title: "音卡收集",
    target: "新增 1 张音卡",
    reward: "图鉴经验 +50",
    learning: "把一次听觉判断转化成可复习知识。"
  },
  {
    id: "harmony-scout",
    title: "和声侦察",
    target: "在和弦关卡听出 2 种情绪颜色",
    reward: "王冠碎片 +1",
    learning: "把大三、小三、减三听成亮、柔、紧。"
  }
];

export function getDailyQuestProgress(state) {
  const learnedCount = state.learned?.length || 0;
  const combo = state.combo || 0;
  const heard = state.heardTarget ? 1 : 0;
  return {
    "warm-ear": Math.min(1, heard / 1),
    "perfect-feed": Math.min(1, combo / 3),
    "note-collector": Math.min(1, learnedCount / 1),
    "harmony-scout": state.stage === "chord3" ? Math.min(1, learnedCount / 2) : 0
  };
}
