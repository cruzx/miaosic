export const NOTE_KNOWLEDGE = {
  C: {
    solfege: "Do",
    role: "家的感觉",
    relation: "听起来最稳，像回到安全区。",
    tip: "按到 Do 时，记住这个“落地”的感觉。以后听旋律，先找它有没有回家。",
    color: "#49B8FF",
    battle: "稳定护盾",
    reward: "你记住了：Do = 家"
  },
  D: {
    solfege: "Re",
    role: "向前一步",
    relation: "比 Do 往上走了一步，像角色刚开始出发。",
    tip: "Re 的感觉不是结束，而是准备继续往前。听到它，想象脚步刚迈出去。",
    color: "#7ED957",
    battle: "冲刺音步",
    reward: "你记住了：Re = 出发"
  },
  E: {
    solfege: "Mi",
    role: "阳光出来了",
    relation: "比 Do 更亮，像画面突然变开心。",
    tip: "Mi 是大调开心感的关键。听到它，记住“亮起来”的感觉。",
    color: "#FFD447",
    battle: "阳光连击",
    reward: "你记住了：Mi = 明亮"
  },
  G: {
    solfege: "So",
    role: "旋律起飞",
    relation: "离 Do 更远，像副歌打开、角色跳起来。",
    tip: "So 有往高处撑开的感觉。听到它，想象旋律正在起飞。",
    color: "#B78CFF",
    battle: "起飞大跳",
    reward: "你记住了：So = 起飞"
  }
};

export const LEARNING_GOALS = [
  "Do：家的感觉，旋律落地。",
  "Re：向前一步，旋律出发。",
  "Mi：阳光出来，旋律变亮。",
  "So：旋律起飞，空间打开。"
];

export const RESULT_MEMORY = [
  "Do = 家：听到稳定落点。",
  "Re = 出发：听到向前一步。",
  "Mi = 阳光：听到明亮开心。",
  "So = 起飞：听到旋律打开。"
];

export function getNoteKnowledge(noteName) {
  return NOTE_KNOWLEDGE[noteName] || NOTE_KNOWLEDGE.C;
}
