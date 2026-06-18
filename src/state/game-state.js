import { DEFAULT_STAGE_ID } from "../config/stages.js";

/**
 * @typedef {Object} GameState
 * @property {string} stage
 * @property {number} round
 * @property {number} score
 * @property {number} combo
 * @property {boolean} solved
 * @property {boolean} heardTarget
 * @property {any} selectedCat
 * @property {any} draggingCat
 */

/** @returns {GameState & Record<string, any>} */
export function createGameState({ THREE, initialStage = DEFAULT_STAGE_ID } = {}) {
  if (!THREE) throw new Error("createGameState requires THREE so runtime vectors stay compatible.");

  return {
    audio: null,
    audioCache: new Map(),
    stage: initialStage,
    round: 1,
    score: 0,
    combo: 0,
    learned: [],
    lastLearned: "",
    solved: false,
    target: null,
    selectedCat: null,
    draggingCat: null,
    heardTarget: false,
    sampledCat: false,
    missionOpen: true,
    dragOffset: new THREE.Vector3(),
    rotatingWorld: false,
    rotateVelocityX: 0,
    rotateVelocityY: 0,
    lastWorldSpinAt: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    dragStartX: 0,
    dragStartY: 0,
    dragDistance: 0,
    suppressClickUntil: 0,
    cats: [],
    confetti: [],
    notes: [],
    soundWaves: [],
    soundTrails: [],
    shockwaves: [],
    learnCards3d: [],
    knowledgeBadges3d: [],
    masteryTokens3d: [],
    dragSparkles: [],
    walkPuffs: [],
    catHints: [],
    boardShakeUntil: 0,
    celebrateUntil: 0,
    victoryUntil: 0,
    stageClearUntil: 0,
    autoReplayUntil: 0,
    lastBowlChimeAt: 0,
    listenPulseUntil: 0,
    groupRewardOpen: false,
    lastTime: 0,
    animationFrame: null
  };
}
