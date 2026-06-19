import { RHYTHM_CHARTS } from "../config/rhythm-charts.js";
import { createRhythmEngine } from "../systems/rhythm-engine.js";

const STYLE_ID = "miaosic-rhythm-battle-style";

function dispatchRhythmEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(`miaosic:rhythm-${name}`, { detail }));
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .miao-rhythm-root {
      position: absolute;
      inset: 0;
      z-index: 78;
      display: none;
      color: #fff;
      pointer-events: none;
      font-family: Impact, "Arial Black", "Trebuchet MS", system-ui, sans-serif;
      text-shadow: 0 3px 0 #070914, 2px 0 0 #070914, -2px 0 0 #070914, 0 -2px 0 #070914;
      user-select: none;
    }

    .page.brawl-play .miao-rhythm-root { display: block; }

    .miao-rhythm-hud {
      position: absolute;
      left: calc(env(safe-area-inset-left, 0px) + 18px);
      right: calc(env(safe-area-inset-right, 0px) + 18px);
      top: calc(env(safe-area-inset-top, 0px) + 70px);
      z-index: 8;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 14px;
      align-items: center;
      pointer-events: none;
    }

    .miao-rhythm-stat {
      min-height: 54px;
      padding: 8px 12px;
      border: 4px solid #070914;
      border-radius: 10px;
      background: linear-gradient(180deg, #303a60, #141b31);
      box-shadow: 0 5px 0 #050711;
    }

    .miao-rhythm-stat span {
      display: block;
      color: #bfe5ff;
      font-size: 12px;
      text-shadow: none;
      font-family: "Arial Black", system-ui;
    }

    .miao-rhythm-stat strong { display: block; font-size: 24px; line-height: 1; }

    .miao-rhythm-judge {
      min-width: 180px;
      min-height: 58px;
      display: grid;
      place-items: center;
      border: 4px solid #070914;
      border-radius: 12px;
      background: linear-gradient(180deg, #ffd93c, #ff8b1f);
      box-shadow: 0 6px 0 #733900;
      font-size: 32px;
      transform: rotate(-2deg) scale(.92);
      opacity: 0;
      transition: opacity 80ms ease, transform 120ms cubic-bezier(.2, 1.7, .3, 1);
    }

    .miao-rhythm-judge.show { opacity: 1; transform: rotate(-2deg) scale(1); }
    .miao-rhythm-judge.miss, .miao-rhythm-judge.bad { background: linear-gradient(180deg, #ff6270, #b8142c); box-shadow: 0 6px 0 #5d0614; }
    .miao-rhythm-judge.super { background: linear-gradient(180deg, #c873ff, #7133ff); box-shadow: 0 6px 0 #2d1170; }

    .miao-rhythm-track {
      position: absolute;
      left: 50%;
      right: auto;
      bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
      z-index: 10;
      width: min(760px, calc(100vw - 250px));
      height: min(300px, 38vh);
      transform: translateX(-50%);
      pointer-events: auto;
    }

    .miao-rhythm-track::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 84px;
      height: 8px;
      border: 3px solid #070914;
      border-radius: 999px;
      background: #fff;
      box-shadow: 0 0 24px rgba(255,255,255,.52), 0 6px 0 rgba(0,0,0,.18);
    }

    .miao-rhythm-lane {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 23%;
      border-left: 2px solid rgba(255,255,255,.12);
      border-right: 2px solid rgba(0,0,0,.12);
      background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.12) 68%, rgba(255,255,255,.03));
      border-radius: 20px 20px 28px 28px;
    }

    .miao-rhythm-lane:nth-child(1) { left: 0; }
    .miao-rhythm-lane:nth-child(2) { left: 25.66%; }
    .miao-rhythm-lane:nth-child(3) { left: 51.33%; }
    .miao-rhythm-lane:nth-child(4) { right: 0; }

    .miao-rhythm-note {
      position: absolute;
      left: calc(var(--lane) * 25.66% + 11.5%);
      bottom: calc(var(--y) * 1%);
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      border: 5px solid #070914;
      border-radius: 50%;
      background: var(--note-color, #ffd21f);
      box-shadow: inset -6px -7px 0 rgba(0,0,0,.16), 0 8px 14px rgba(0,0,0,.28);
      color: #fff;
      font-size: 24px;
      transform: translate(-50%, 50%) scale(var(--scale, 1));
      transition: transform 70ms ease, opacity 90ms ease;
    }

    .miao-rhythm-note.hold { border-radius: 18px; height: 86px; }
    .miao-rhythm-note.hit, .miao-rhythm-note.missed { opacity: 0; transform: translate(-50%, 50%) scale(1.45); }

    .miao-rhythm-buttons {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      pointer-events: auto;
    }

    .miao-rhythm-btn {
      height: 78px;
      border: 5px solid #070914;
      border-radius: 18px;
      background: linear-gradient(180deg, var(--lane-color), color-mix(in srgb, var(--lane-color), #000 24%));
      box-shadow: 0 7px 0 rgba(0,0,0,.52), inset 0 -6px 0 rgba(0,0,0,.14);
      color: #fff;
      font-size: 27px;
      font-weight: 1000;
      pointer-events: auto;
    }

    .miao-rhythm-btn:active, .miao-rhythm-btn.pressed { transform: translateY(5px) scale(.98); box-shadow: 0 2px 0 rgba(0,0,0,.52); filter: brightness(1.18); }

    .miao-rhythm-super {
      position: absolute;
      right: calc(env(safe-area-inset-right, 0px) + 34px);
      bottom: calc(env(safe-area-inset-bottom, 0px) + 132px);
      z-index: 12;
      width: 108px;
      height: 108px;
      display: grid;
      place-items: center;
      border: 6px solid #070914;
      border-radius: 50%;
      background: conic-gradient(#ffd21f calc(var(--energy, 0) * 1%), #4b526f 0), linear-gradient(180deg, #ffe13b, #ff9c00);
      box-shadow: 0 7px 0 #743800, 0 0 0 8px rgba(255,255,255,.08);
      color: #fff;
      font-size: 42px;
      pointer-events: auto;
    }

    .miao-rhythm-super.ready { animation: miaoSuperPulse 720ms ease-in-out infinite; }
    @keyframes miaoSuperPulse { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.08); filter: brightness(1.25); } }

    .miao-rhythm-start {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 20;
      width: min(420px, calc(100vw - 40px));
      padding: 22px 20px 20px;
      border: 5px solid #070914;
      border-radius: 18px;
      background: linear-gradient(180deg, #303a60, #141b31);
      box-shadow: 0 10px 0 #050711, 0 24px 60px rgba(0,0,0,.38);
      transform: translate(-50%, -50%) rotate(-1deg);
      text-align: center;
      pointer-events: auto;
    }

    .miao-rhythm-start strong { display: block; font-size: 32px; line-height: 1; }
    .miao-rhythm-start p { margin: 10px 0 16px; color: #cfe4ff; font-family: "Arial Black", system-ui; font-size: 13px; line-height: 1.45; text-shadow: none; }
    .miao-rhythm-start button { width: 100%; height: 66px; border: 5px solid #070914; border-radius: 14px; background: linear-gradient(180deg, #ffe33b, #ffb000); color: #fff; box-shadow: 0 7px 0 #7a3b00; font-size: 32px; }
    .miao-rhythm-start.hidden { display: none; }

    .miao-rhythm-result { position: absolute; inset: 0; z-index: 22; display: none; place-items: center; background: linear-gradient(135deg, rgba(0,0,0,.86), rgba(0,43,122,.82)); pointer-events: auto; }
    .miao-rhythm-result.show { display: grid; }
    .miao-rhythm-result-card { width: min(520px, calc(100vw - 38px)); padding: 24px; border: 5px solid #070914; border-radius: 18px; background: linear-gradient(180deg, #118aff, #0736a5); box-shadow: 0 10px 0 #050711; transform: rotate(-1deg); }
    .miao-rhythm-result-card h2 { margin: 0 0 12px; font-size: 52px; line-height: .9; }
    .miao-rhythm-result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 16px 0; }
    .miao-rhythm-result-grid div { padding: 12px; border: 3px solid #070914; border-radius: 10px; background: rgba(255,255,255,.12); }
    .miao-rhythm-result-grid span { display: block; color: #cfe4ff; font-family: "Arial Black", system-ui; font-size: 12px; text-shadow: none; }
    .miao-rhythm-result-grid strong { display: block; font-size: 30px; }
    .miao-rhythm-result-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .miao-rhythm-result-actions button { height: 58px; border: 4px solid #070914; border-radius: 12px; background: linear-gradient(180deg, #ffe33b, #ffb000); color: #fff; box-shadow: 0 6px 0 #7a3b00; font-size: 24px; }

    @media (max-width: 760px), (orientation: portrait) {
      .miao-rhythm-hud { top: calc(env(safe-area-inset-top, 0px) + 54px); grid-template-columns: 1fr 1fr; }
      .miao-rhythm-judge { grid-column: 1 / -1; order: 3; min-width: 0; min-height: 44px; font-size: 24px; }
      .miao-rhythm-track { width: calc(100vw - 22px); height: 34vh; bottom: calc(env(safe-area-inset-bottom, 0px) + 8px); }
      .miao-rhythm-buttons { gap: 7px; }
      .miao-rhythm-btn { height: 66px; font-size: 20px; }
      .miao-rhythm-note { width: 48px; height: 48px; font-size: 19px; }
      .miao-rhythm-super { right: 18px; bottom: calc(env(safe-area-inset-bottom, 0px) + 96px); width: 82px; height: 82px; font-size: 34px; }
    }
  `;
  document.head.appendChild(style);
}

function createRoot(chart) {
  const root = document.createElement("div");
  root.className = "miao-rhythm-root";
  root.innerHTML = `
    <section class="miao-rhythm-hud">
      <div class="miao-rhythm-stat"><span>SCORE</span><strong data-rhythm-score>0</strong></div>
      <div class="miao-rhythm-judge" data-rhythm-judge>READY</div>
      <div class="miao-rhythm-stat"><span>COMBO</span><strong data-rhythm-combo>0</strong></div>
    </section>
    <section class="miao-rhythm-track" data-rhythm-track>
      ${chart.lanes.map(() => `<div class="miao-rhythm-lane"></div>`).join("")}
      <div data-rhythm-notes></div>
      <div class="miao-rhythm-buttons">
        ${chart.lanes.map((lane, index) => `<button class="miao-rhythm-btn" data-lane="${index}" style="--lane-color:${["#1fb6ff", "#9b35ff", "#20dc5b", "#ffd21f"][index]}">${lane}</button>`).join("")}
      </div>
    </section>
    <button class="miao-rhythm-super" type="button" data-rhythm-super style="--energy:0">☠</button>
    <section class="miao-rhythm-start" data-rhythm-start>
      <strong>${chart.title}</strong>
      <p>${chart.objective}<br>${chart.musicTip}</p>
      <button type="button" data-rhythm-start-btn>开始演奏</button>
    </section>
    <section class="miao-rhythm-result" data-rhythm-result>
      <div class="miao-rhythm-result-card">
        <h2 data-result-title>VICTORY</h2>
        <div class="miao-rhythm-result-grid">
          <div><span>SCORE</span><strong data-result-score>0</strong></div>
          <div><span>MAX COMBO</span><strong data-result-combo>0</strong></div>
          <div><span>HP</span><strong data-result-hp>100</strong></div>
          <div><span>REWARD</span><strong>+28</strong></div>
        </div>
        <div class="miao-rhythm-result-actions">
          <button type="button" data-rhythm-retry>再来</button>
          <button type="button" data-rhythm-close>退出</button>
        </div>
      </div>
    </section>
  `;
  return root;
}

function resultLabel(result) {
  return { perfect: "PERFECT!", great: "GREAT", good: "GOOD", bad: "BAD", miss: "MISS", super: "SUPER!" }[result] || result.toUpperCase();
}

export function mountRhythmBattle() {
  ensureStyle();
  const page = document.querySelector(".page");
  if (!page) return () => {};

  const chart = RHYTHM_CHARTS.tutorial;
  const root = createRoot(chart);
  page.appendChild(root);

  const refs = {
    score: root.querySelector("[data-rhythm-score]"),
    combo: root.querySelector("[data-rhythm-combo]"),
    judge: root.querySelector("[data-rhythm-judge]"),
    notes: root.querySelector("[data-rhythm-notes]"),
    super: root.querySelector("[data-rhythm-super]"),
    start: root.querySelector("[data-rhythm-start]"),
    result: root.querySelector("[data-rhythm-result]"),
    resultTitle: root.querySelector("[data-result-title]"),
    resultScore: root.querySelector("[data-result-score]"),
    resultCombo: root.querySelector("[data-result-combo]"),
    resultHp: root.querySelector("[data-result-hp]")
  };

  let judgeTimer = 0;

  const engine = createRhythmEngine({
    chart,
    onUpdate: (state) => {
      refs.score.textContent = Math.round(state.score);
      refs.combo.textContent = state.combo;
      refs.super.style.setProperty("--energy", state.energy);
      refs.super.classList.toggle("ready", state.energy >= 100);
      dispatchRhythmEvent("state", { score: state.score, combo: state.combo, energy: state.energy, hp: state.hp, elapsed: state.elapsed });

      const visible = state.notes.filter((note) => !note.hit && !note.missed && note.time - state.elapsed < 2.6 && note.time - state.elapsed > -0.36);
      refs.notes.innerHTML = visible.map((note) => {
        const delta = note.time - state.elapsed;
        const y = 28 + (delta / 2.6) * 72;
        const color = ["#1fb6ff", "#9b35ff", "#20dc5b", "#ffd21f"][note.lane];
        return `<div class="miao-rhythm-note ${note.type}" style="--lane:${note.lane};--y:${y};--note-color:${color}">${chart.lanes[note.lane]}</div>`;
      }).join("");
    },
    onJudge: ({ result, note, score, combo, energy, hp }) => {
      window.clearTimeout(judgeTimer);
      refs.judge.textContent = resultLabel(result);
      refs.judge.className = `miao-rhythm-judge show ${result}`;
      judgeTimer = window.setTimeout(() => refs.judge.classList.remove("show"), 360);
      dispatchRhythmEvent("judge", { result, lane: note?.lane ?? 1, score, combo, energy, hp });
    },
    onFinish: (state) => {
      refs.resultTitle.textContent = state.hp > 0 ? "VICTORY" : "DEFEAT";
      refs.resultScore.textContent = Math.round(state.score);
      refs.resultCombo.textContent = state.maxCombo;
      refs.resultHp.textContent = Math.round(state.hp);
      refs.result.classList.add("show");
      dispatchRhythmEvent("finish", { score: state.score, combo: state.maxCombo, hp: state.hp });
    }
  });

  const pressLane = (lane) => {
    const button = root.querySelector(`[data-lane="${lane}"]`);
    button?.classList.add("pressed");
    window.setTimeout(() => button?.classList.remove("pressed"), 120);
    engine.hitLane(lane);
  };

  root.addEventListener("pointerdown", (event) => {
    const laneButton = event.target.closest("[data-lane]");
    if (laneButton) pressLane(Number(laneButton.dataset.lane));
    if (event.target.closest("[data-rhythm-super]")) engine.useSuper();
    if (event.target.closest("[data-rhythm-start-btn]")) {
      refs.start.classList.add("hidden");
      refs.result.classList.remove("show");
      dispatchRhythmEvent("start", { chart: chart.id });
      engine.start();
    }
    if (event.target.closest("[data-rhythm-retry]")) {
      refs.result.classList.remove("show");
      dispatchRhythmEvent("start", { chart: chart.id });
      engine.start();
    }
    if (event.target.closest("[data-rhythm-close]")) {
      refs.result.classList.remove("show");
      refs.start.classList.remove("hidden");
      engine.stop();
      dispatchRhythmEvent("stop", {});
      page.classList.remove("brawl-play");
    }
  });

  const onKeyDown = (event) => {
    const map = { d: 0, f: 1, j: 2, k: 3, " ": "super" };
    if (!(event.key in map)) return;
    event.preventDefault();
    const value = map[event.key];
    if (value === "super") engine.useSuper();
    else pressLane(value);
  };
  window.addEventListener("keydown", onKeyDown);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    engine.stop();
    root.remove();
  };
}
