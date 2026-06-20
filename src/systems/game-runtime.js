const SOUND_LIBRARY = [
  {
    id: "wave-bell",
    name: "海浪铃声",
    role: "岛屿入口",
    emoji: "🌊",
    color: "#49b8ff",
    frequency: 523.25,
    waveform: "sine",
    copy: "像海浪拍到玻璃贝壳，声音清亮、稳定，是音乐岛的安全感。"
  },
  {
    id: "forest-marimba",
    name: "森林木琴",
    role: "节奏森林",
    emoji: "🌿",
    color: "#7ed957",
    frequency: 659.25,
    waveform: "triangle",
    copy: "短促、有弹性，适合训练用户识别木质颗粒感。"
  },
  {
    id: "star-synth",
    name: "星星合成器",
    role: "夜光灯塔",
    emoji: "✨",
    color: "#b78cff",
    frequency: 783.99,
    waveform: "sawtooth",
    copy: "亮、薄、带一点未来感，是找声音玩法里的高辨识目标。"
  },
  {
    id: "drum-shell",
    name: "贝壳鼓点",
    role: "沙滩鼓圈",
    emoji: "🥁",
    color: "#ffd447",
    frequency: 164.81,
    waveform: "square",
    copy: "低频更厚，像脚踩沙滩时的回弹，用来建立节拍感。"
  }
];

function makeRound(roundIndex = 0) {
  const targetIndex = roundIndex % SOUND_LIBRARY.length;
  const target = SOUND_LIBRARY[targetIndex];
  const choices = [...SOUND_LIBRARY]
    .sort((a, b) => ((a.id.length + roundIndex) % 3) - ((b.id.length + roundIndex) % 3))
    .map((item) => item.id);

  return {
    index: roundIndex + 1,
    targetId: target.id,
    choices,
    heardTarget: false,
    answered: false,
    result: "ready"
  };
}

export function createGameRuntime() {
  const listeners = new Set();
  const state = {
    app: "miaosic",
    mode: "sound-island",
    islandName: "Miaosic 音乐岛",
    score: 0,
    combo: 0,
    bestCombo: 0,
    energy: 72,
    discovered: [],
    round: makeRound(0),
    sounds: SOUND_LIBRARY
  };

  const emit = (type, detail = {}) => {
    const event = { type, state, ...detail };
    listeners.forEach((listener) => listener(event));
    window.dispatchEvent(new CustomEvent(`miaosic:${type}`, { detail: event }));
  };

  const api = {
    state,
    sounds: SOUND_LIBRARY,
    subscribe(listener) {
      listeners.add(listener);
      listener({ type: "init", state });
      return () => listeners.delete(listener);
    },
    getSound(id) {
      return SOUND_LIBRARY.find((sound) => sound.id === id) || SOUND_LIBRARY[0];
    },
    playTarget() {
      state.round.heardTarget = true;
      emit("target-played", { target: api.getSound(state.round.targetId) });
    },
    chooseSound(id) {
      if (state.round.answered) return false;
      const correct = id === state.round.targetId;
      state.round.answered = true;
      state.round.result = correct ? "correct" : "wrong";

      if (correct) {
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.score += 120 + state.combo * 20;
        state.energy = Math.min(100, state.energy + 7);
        if (!state.discovered.includes(id)) state.discovered.push(id);
      } else {
        state.combo = 0;
        state.energy = Math.max(0, state.energy - 10);
      }

      emit("sound-picked", {
        picked: api.getSound(id),
        target: api.getSound(state.round.targetId),
        correct
      });
      return correct;
    },
    nextRound() {
      const nextIndex = state.round.index % SOUND_LIBRARY.length;
      state.round = makeRound(nextIndex);
      emit("round-started", { round: state.round, target: api.getSound(state.round.targetId) });
    },
    reset() {
      state.score = 0;
      state.combo = 0;
      state.bestCombo = 0;
      state.energy = 72;
      state.discovered = [];
      state.round = makeRound(0);
      emit("reset", { round: state.round });
    }
  };

  return api;
}
