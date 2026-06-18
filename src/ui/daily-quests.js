import { DAILY_QUESTS, getDailyQuestProgress } from "../config/daily-quests.js";

const STYLE_ID = "miaosic-daily-quests-style";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .miaosic-quest-root {
      position: absolute;
      inset: 0;
      z-index: 42;
      pointer-events: none;
      font-family: "Trebuchet MS", "Avenir Next", system-ui, sans-serif;
    }

    .miaosic-quest-button {
      position: absolute;
      top: calc(env(safe-area-inset-top, 0px) + 18px);
      left: calc(env(safe-area-inset-left, 0px) + 230px);
      z-index: 46;
      min-width: 94px;
      min-height: 44px;
      padding: 9px 13px 10px 40px;
      border: 2px solid rgba(14, 28, 35, 0.74);
      border-radius: 999px;
      background:
        radial-gradient(circle at 22% 20%, rgba(255,255,255,0.82), transparent 34%),
        linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,242,166,0.68));
      color: #14242c;
      box-shadow:
        0 10px 24px rgba(5, 18, 28, 0.18),
        inset 0 -4px 0 rgba(20, 30, 36, 0.06);
      font-size: 12px;
      font-weight: 900;
      pointer-events: auto;
      backdrop-filter: blur(16px);
      -webkit-tap-highlight-color: transparent;
    }

    .miaosic-quest-button::before {
      content: "✓";
      position: absolute;
      left: 10px;
      top: 50%;
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: linear-gradient(180deg, #9be7a6, #61c978);
      box-shadow: inset 0 -3px 0 rgba(18, 30, 38, 0.09);
      transform: translateY(-50%);
    }

    .miaosic-quest-panel {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 49;
      width: min(720px, calc(100vw - 28px));
      max-height: min(620px, calc(100vh - 30px));
      display: grid;
      grid-template-rows: auto 1fr;
      border: 2px solid rgba(14, 27, 34, 0.78);
      border-radius: 34px;
      overflow: hidden;
      background:
        radial-gradient(circle at 18% 8%, rgba(255,255,255,0.76), transparent 24%),
        linear-gradient(180deg, rgba(255,253,247,0.96), rgba(231,247,255,0.92));
      box-shadow: 0 28px 80px rgba(3, 12, 18, 0.34);
      pointer-events: auto;
      opacity: 0;
      transform: translate(-50%, -47%) scale(0.94);
      transition: opacity 180ms ease, transform 240ms cubic-bezier(.2, 1.2, .3, 1);
      backdrop-filter: blur(24px);
    }

    .miaosic-quest-panel.show {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .miaosic-quest-panel[hidden] { display: none; }

    .miaosic-quest-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 20px 14px;
      border-bottom: 1px solid rgba(17, 31, 39, 0.1);
    }

    .miaosic-quest-head span {
      display: block;
      color: rgba(18, 32, 40, 0.54);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .miaosic-quest-head strong {
      display: block;
      margin-top: 4px;
      color: #13242c;
      font-size: clamp(22px, 3vw, 32px);
      font-weight: 1000;
      line-height: 0.95;
    }

    .miaosic-quest-close {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 2px solid rgba(15, 29, 36, 0.72);
      border-radius: 16px;
      background: #fff;
      color: #13242c;
      box-shadow: inset 0 -4px 0 rgba(20, 30, 36, 0.08);
      font-size: 20px;
      font-weight: 1000;
    }

    .miaosic-quest-list {
      display: grid;
      gap: 12px;
      padding: 16px 18px 20px;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }

    .miaosic-quest-item {
      position: relative;
      padding: 15px 15px 15px 58px;
      border-radius: 24px;
      border: 2px solid rgba(16, 31, 39, 0.12);
      background:
        radial-gradient(circle at 18% 16%, rgba(255,255,255,0.78), transparent 32%),
        linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.48));
      box-shadow:
        0 12px 28px rgba(10, 26, 36, 0.11),
        inset 0 1px 0 rgba(255,255,255,0.86);
    }

    .miaosic-quest-item::before {
      content: attr(data-status);
      position: absolute;
      left: 14px;
      top: 16px;
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: var(--quest-color, #ffd86f);
      box-shadow: inset 0 -4px 0 rgba(18, 31, 38, 0.08);
      font-size: 14px;
      font-weight: 1000;
    }

    .miaosic-quest-item strong {
      display: block;
      color: #13242c;
      font-size: 16px;
      font-weight: 1000;
      line-height: 1.05;
    }

    .miaosic-quest-item p {
      margin: 7px 0 0;
      color: rgba(18, 32, 40, 0.72);
      font-size: 12px;
      font-weight: 750;
      line-height: 1.42;
    }

    .miaosic-quest-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 9px;
    }

    .miaosic-quest-meta span {
      display: inline-flex;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(255,255,255,0.64);
      color: rgba(19, 34, 42, 0.62);
      font-size: 10px;
      font-weight: 900;
    }

    .miaosic-quest-bar {
      height: 10px;
      margin-top: 10px;
      padding: 2px;
      border-radius: 999px;
      background: rgba(19, 34, 42, 0.08);
      overflow: hidden;
    }

    .miaosic-quest-fill {
      width: calc(var(--progress, 0) * 100%);
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #62da8b, #ffe07a 68%, #ff9f84);
      transition: width 220ms ease;
    }

    @media (max-width: 760px), (orientation: portrait) {
      .miaosic-quest-button {
        top: calc(env(safe-area-inset-top, 0px) + 128px);
        left: 120px;
        min-width: 0;
        width: 46px;
        height: 46px;
        padding: 0;
        color: transparent;
        overflow: hidden;
      }

      .miaosic-quest-button::before {
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .miaosic-quest-panel {
        width: calc(100vw - 18px);
        max-height: calc(100vh - 22px);
        border-radius: 28px;
      }
    }
  `;
  document.head.appendChild(style);
}

function createRoot() {
  const root = document.createElement("div");
  root.className = "miaosic-quest-root";
  root.innerHTML = `
    <button class="miaosic-quest-button" type="button" data-quest-open>每日任务</button>
    <section class="miaosic-quest-panel" hidden data-quest-panel>
      <div class="miaosic-quest-head">
        <div>
          <span>Daily Training</span>
          <strong>今日音乐任务</strong>
        </div>
        <button class="miaosic-quest-close" type="button" data-quest-close>×</button>
      </div>
      <div class="miaosic-quest-list" data-quest-list></div>
    </section>
  `;
  return root;
}

function renderQuests(host, runtime) {
  const progress = getDailyQuestProgress(runtime.state);
  host.innerHTML = DAILY_QUESTS.map((quest) => {
    const value = progress[quest.id] || 0;
    const done = value >= 1;
    return `<article class="miaosic-quest-item" data-status="${done ? "✓" : "♪"}" style="--quest-color:${done ? "#7fe19e" : "#ffd86f"};--progress:${value}">
      <strong>${quest.title}</strong>
      <p>${quest.target}</p>
      <div class="miaosic-quest-meta">
        <span>${quest.reward}</span>
        <span>${done ? "已完成" : "进行中"}</span>
      </div>
      <p>${quest.learning}</p>
      <div class="miaosic-quest-bar"><div class="miaosic-quest-fill"></div></div>
    </article>`;
  }).join("");
}

export function mountDailyQuests(runtime) {
  ensureStyle();
  const page = document.querySelector(".page");
  if (!page) return () => {};

  const root = createRoot();
  page.appendChild(root);

  const panel = root.querySelector("[data-quest-panel]");
  const list = root.querySelector("[data-quest-list]");

  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-quest-open]")) {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add("show"));
    }
    if (event.target.closest("[data-quest-close]")) {
      panel.classList.remove("show");
      window.setTimeout(() => { panel.hidden = true; }, 180);
    }
  });

  let rafId = 0;
  let lastSnapshot = "";
  const update = () => {
    const snapshot = [runtime.state.stage, runtime.state.learned.length, runtime.state.combo, runtime.state.heardTarget].join("|");
    if (snapshot !== lastSnapshot) {
      lastSnapshot = snapshot;
      renderQuests(list, runtime);
    }
    rafId = requestAnimationFrame(update);
  };

  rafId = requestAnimationFrame(update);

  return () => {
    cancelAnimationFrame(rafId);
    root.remove();
  };
}
