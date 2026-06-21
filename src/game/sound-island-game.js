import { makeSoundPlayer } from "./audio-engine.js";
import {
  CAT_ROSTER,
  STAGES,
  TOKENS,
  getCatForToken,
  getStage,
  getStageCats,
  getToken,
  getTotalMastery
} from "./data.js";
import { createIslandScene } from "./island-scene.js";
import { defaultProgress, loadProgress, roundTargetId, saveProgress, tokenPitch } from "./progress.js";

export function createSoundIslandGame({ THREE, host, onState = () => {}, onLabels = () => {}, onTip = () => {} } = {}) {
  if (!THREE) throw new Error("缺少 Three.js。");
  if (!host) throw new Error("找不到 3D 场景容器。");

  const audio = makeSoundPlayer();
  const progress = loadProgress();
  const initialStage = getStage(progress.stageId);
  const state = {
    started: false,
    stageId: initialStage.id,
    round: Math.max(1, Number(progress.rounds[initialStage.id]) || 1),
    phase: "intro",
    heardTarget: false,
    sampledIds: [],
    selectedCatId: null,
    roundErrors: 0,
    feedback: "",
    reward: null,
    targetTokenId: "C"
  };

  let lastSnapshot = "";
  let sceneController;

  const stage = () => getStage(state.stageId);
  const targetToken = () => getToken(state.targetTokenId);
  const targetCat = () => getCatForToken(stage(), state.targetTokenId);
  const activeCats = () => getStageCats(state.stageId);
  const selectedCat = () => activeCats().find((cat) => cat.id === state.selectedCatId) || null;
  const unlockedStageIds = () => {
    const total = getTotalMastery(progress.mastery);
    return STAGES.filter((item) => total >= item.unlockAt).map((item) => item.id);
  };

  const publicState = () => ({
    started: state.started,
    phase: state.phase,
    stage: stage(),
    stages: STAGES,
    round: state.round,
    heardTarget: state.heardTarget,
    sampledIds: [...state.sampledIds],
    selectedCatId: state.selectedCatId,
    selectedCat: selectedCat(),
    roundErrors: state.roundErrors,
    feedback: state.feedback,
    targetToken: targetToken(),
    targetCat: targetCat(),
    activeCats: activeCats(),
    unlockedStageIds: unlockedStageIds(),
    progress: {
      ...progress,
      mastery: { ...progress.mastery },
      rounds: { ...progress.rounds },
      collected: [...progress.collected]
    },
    reward: state.reward,
    roster: CAT_ROSTER,
    tokens: TOKENS
  });

  const emit = (force = false) => {
    const snapshot = JSON.stringify({
      started: state.started,
      phase: state.phase,
      stageId: state.stageId,
      round: state.round,
      heardTarget: state.heardTarget,
      sampledIds: state.sampledIds,
      selectedCatId: state.selectedCatId,
      roundErrors: state.roundErrors,
      score: progress.score,
      combo: progress.combo,
      mastery: progress.mastery,
      collected: progress.collected,
      reward: state.reward?.cat?.id || ""
    });
    if (!force && snapshot === lastSnapshot) return;
    lastSnapshot = snapshot;
    onState(publicState());
  };

  const prepareRound = () => {
    state.targetTokenId = roundTargetId(stage(), state.round);
    state.heardTarget = false;
    state.sampledIds = [];
    state.selectedCatId = null;
    state.roundErrors = 0;
    state.feedback = "";
    state.reward = null;
    sceneController?.restoreCats();
  };

  const listen = async () => {
    if (!state.started || state.phase === "reward" || state.phase === "feeding") return false;
    state.heardTarget = true;
    state.phase = "search";
    state.feedback = state.selectedCatId
      ? `再听一次目标，再决定是否投喂 ${selectedCat()?.name || "这只猫"}。`
      : "目标声音已播放。点一只猫试听，再决定是否投喂。";
    sceneController.pulseBowl();
    emit(true);
    await audio.playTarget(targetToken());
    return true;
  };

  const sampleCat = async (catId) => {
    if (!state.started || !state.heardTarget || state.phase === "reward" || state.phase === "feeding") return false;
    const cat = activeCats().find((item) => item.id === catId);
    if (!cat) return false;

    if (!state.sampledIds.includes(catId)) state.sampledIds.push(catId);
    state.phase = "search";
    state.selectedCatId = catId;
    state.feedback = `已选择 ${cat.name}。可以重听目标，或直接投喂验证。`;
    sceneController.selectCat(catId);
    emit(true);
    await audio.playCat(getToken(cat.token));
    onTip(`${cat.name}：试听完成`, "info");
    return true;
  };

  const submitCat = async (catId) => {
    if (!state.started || !state.heardTarget || state.phase === "reward" || state.phase === "feeding") return false;
    const cat = activeCats().find((item) => item.id === catId);
    if (!cat) return false;
    const correct = cat.token === state.targetTokenId;

    if (!correct) {
      state.roundErrors += 1;
      progress.combo = 0;
      progress.score = Math.max(0, progress.score - 10);
      state.phase = "search";
      state.selectedCatId = null;
      const heard = getToken(cat.token);
      const difference = tokenPitch(heard) - tokenPitch(targetToken());
      state.feedback = heard.kind === "note"
        ? `${cat.name}比目标${difference > 0 ? "更高" : "更低"}。换一只再试。`
        : `${cat.name}的声音颜色不一样。换一只再试。`;
      saveProgress(progress);
      sceneController.rejectCat(cat.id);
      audio.playWrong(difference);
      onTip(state.feedback, "warn");
      emit(true);
      return false;
    }

    const firstDiscovery = !progress.collected.includes(cat.id);
    progress.combo += 1;
    progress.bestCombo = Math.max(progress.bestCombo, progress.combo);
    const points = Math.max(
      70,
      100 + Math.min(4, progress.combo - 1) * 15 + (firstDiscovery ? 30 : 0) - state.roundErrors * 10
    );
    progress.score += points;
    progress.mastery[state.stageId] = (progress.mastery[state.stageId] || 0) + 1;
    if (firstDiscovery) progress.collected.push(cat.id);
    progress.rounds[state.stageId] = state.round;
    saveProgress(progress);

    state.phase = "feeding";
    state.feedback = `${cat.name}正在跑向猫粮。`;
    emit(true);
    await sceneController.feedCat(cat.id, cat.accent);
    await audio.playSuccess();

    state.phase = "reward";
    state.reward = { cat, token: targetToken(), points, firstDiscovery };
    state.feedback = "同声投喂成功。";
    onTip(`同声投喂成功 +${points}`, "good");
    emit(true);
    return true;
  };

  const submitSelected = () => {
    if (!state.selectedCatId) {
      onTip("先点一只猫试听", "warn");
      return false;
    }
    return submitCat(state.selectedCatId);
  };

  sceneController = createIslandScene({
    THREE,
    host,
    getState: publicState,
    onSample: sampleCat,
    onLabels,
    onTip
  });
  sceneController.rebuildCats(activeCats());
  prepareRound();

  const start = async () => {
    state.started = true;
    state.phase = "listen";
    state.feedback = "先听猫粮，再点猫试听。";
    emit(true);
    await audio.resume();
    window.setTimeout(() => listen(), 120);
  };

  const next = () => {
    if (!state.started) return start();
    state.round = state.round >= stage().rounds ? 1 : state.round + 1;
    progress.rounds[state.stageId] = state.round;
    saveProgress(progress);
    state.phase = "listen";
    prepareRound();
    emit(true);
    window.setTimeout(() => listen(), 220);
    return true;
  };

  const setStage = (stageId) => {
    if (!unlockedStageIds().includes(stageId)) {
      onTip("这个区域还没有开放", "warn");
      return false;
    }
    state.stageId = getStage(stageId).id;
    progress.stageId = state.stageId;
    state.round = Math.max(1, Number(progress.rounds[state.stageId]) || 1);
    state.phase = state.started ? "listen" : "intro";
    sceneController.rebuildCats(activeCats());
    prepareRound();
    saveProgress(progress);
    emit(true);
    if (state.started) window.setTimeout(() => listen(), 180);
    return true;
  };

  const resetProgress = () => {
    const reset = defaultProgress();
    Object.keys(progress).forEach((key) => delete progress[key]);
    Object.assign(progress, reset);
    state.started = false;
    state.stageId = STAGES[0].id;
    state.round = 1;
    state.phase = "intro";
    sceneController.rebuildCats(activeCats());
    prepareRound();
    saveProgress(progress);
    emit(true);
  };

  emit(true);

  return {
    start,
    listen,
    next,
    setStage,
    sampleCat,
    submitCat,
    submitSelected,
    resetProgress,
    getState: publicState,
    getActiveCats: activeCats,
    getScreenTargets: sceneController.getScreenTargets,
    destroy: sceneController.destroy
  };
}
