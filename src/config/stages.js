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
 * @property {string[]} theoryCards
 * @property {string} playerPromise
 * @property {string} masteryRule
 * @property {number} masteryGoal
 */

export const NOTE_TO_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export const NOTE_NAMES = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "So", A: "La", B: "Ti" };
export const CHORDS = {
  major: { label: "大三", intervals: [0, 4, 7], tip: "听起来更亮、更稳，像阳光照进来。" },
  minor: { label: "小三", intervals: [0, 3, 7], tip: "听起来更柔和、更内收，适合安静情绪。" },
  dim: { label: "减三", intervals: [0, 3, 6], tip: "听起来更紧张，像故事马上要转折。" }
};

/** @type {Record<string, StageConfig>} */
export const STAGES = {
  note3: {
    id: "note3",
    rounds: 6,
    kind: "note",
    notes: ["C", "D", "E"],
    intro: "单音 1 · C / D / E",
    lesson: "入门：先分清 3 个音高，建立最小可用的听觉地图。",
    badge: "★☆☆ 入门音高",
    accent: 0xffd86f,
    prompt: "找同声猫",
    heroTitle: "皇家音高营",
    rewardName: "音高徽章",
    memoryHint: "把 C / D / E 当成三只气质不同的小猫：C 更稳，D 像准备出发，E 更亮。",
    syllabus: ["认识 Do Re Mi", "练习先听后找", "第一次建立音高记忆"],
    theoryCards: [
      "C / D / E 是旋律的地基，先听出谁更高，不急着记谱。",
      "每次点猫前先在脑子里复唱目标音，手指再行动。",
      "连续答对时，提高标准：不是猜中，而是听到差异。"
    ],
    playerPromise: "3 分钟后，玩家能开始听出 Do、Re、Mi 的相对高低。",
    masteryRule: "连续收集 6 张音卡后进入 5 音阶段。",
    masteryGoal: 6
  },
  note5: {
    id: "note5",
    rounds: 8,
    kind: "note",
    notes: ["C", "D", "E", "G", "A"],
    intro: "单音 2 · 五声音阶",
    lesson: "进阶：同一个音藏在更多猫里，训练稳定识别而不是碰运气。",
    badge: "★★☆ 更多音高",
    accent: 0x8fd3ff,
    prompt: "更多猫里找同音",
    heroTitle: "旋律巡游队",
    rewardName: "旋律纹章",
    memoryHint: "五声音阶像一条短旋律，优先记住最低、最高和最亮的落点。",
    syllabus: ["扩大到 5 个音高", "在混淆里快速定位", "练耳速度和稳定度一起提升"],
    theoryCards: [
      "五声音阶天然适合游戏：少半音冲突，旋律更容易被记住。",
      "C 到 A 的范围更大，听的时候先判断高低区间，再判断具体音名。",
      "不要只追速度。稳定正确率是后续和弦训练的资产。"
    ],
    playerPromise: "玩家开始用“声音位置”理解旋律，而不是只靠按钮记忆。",
    masteryRule: "8 回合内稳定命中后，解锁和弦颜色。",
    masteryGoal: 8
  },
  chord3: {
    id: "chord3",
    rounds: 8,
    kind: "chord",
    notes: ["C", "D", "E", "F", "G", "A"],
    chords: ["major", "minor", "dim"],
    intro: "和弦 1 · 听颜色",
    lesson: "挑战：把大三、小三、减三听成三种情绪颜色。",
    badge: "★★★ 和弦颜色",
    accent: 0xff8fa2,
    prompt: "找同色和弦猫",
    heroTitle: "和声王座战",
    rewardName: "和弦王冠",
    memoryHint: "先不死记理论。先听“亮、柔、紧”三种颜色，再把听感映射到和弦名字。",
    syllabus: ["区分大三和弦", "区分小三和弦", "识别紧张的减三和弦"],
    theoryCards: [
      "大三和弦 = 根音 + 4 半音 + 7 半音，听感更明亮。",
      "小三和弦 = 根音 + 3 半音 + 7 半音，听感更柔和。",
      "减三和弦 = 根音 + 3 半音 + 6 半音，听感更紧张，适合关卡危机感。"
    ],
    playerPromise: "玩家可以把和弦从抽象术语变成可感知的情绪色彩。",
    masteryRule: "8 回合后形成第一套和弦情绪词典。",
    masteryGoal: 8
  }
};

export const DEFAULT_STAGE_ID = "note3";