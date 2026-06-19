import { JUDGE_WINDOWS, RHYTHM_CHARTS } from "../config/rhythm-charts.js";

function createAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  const ctx = new AudioContextClass();

  const playTone = (frequency = 440, duration = 0.08, type = "square", gainValue = 0.035) => {
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  };

  return { ctx, playTone };
}

const LANE_FREQUENCIES = [261.63, 293.66, 329.63, 392.0];

export function createRhythmEngine({ chart = RHYTHM_CHARTS.tutorial, onUpdate, onJudge, onFinish } = {}) {
  const audio = createAudio();
  const state = {
    chart,
    running: false,
    startAt: 0,
    elapsed: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    energy: 0,
    hp: 100,
    finished: false,
    notes: chart.notes.map((note, index) => ({ ...note, id: `${chart.id}-${index}`, hit: false, missed: false }))
  };

  let rafId = 0;
  let lastBeat = -1;

  const emitUpdate = () => onUpdate?.({ ...state, notes: state.notes });

  const judgeScore = (delta) => {
    const abs = Math.abs(delta);
    if (abs <= JUDGE_WINDOWS.perfect) return "perfect";
    if (abs <= JUDGE_WINDOWS.great) return "great";
    if (abs <= JUDGE_WINDOWS.good) return "good";
    if (abs <= JUDGE_WINDOWS.miss) return "bad";
    return "miss";
  };

  const addJudge = (result, note) => {
    const points = { perfect: 120, great: 80, good: 45, bad: 10, miss: 0 }[result] || 0;
    if (result === "miss" || result === "bad") {
      state.combo = 0;
      state.hp = Math.max(0, state.hp - (result === "miss" ? 9 : 4));
    } else {
      state.combo += 1;
      state.maxCombo = Math.max(state.maxCombo, state.combo);
      state.energy = Math.min(100, state.energy + (result === "perfect" ? 10 : result === "great" ? 7 : 4));
    }
    state.score += points + Math.min(80, state.combo * 2);
    onJudge?.({ result, note, score: state.score, combo: state.combo, energy: state.energy, hp: state.hp });
  };

  const loop = (now) => {
    if (!state.running) return;
    state.elapsed = (now - state.startAt) / 1000;

    const beatLength = 60 / chart.bpm;
    const beat = Math.floor(state.elapsed / beatLength);
    if (beat !== lastBeat) {
      lastBeat = beat;
      audio?.playTone(beat % 4 === 0 ? 164.81 : 110, 0.045, "triangle", beat % 4 === 0 ? 0.04 : 0.025);
    }

    state.notes.forEach((note) => {
      if (!note.hit && !note.missed && state.elapsed - note.time > JUDGE_WINDOWS.miss) {
        note.missed = true;
        addJudge("miss", note);
      }
    });

    if (state.elapsed >= chart.duration || state.notes.every((note) => note.hit || note.missed)) {
      state.running = false;
      state.finished = true;
      onFinish?.({ ...state, notes: state.notes });
      emitUpdate();
      return;
    }

    emitUpdate();
    rafId = requestAnimationFrame(loop);
  };

  const start = () => {
    state.running = true;
    state.finished = false;
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.energy = 0;
    state.hp = 100;
    state.notes = chart.notes.map((note, index) => ({ ...note, id: `${chart.id}-${index}`, hit: false, missed: false }));
    state.startAt = performance.now() + 900;
    state.elapsed = -0.9;
    lastBeat = -1;
    audio?.playTone(523.25, 0.08, "square", 0.04);
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
    emitUpdate();
  };

  const stop = () => {
    state.running = false;
    cancelAnimationFrame(rafId);
    emitUpdate();
  };

  const hitLane = (lane) => {
    if (!state.running) return;
    const candidates = state.notes
      .filter((note) => !note.hit && !note.missed && note.lane === lane)
      .map((note) => ({ note, delta: state.elapsed - note.time }))
      .filter(({ delta }) => Math.abs(delta) <= JUDGE_WINDOWS.miss)
      .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));

    if (!candidates.length) {
      addJudge("bad", { lane, ghost: true });
      audio?.playTone(90, 0.08, "sawtooth", 0.02);
      emitUpdate();
      return;
    }

    const { note, delta } = candidates[0];
    const result = judgeScore(delta);
    note.hit = true;
    note.delta = delta;
    note.result = result;
    audio?.playTone(LANE_FREQUENCIES[lane] || 440, 0.075, result === "perfect" ? "square" : "triangle", result === "perfect" ? 0.055 : 0.038);
    addJudge(result, note);
    emitUpdate();
  };

  const useSuper = () => {
    if (state.energy < 100) return false;
    state.energy = 0;
    state.score += 1000;
    audio?.playTone(196, 0.06, "square", 0.05);
    window.setTimeout(() => audio?.playTone(261.63, 0.06, "square", 0.05), 70);
    window.setTimeout(() => audio?.playTone(329.63, 0.08, "square", 0.05), 140);
    onJudge?.({ result: "super", note: null, score: state.score, combo: state.combo, energy: state.energy, hp: state.hp });
    emitUpdate();
    return true;
  };

  return { state, start, stop, hitLane, useSuper };
}
