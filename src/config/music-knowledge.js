export const NOTE_KNOWLEDGE = {
  C: {
    solfege: "Do",
    role: "主音 / 稳定落点",
    relation: "像旋律里的家，很多句子最后会回到这里。",
    tip: "听到 C 时，先记住它的稳定感，再用它比较 D、E、G。",
    color: "#49B8FF"
  },
  D: {
    solfege: "Re",
    role: "上行动力",
    relation: "比 C 高一步，常给旋律带来出发感。",
    tip: "D 不像 C 那么稳定，它更像往前走的一步。",
    color: "#7ED957"
  },
  E: {
    solfege: "Mi",
    role: "明亮色彩",
    relation: "比 C 更亮，是大调开心感的重要来源。",
    tip: "听 E 时感受明亮度，它常让旋律表情变开朗。",
    color: "#FFD447"
  },
  G: {
    solfege: "So",
    role: "支撑与起飞",
    relation: "距离 C 更远，常像副歌或旋律打开的支点。",
    tip: "G 有抬起来的感觉，适合判断旋律是否跳到了更高处。",
    color: "#B78CFF"
  }
};

export const LEARNING_GOALS = [
  "按准节拍：先把手指和拍点对齐。",
  "识别音名：C / D / E / G 对应 Do / Re / Mi / So。",
  "理解关系：C 稳，D 向前，E 明亮，G 起飞。",
  "把节奏命中转化成音乐记忆，而不是只追分数。"
];

export function getNoteKnowledge(noteName) {
  return NOTE_KNOWLEDGE[noteName] || NOTE_KNOWLEDGE.C;
}
