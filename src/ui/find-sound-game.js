import { playError, playSoundToken, playSuccess } from "../audio/sound-engine.js";

const STYLE_ID = "miaosic-find-sound-style";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .find-sound {
      position: absolute;
      inset: 0;
      z-index: 20;
      pointer-events: none;
      display: grid;
      align-items: end;
      padding: 0 18px calc(env(safe-area-inset-bottom, 0px) + 160px);
      color: #17334a;
    }
    .find-sound__panel {
      pointer-events: auto;
      border: 4px solid #17334a;
      border-radius: 28px;
      background:
        radial-gradient(circle at 18% 16%, rgba(255,255,255,.98), transparent 34%),
        linear-gradient(180deg, rgba(255,255,255,.92), rgba(234,251,214,.9));
      box-shadow: 0 10px 0 rgba(23,51,74,.18), 0 24px 44px rgba(23,51,74,.12);
      backdrop-filter: blur(18px);
      padding: 15px;
    }
    .find-sound__headline {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
      margin-bottom: 12px;
    }
    .find-sound__headline strong {
      display: block;
      margin-top: 4px;
      font-size: 22px;
      line-height: 1;
      letter-spacing: -.04em;
    }
    .find-sound__listen {
      border: 3px solid #17334a;
      border-radius: 18px;
      background: #17334a;
      color: #fff;
      font-size: 14px;
      font-weight: 950;
      padding: 11px 13px;
      box-shadow: 0 5px 0 rgba(23,51,74,.22);
    }
    .find-sound__choices {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .find-sound__choice {
      min-height: 76px;
      border: 3px solid #17334a;
      border-radius: 20px;
      background: rgba(255,255,255,.74);
      color: #17334a;
      box-shadow: 0 6px 0 rgba(23,51,74,.16);
      font-weight: 950;
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 8px;
      padding: 10px;
      text-align: left;
    }
    .find-sound__choice b { font-size: 28px; line-height: 1; }
    .find-sound__choice span { display: block; font-size: 13px; }
    .find-sound__choice small { display: block; margin-top: 2px; font-size: 10px; color: rgba(23,51,74,.58); }
    .find-sound__choice.is-correct { background: rgba(126,217,87,.32); outline: 4px solid #7ed957; }
    .find-sound__choice.is-wrong { background: rgba(255,112,112,.24); outline: 4px solid #ff7070; }
    .find-sound__feedback {
      min-height: 40px;
      margin-top: 12px;
      border-radius: 16px;
      background: rgba(255,255,255,.58);
      padding: 9px 11px;
      font-size: 12px;
      line-height: 1.35;
      font-weight: 850;
      color: rgba(23,51,74,.76);
    }
    .find-sound__next {
      width: 100%;
      margin-top: 10px;
      border: 3px solid #17334a;
      border-radius: 18px;
      background: #ffd447;
      color: #17334a;
      padding: 12px 14px;
      font-size: 15px;
      font-weight: 1000;
      box-shadow: 0 6px 0 rgba(23,51,74,.18);
    }
    @media (min-width: 720px) {
      .find-sound { padding-left: calc(50vw - 210px); padding-right: calc(50vw - 210px); }
    }
  `;
  document.head.appendChild(style);
}

export function mountFindSoundGame(runtime) {
  ensureStyle();
  const page = document.querySelector(".page");
  if (!page) return () => {};

  const root = document.createElement("section");
  root.className = "find-sound";
  page.appendChild(root);

  let selectedId = "";
  let feedback = "先听目标声音，再从 4 个声音地点里找到它。";

  const listenTarget = async () => {
    const target = runtime.getSound(runtime.state.round.targetId);
    runtime.playTarget();
    feedback = `正在播放：${target.name}。记住它的音色，不要被名字骗了。`;
    render();
    await playSoundToken(target, { volume: 0.24, duration: 0.82 });
  };

  const choose = async (id) => {
    if (runtime.state.round.answered) return;
    selectedId = id;
    const correct = runtime.chooseSound(id);
    const picked = runtime.getSound(id);
    const target = runtime.getSound(runtime.state.round.targetId);
    if (correct) {
      feedback = `命中：${target.copy}`;
      await playSuccess();
    } else {
      feedback = `不是「${picked.name}」。目标其实是「${target.name}」：${target.copy}`;
      await playError();
    }
    render();
  };

  const next = () => {
    selectedId = "";
    feedback = "新一轮开始。先听声音，再判断它属于哪座声音地点。";
    runtime.nextRound();
    render();
  };

  const render = () => {
    const { state } = runtime;
    const target = runtime.getSound(state.round.targetId);
    root.innerHTML = `
      <div class="find-sound__panel">
        <div class="find-sound__headline">
          <div>
            <small>Round ${state.round.index} · 找声音</small>
            <strong>找到「${target.name}」</strong>
          </div>
          <button class="find-sound__listen" type="button" data-action="listen">试听</button>
        </div>
        <div class="find-sound__choices">
          ${state.round.choices.map((id) => {
            const sound = runtime.getSound(id);
            const isAnswered = state.round.answered;
            const className = [
              "find-sound__choice",
              isAnswered && id === state.round.targetId ? "is-correct" : "",
              isAnswered && id === selectedId && id !== state.round.targetId ? "is-wrong" : ""
            ].filter(Boolean).join(" ");
            return `
              <button class="${className}" type="button" data-choice="${sound.id}">
                <b>${sound.emoji}</b>
                <span>${sound.name}<small>${sound.role}</small></span>
              </button>
            `;
          }).join("")}
        </div>
        <div class="find-sound__feedback">${feedback}</div>
        ${state.round.answered ? `<button class="find-sound__next" type="button" data-action="next">下一轮登岛</button>` : ""}
      </div>
    `;
  };

  const onClick = (event) => {
    const listenButton = event.target.closest('[data-action="listen"]');
    const nextButton = event.target.closest('[data-action="next"]');
    const choiceButton = event.target.closest("[data-choice]");
    if (listenButton) listenTarget();
    if (nextButton) next();
    if (choiceButton) choose(choiceButton.dataset.choice);
  };

  root.addEventListener("click", onClick);
  const unsubscribe = runtime.subscribe(render);
  render();

  return () => {
    unsubscribe();
    root.removeEventListener("click", onClick);
    root.remove();
  };
}
