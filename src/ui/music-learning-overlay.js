import { getNoteKnowledge, LEARNING_GOALS } from "../config/music-knowledge.js";

const STYLE_ID = "miaosic-music-learning-overlay-style";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .miao-learn-root {
      position: absolute;
      inset: 0;
      z-index: 86;
      pointer-events: none;
      font-family: "Arial Black", "Trebuchet MS", system-ui, sans-serif;
      color: #17334a;
    }

    .miao-learn-card {
      position: absolute;
      left: calc(env(safe-area-inset-left, 0px) + 18px);
      top: calc(env(safe-area-inset-top, 0px) + 142px);
      width: min(320px, calc(100vw - 36px));
      padding: 14px 16px;
      border: 4px solid #17334a;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(224,248,255,.92));
      box-shadow: 0 7px 0 rgba(23,51,74,.22), 0 18px 34px rgba(73,184,255,.18);
      opacity: 0;
      transform: translateY(-8px) scale(.96);
      transition: opacity 140ms ease, transform 180ms cubic-bezier(.2, 1.5, .3, 1);
    }

    .page.brawl-play .miao-learn-card.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .miao-learn-card small {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 9px;
      border-radius: 999px;
      background: var(--learn-color, #49b8ff);
      color: #fff;
      font-size: 11px;
      text-shadow: 0 1px 0 rgba(0,0,0,.18);
    }

    .miao-learn-card strong {
      display: block;
      margin-top: 8px;
      font-size: 24px;
      line-height: 1;
    }

    .miao-learn-card p {
      margin: 8px 0 0;
      color: rgba(23,51,74,.78);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      font-weight: 800;
      line-height: 1.38;
    }

    .miao-goals {
      position: absolute;
      right: calc(env(safe-area-inset-right, 0px) + 18px);
      top: calc(env(safe-area-inset-top, 0px) + 142px);
      width: min(330px, calc(100vw - 36px));
      padding: 14px 16px;
      border: 4px solid #17334a;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255,255,255,.94), rgba(234,251,214,.92));
      box-shadow: 0 7px 0 rgba(23,51,74,.2), 0 18px 34px rgba(126,217,87,.16);
    }

    .miao-goals h3 {
      margin: 0 0 8px;
      font-size: 18px;
      line-height: 1;
    }

    .miao-goals ol {
      margin: 0;
      padding-left: 18px;
      color: rgba(23,51,74,.78);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.45;
    }

    .miao-result-learning {
      display: grid;
      gap: 7px;
      margin-top: 12px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-weight: 900;
      color: rgba(23,51,74,.82);
      text-shadow: none;
    }

    .miao-result-learning span {
      padding: 8px 10px;
      border-radius: 12px;
      background: rgba(255,255,255,.48);
      border: 2px solid rgba(23,51,74,.16);
    }

    @media (max-width: 760px), (orientation: portrait) {
      .miao-learn-card {
        top: calc(env(safe-area-inset-top, 0px) + 164px);
        left: 10px;
        width: calc(100vw - 20px);
      }
      .miao-goals { display: none; }
    }
  `;
  document.head.appendChild(style);
}

function noteFromLane(lane) {
  return ["C", "D", "E", "G"][Math.max(0, Math.min(3, Number(lane) || 0))];
}

export function mountMusicLearningOverlay() {
  ensureStyle();
  const page = document.querySelector(".page");
  if (!page) return () => {};

  const root = document.createElement("div");
  root.className = "miao-learn-root";
  root.innerHTML = `
    <section class="miao-learn-card" data-learn-card>
      <small data-learn-kicker>音乐知识</small>
      <strong data-learn-title>C = Do</strong>
      <p data-learn-copy>按下音符时，这里会告诉你它在旋律里的作用。</p>
    </section>
    <section class="miao-goals">
      <h3>本关真正要学会</h3>
      <ol>${LEARNING_GOALS.map((goal) => `<li>${goal}</li>`).join("")}</ol>
    </section>
  `;
  page.appendChild(root);

  const card = root.querySelector("[data-learn-card]");
  const kicker = root.querySelector("[data-learn-kicker]");
  const title = root.querySelector("[data-learn-title]");
  const copy = root.querySelector("[data-learn-copy]");
  let hideTimer = 0;

  const showNote = (lane, result = "good") => {
    const note = noteFromLane(lane);
    const info = getNoteKnowledge(note);
    card.style.setProperty("--learn-color", info.color);
    kicker.textContent = `${note} = ${info.solfege} · ${result.toUpperCase()}`;
    title.textContent = info.role;
    copy.textContent = `${info.relation} ${info.tip}`;
    card.classList.add("show");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => card.classList.remove("show"), 2600);
  };

  const onJudge = (event) => {
    const { lane = 0, result = "good" } = event.detail || {};
    if (result === "miss" || result === "bad") return;
    showNote(lane, result);
  };

  const onFinish = () => {
    const resultCard = document.querySelector(".miao-rhythm-result-card");
    if (!resultCard || resultCard.querySelector(".miao-result-learning")) return;
    const block = document.createElement("div");
    block.className = "miao-result-learning";
    block.innerHTML = `
      <span>本局学习：C 是 Do，旋律里的稳定落点。</span>
      <span>本局学习：D 向前，E 明亮，G 有起飞感。</span>
      <span>下一步目标：不要只看按钮颜色，开始记住每个音的听感。</span>
    `;
    resultCard.appendChild(block);
  };

  window.addEventListener("miaosic:rhythm-judge", onJudge);
  window.addEventListener("miaosic:rhythm-finish", onFinish);

  return () => {
    window.removeEventListener("miaosic:rhythm-judge", onJudge);
    window.removeEventListener("miaosic:rhythm-finish", onFinish);
    window.clearTimeout(hideTimer);
    root.remove();
  };
}
