import { STAGES } from "../config/stages.js";
import { WORLD_REGIONS, getRegionProgress } from "../config/world-map.js";
import { getUnlockedCats } from "../config/cat-roster.js";

const STYLE_ID = "miaosic-vision-upgrade-style";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .miaosic-vision-root {
      position: absolute;
      inset: 0;
      z-index: 43;
      pointer-events: none;
      font-family: "Trebuchet MS", "Avenir Next", system-ui, sans-serif;
    }

    .miaosic-vision-root button {
      pointer-events: auto;
      -webkit-tap-highlight-color: transparent;
    }

    .miaosic-map-button,
    .miaosic-cats-button {
      position: absolute;
      top: calc(env(safe-area-inset-top, 0px) + 18px);
      z-index: 46;
      min-width: 92px;
      min-height: 44px;
      padding: 9px 13px 10px 40px;
      border: 2px solid rgba(14, 28, 35, 0.74);
      border-radius: 999px;
      background:
        radial-gradient(circle at 22% 20%, rgba(255,255,255,0.82), transparent 34%),
        linear-gradient(180deg, rgba(255,255,255,0.86), rgba(223,248,255,0.68));
      color: #14242c;
      box-shadow:
        0 10px 24px rgba(5, 18, 28, 0.18),
        inset 0 -4px 0 rgba(20, 30, 36, 0.06);
      font-size: 12px;
      font-weight: 900;
      backdrop-filter: blur(16px);
    }

    .miaosic-map-button::before,
    .miaosic-cats-button::before {
      position: absolute;
      left: 10px;
      top: 50%;
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: linear-gradient(180deg, #ffeaa6, #ffd26c);
      box-shadow: inset 0 -3px 0 rgba(18, 30, 38, 0.09);
      transform: translateY(-50%);
    }

    .miaosic-map-button {
      left: calc(env(safe-area-inset-left, 0px) + 20px);
    }

    .miaosic-map-button::before { content: "🗺"; }

    .miaosic-cats-button {
      left: calc(env(safe-area-inset-left, 0px) + 122px);
    }

    .miaosic-cats-button::before { content: "🐱"; }

    .miaosic-panel {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 48;
      width: min(940px, calc(100vw - 28px));
      max-height: min(680px, calc(100vh - 30px));
      display: grid;
      grid-template-rows: auto 1fr;
      border: 2px solid rgba(14, 27, 34, 0.78);
      border-radius: 34px;
      overflow: hidden;
      background:
        radial-gradient(circle at 18% 8%, rgba(255,255,255,0.7), transparent 24%),
        radial-gradient(circle at 84% 12%, rgba(255,216,111,0.28), transparent 22%),
        linear-gradient(180deg, rgba(245,252,255,0.96), rgba(224,244,255,0.92));
      box-shadow:
        0 28px 80px rgba(3, 12, 18, 0.34),
        inset 0 1px 0 rgba(255,255,255,0.88);
      backdrop-filter: blur(24px);
      pointer-events: auto;
      opacity: 0;
      transform: translate(-50%, -47%) scale(0.94);
      transition: opacity 180ms ease, transform 240ms cubic-bezier(.2, 1.2, .3, 1);
    }

    .miaosic-panel.show {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .miaosic-panel[hidden] { display: none; }

    .miaosic-panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 20px 14px;
      border-bottom: 1px solid rgba(17, 31, 39, 0.1);
    }

    .miaosic-panel-kicker {
      display: block;
      color: rgba(18, 32, 40, 0.54);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .miaosic-panel-title {
      display: block;
      margin-top: 4px;
      color: #13242c;
      font-size: clamp(22px, 3vw, 34px);
      font-weight: 1000;
      line-height: 0.95;
    }

    .miaosic-panel-close {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      padding: 0;
      border-radius: 16px;
      border: 2px solid rgba(15, 29, 36, 0.72);
      background: #fff;
      box-shadow: inset 0 -4px 0 rgba(20, 30, 36, 0.08);
      color: #13242c;
      font-size: 20px;
      font-weight: 1000;
    }

    .miaosic-panel-body {
      overflow: auto;
      padding: 16px 18px 20px;
      -webkit-overflow-scrolling: touch;
    }

    .miaosic-region-grid,
    .miaosic-cat-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .miaosic-region,
    .miaosic-cat-card {
      min-height: 168px;
      position: relative;
      padding: 15px;
      border-radius: 24px;
      border: 2px solid rgba(16, 31, 39, 0.12);
      background:
        radial-gradient(circle at 18% 16%, rgba(255,255,255,0.78), transparent 32%),
        linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,255,255,0.42));
      box-shadow:
        0 12px 28px rgba(10, 26, 36, 0.11),
        inset 0 1px 0 rgba(255,255,255,0.86);
      overflow: hidden;
    }

    .miaosic-region.locked,
    .miaosic-cat-card.locked {
      filter: saturate(0.28);
      opacity: 0.52;
    }

    .miaosic-region::before,
    .miaosic-cat-card::before {
      content: "";
      position: absolute;
      inset: auto -26px -42px auto;
      width: 116px;
      height: 116px;
      border-radius: 50%;
      background: var(--accent, #ffd86f);
      opacity: 0.32;
    }

    .miaosic-region-emoji,
    .miaosic-cat-emoji {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 18px;
      background: var(--accent, #ffd86f);
      border: 2px solid rgba(18, 31, 38, 0.14);
      box-shadow: inset 0 -5px 0 rgba(18, 31, 38, 0.08);
      font-size: 24px;
    }

    .miaosic-region strong,
    .miaosic-cat-card strong {
      display: block;
      margin-top: 10px;
      color: #13242c;
      font-size: 17px;
      font-weight: 1000;
      line-height: 1.05;
    }

    .miaosic-region span,
    .miaosic-cat-card span {
      display: inline-flex;
      margin-top: 7px;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(255,255,255,0.58);
      color: rgba(19, 34, 42, 0.62);
      font-size: 10px;
      font-weight: 900;
    }

    .miaosic-region p,
    .miaosic-cat-card p {
      margin: 9px 0 0;
      color: rgba(18, 32, 40, 0.74);
      font-size: 12px;
      font-weight: 750;
      line-height: 1.42;
    }

    .miaosic-region small,
    .miaosic-cat-card small {
      display: block;
      margin-top: 10px;
      color: rgba(19, 34, 42, 0.52);
      font-size: 10px;
      font-weight: 900;
      line-height: 1.3;
    }

    .miaosic-learning-strip {
      position: absolute;
      left: 50%;
      bottom: calc(env(safe-area-inset-bottom, 0px) + 184px);
      z-index: 44;
      width: min(620px, calc(100vw - 28px));
      padding: 12px 16px 13px 54px;
      border: 2px solid rgba(12, 27, 34, 0.34);
      border-radius: 24px;
      background:
        radial-gradient(circle at 16% 20%, rgba(255,255,255,0.8), transparent 34%),
        linear-gradient(180deg, rgba(18,34,43,0.86), rgba(9,22,29,0.82));
      box-shadow: 0 18px 42px rgba(4, 12, 18, 0.26);
      color: #f6fbff;
      pointer-events: none;
      transform: translateX(-50%);
      backdrop-filter: blur(18px);
    }

    .miaosic-learning-strip::before {
      content: "🎓";
      position: absolute;
      left: 14px;
      top: 50%;
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: linear-gradient(180deg, #ffeaa6, #ffd26c);
      transform: translateY(-50%);
    }

    .miaosic-learning-strip strong {
      display: block;
      font-size: 12px;
      font-weight: 1000;
      line-height: 1.1;
    }

    .miaosic-learning-strip span {
      display: block;
      margin-top: 3px;
      color: rgba(246,251,255,0.68);
      font-size: 10px;
      font-weight: 800;
      line-height: 1.24;
    }

    @media (max-width: 760px), (orientation: portrait) {
      .miaosic-map-button,
      .miaosic-cats-button {
        top: calc(env(safe-area-inset-top, 0px) + 128px);
        min-width: 0;
        width: 46px;
        height: 46px;
        padding: 0;
        color: transparent;
        overflow: hidden;
      }

      .miaosic-map-button { left: 12px; }
      .miaosic-cats-button { left: 66px; }

      .miaosic-map-button::before,
      .miaosic-cats-button::before {
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .miaosic-panel {
        width: calc(100vw - 18px);
        max-height: calc(100vh - 22px);
        border-radius: 28px;
      }

      .miaosic-region-grid,
      .miaosic-cat-grid {
        grid-template-columns: 1fr;
      }

      .miaosic-learning-strip {
        bottom: calc(env(safe-area-inset-bottom, 0px) + 246px);
        width: calc(100vw - 24px);
      }
    }
  `;
  document.head.appendChild(style);
}

function panelTemplate(kind) {
  return `
    <section class="miaosic-panel" data-panel="${kind}" hidden>
      <div class="miaosic-panel-head">
        <div>
          <span class="miaosic-panel-kicker">${kind === "map" ? "World Map" : "Cat Album"}</span>
          <strong class="miaosic-panel-title">${kind === "map" ? "音乐王国地图" : "音符猫图鉴"}</strong>
        </div>
        <button class="miaosic-panel-close" data-close="${kind}" type="button">×</button>
      </div>
      <div class="miaosic-panel-body" data-panel-body="${kind}"></div>
    </section>
  `;
}

function createRoot() {
  const root = document.createElement("div");
  root.className = "miaosic-vision-root";
  root.innerHTML = `
    <button class="miaosic-map-button" type="button" data-open="map">世界地图</button>
    <button class="miaosic-cats-button" type="button" data-open="cats">猫咪图鉴</button>
    <aside class="miaosic-learning-strip" aria-live="polite">
      <strong data-strip-title>音乐知识正在加载</strong>
      <span data-strip-copy>听音、判断、投喂，每一步都在训练耳朵。</span>
    </aside>
    ${panelTemplate("map")}
    ${panelTemplate("cats")}
  `;
  return root;
}

function renderMap(host, runtime) {
  const unlocked = getRegionProgress(runtime.state.stage, runtime.state.learned.length);
  host.innerHTML = `<div class="miaosic-region-grid">
    ${WORLD_REGIONS.map((region, index) => {
      const isUnlocked = index < unlocked;
      return `<article class="miaosic-region ${isUnlocked ? "" : "locked"}" style="--accent:${region.color}">
        <div class="miaosic-region-emoji">${region.emoji}</div>
        <strong>${region.name}<br>${region.title}</strong>
        <span>${isUnlocked ? "已解锁" : region.unlock}</span>
        <p>${region.lesson}</p>
        <small>玩法：${region.mechanic}<br>奖励：${region.reward}</small>
      </article>`;
    }).join("")}
  </div>`;
}

function renderCats(host, runtime) {
  const unlocked = getUnlockedCats(runtime.state.stage, runtime.state.learned.length);
  const unlockedIds = new Set(unlocked.map((cat) => cat.id));
  const cats = getUnlockedCats("chord3", 99);
  host.innerHTML = `<div class="miaosic-cat-grid">
    ${cats.map((cat) => {
      const isUnlocked = unlockedIds.has(cat.id);
      return `<article class="miaosic-cat-card ${isUnlocked ? "" : "locked"}" style="--accent:${cat.color}">
        <div class="miaosic-cat-emoji">${isUnlocked ? cat.emoji : "?"}</div>
        <strong>${isUnlocked ? cat.title : "未发现猫咪"}<br>${isUnlocked ? cat.name : "???"}</strong>
        <span>${isUnlocked ? `${cat.rarity} · ${cat.note}` : "继续训练解锁"}</span>
        <p>${isUnlocked ? cat.personality : "它还藏在音乐王国后面的章节里。"}</p>
        <small>${isUnlocked ? `技能：${cat.skill}<br>学习：${cat.learningTip}` : "收集音卡后会加入图鉴。"}</small>
      </article>`;
    }).join("")}
  </div>`;
}

export function mountVisionUpgrade(runtime) {
  ensureStyle();
  const page = document.querySelector(".page");
  if (!page) return () => {};

  const root = createRoot();
  page.appendChild(root);

  const mapPanel = root.querySelector('[data-panel="map"]');
  const catsPanel = root.querySelector('[data-panel="cats"]');
  const mapBody = root.querySelector('[data-panel-body="map"]');
  const catsBody = root.querySelector('[data-panel-body="cats"]');
  const stripTitle = root.querySelector("[data-strip-title]");
  const stripCopy = root.querySelector("[data-strip-copy]");

  const openPanel = (kind) => {
    const panel = kind === "map" ? mapPanel : catsPanel;
    const other = kind === "map" ? catsPanel : mapPanel;
    other.classList.remove("show");
    other.hidden = true;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("show"));
  };

  const closePanel = (kind) => {
    const panel = kind === "map" ? mapPanel : catsPanel;
    panel.classList.remove("show");
    window.setTimeout(() => { panel.hidden = true; }, 180);
  };

  root.addEventListener("click", (event) => {
    const open = event.target.closest("[data-open]");
    const close = event.target.closest("[data-close]");
    if (open) openPanel(open.dataset.open);
    if (close) closePanel(close.dataset.close);
  });

  let rafId = 0;
  let lastSnapshot = "";
  let cardIndex = 0;

  const update = () => {
    const stage = STAGES[runtime.state.stage] || STAGES.note3;
    const cards = stage.theoryCards || [stage.memoryHint];
    const snapshot = [runtime.state.stage, runtime.state.learned.length, runtime.state.round, runtime.state.combo].join("|");
    if (snapshot !== lastSnapshot) {
      lastSnapshot = snapshot;
      cardIndex = (runtime.state.round + runtime.state.learned.length) % cards.length;
      stripTitle.textContent = stage.playerPromise || stage.lesson;
      stripCopy.textContent = cards[cardIndex];
      renderMap(mapBody, runtime);
      renderCats(catsBody, runtime);
    }
    rafId = requestAnimationFrame(update);
  };

  rafId = requestAnimationFrame(update);

  return () => {
    cancelAnimationFrame(rafId);
    root.remove();
  };
}
