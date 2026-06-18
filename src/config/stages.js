/** @typedef {"note" | "chord"} StageKind */

/**
 * @typedef {Object} StageConfig
 * @property {string} id
 * @property {StageKind} kind
 * @property {number} rounds
 * @property {string[]} notes
 * @property {string[]=} chords
 * @property {string} intro
 * @property {string} lesson
 * @property {string} badge
 * @property {number} accent
 * @property {string} prompt
 * @property {string} heroTitle
 * @property {string} rewardName
 * @property {string} memoryHint
 * @property {string[]} syllabus
 * @property {number} masteryGoal
 */

export const NOTE_TO_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export const NOTE_NAMES = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "So", A: "La", B: "Ti" };
export const CHORDS = {
  major: { label: "大三", intervals: [0, 4, 7], tip: "听起来更亮、更稳。" },
  minor: { label: "小三", intervals: [0, 3, 7], tip: "听起来更柔和。" },
  dim: { label: "减三", intervals: [0, 3, 6], tip: "听起来更紧张。" }
};

/** @type {Record<string, StageConfig>} */
export const STAGES = {
  note3: {
    id: "note3",
    rounds: 6,
    kind: "note",
    notes: ["C", "D", "E"],
    intro: "单音 1 · C / D / E",
    lesson: "入门：先分清 3 个音高。",
    badge: "★☆☆ 入门音高",
    accent: 0xffd86f,
    prompt: "找同声猫",
    heroTitle: "皇家音高营",
    rewardName: "音高徽章",
    memoryHint: "把 C / D / E 当成三只气质不同的小猫，先记住谁更稳、谁更亮。",
    syllabus: ["认识 Do Re Mi", "练习先听后找", "第一次建立音高记忆"],
    masteryGoal: 6
  },
  note5: {
    id: "note5",
    rounds: 8,
    kind: "note",
    notes: ["C", "D", "E", "G", "A"],
    intro: "单音 2 · 5 个音",
    lesson: "进阶：同一个音藏在更多猫里。",
    badge: "★★☆ 更多音高",
    accent: 0x8fd3ff,
    prompt: "更多猫里找同音",
    heroTitle: "皇家巡游队",
    rewardName: "旋律纹章",
    memoryHint: "把五个音想成一条短旋律，优先记住最高和最低的情绪落点。",
    syllabus: ["扩大到 5 个音高", "在混淆里快速定位", "练耳速度和稳定度一起提升"],
    masteryGoal: 8
  },
  chord3: {
    id: "chord3",
    rounds: 8,
    kind: "chord",
    notes: ["C", "D", "E", "F", "G", "A"],
    chords: ["major", "minor", "dim"],
    intro: "和弦 1 · 听颜色",
    lesson: "挑战：听亮、柔、紧三种和弦颜色。",
    badge: "★★★ 和弦颜色",
    accent: 0xff8fa2,
    prompt: "找同色和弦猫",
    heroTitle: "和声王座战",
    rewardName: "和弦王冠",
    memoryHint: "先不死记理论，先听“亮、柔、紧”三种颜色，再把听感映射到和弦名字。",
    syllabus: ["区分大三和弦", "区分小三和弦", "识别紧张的减三和弦"],
    masteryGoal: 8
  }
};

export const DEFAULT_STAGE_ID = "note3";
