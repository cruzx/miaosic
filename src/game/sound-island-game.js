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
    if (!state.started || state.phase === "reward") return false;
    state.heardTarget = true;
    state.phase = "search";
    state.feedback = "目标声音已播放。旋转音乐岛，点猫试听。";
    sceneController.pulseBowl();
    emit(true);
    await audio.playTarget(targetToken());
    return true;
  };

  const sampleCat = async (catId) => {
    if (!state.started || !state.heardTarget || state.phase === "reward") return false;
    const cat = activeCats().find((item) => item.id === catId);
    if (!cat) return false;
    if (!state.sampledIds.includes(catId)) state.sampledIds.push(catId);

    const heard = getToken(cat.token);
    const expected = targetToken();
    const correct = cat.token === state.targetTokenId;
    state.phase = "search";
    state.selectedCatId = correct ? catId : null;
    sceneController.pulseCat(catId, correct);
    emit(true);
    await audio.playCat(heard);

    if (correct) {
      state.feedback = "声音一样。按住这只猫，把它拖进猫粮碗。";
      onTip("找到了同声猫，拖进碗里", "good");
    } else {
      const difference = tokenPitch(heard) - tokenPitch(expected);
      state.feedback = heard.kind === "note"
        ? `这只猫${difference > 0 ? "更高" : "更低"}，继续比较。`
        : "声音颜色不同，继续比较。";
      onTip(state.feedback, "warn");
    }
    emit(true);
    return correct;
  };

  const submitCat = async (catId) => {
    if (!state.started || !state.heardTarget || state.phase === "reward") return false;
    const cat = activeCats().find((item) => item.id === catId);
    if (!cat) return false;
    const correct = cat.token === state.targetTokenId;

    if (!correct) {
      state.roundErrors += 1;
      progress.combo = 0;
      progress.score = Math.max(0, progress.score - 10);
      state.phase = "search";
      state.selectedCatId = null;
      state.feedback = "不是同声猫。可以重听猫粮，再继续找。";
      saveProgress(progress);
      audio.playWrong(tokenPitch(getToken(cat.token)) - tokenPitch(targetToken()));
      onTip("不是同声猫，继续找", "warn");
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

    state.phase = "reward";
    state.reward = { cat, token: targetToken(), points, firstDiscovery };
    state.feedback = "同声投喂成功。";
    sceneController.celebrate(cat.id, cat.accent);
    audio.playSuccess();
    onTip(`同声投喂成功 +${points}`, "good");
    emit(true);
    return true;
  };

  sceneController = createIslandScene({
    THREE,
    host,
    getState: publicState,
    onSample: sampleCat,
    onSubmit: submitCat,
    onLabels,
    onTip
  });
  sceneController.rebuildCats(activeCats());
  prepareRound();

  const start = async () => {
    state.started = true;
    state.phase = "listen";
    state.feedback = "先听猫粮，再去岛上寻找。";
    emit(true);
    await audio.resume();
    window.setTimeout(() => listen(), 180);
  };

  const next = () => {
    if (!state.started) return start();
    state.round = state.round >= stage().rounds ? 1 : state.round + 1;
    progress.rounds[state.stageId] = state.round;
    saveProgress(progress);
    state.phase = "listen";
    prepareRound();
    emit(true);
    window.setTimeout(() => listen(), 260);
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
    if (state.started) window.setTimeout(() => listen(), 220);
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
    resetProgress,
    getState: publicState,
    getActiveCats: activeCats,
    getScreenTargets: sceneController.getScreenTargets,
    destroy: sceneController.destroy
  };
}
