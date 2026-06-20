import { STAGES, getStage } from "./data.js";

const STORAGE_KEY = "miaosic.sound-island.v3";

export function defaultProgress() {
  return {
    score: 0,
    combo: 0,
    bestCombo: 0,
    mastery: Object.fromEntries(STAGES.map((stage) => [stage.id, 0])),
    collected: [],
    stageId: STAGES[0].id,
    rounds: Object.fromEntries(STAGES.map((stage) => [stage.id, 1]))
  };
}

export function loadProgress() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return defaultProgress();
    const fallback = defaultProgress();
    const stageId = getStage(saved.stageId).id;
    return {
      ...fallback,
      ...saved,
      stageId,
      mastery: { ...fallback.mastery, ...(saved.mastery || {}) },
      rounds: { ...fallback.rounds, ...(saved.rounds || {}) },
      collected: Array.isArray(saved.collected) ? saved.collected : []
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Embedded previews and private browsing may block localStorage.
  }
}

export function tokenPitch(token) {
  const frequencies = token?.frequencies || [token?.frequency || 0];
  return frequencies.reduce((sum, value) => sum + value, 0) / Math.max(1, frequencies.length);
}

export function roundTargetId(stage, round) {
  const stride = stage.tokenIds.length > 3 ? 2 : 1;
  const index = ((round - 1) * stride + Math.floor((round - 1) / stage.tokenIds.length)) % stage.tokenIds.length;
  return stage.tokenIds[index];
}
