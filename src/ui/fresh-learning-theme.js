const STYLE_ID = "miaosic-fresh-learning-theme";

export function mountFreshLearningTheme() {
  if (document.getElementById(STYLE_ID)) return () => {};

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --fresh-sky: #dff7ff;
      --fresh-blue: #49b8ff;
      --fresh-green: #7ed957;
      --fresh-yellow: #ffd447;
      --fresh-purple: #b78cff;
      --fresh-ink: #17334a;
      --fresh-panel: rgba(255,255,255,.86);
      --fresh-stroke: #17334a;
    }

    body {
      background: linear-gradient(180deg, #f8fdff, #dff7ff) !important;
    }

    .page.royale-shell,
    .page {
      background:
        radial-gradient(circle at 22% 14%, rgba(255,255,255,.98), transparent 22%),
        radial-gradient(circle at 78% 20%, rgba(255,244,184,.78), transparent 20%),
        radial-gradient(circle at 50% 88%, rgba(126,217,87,.24), transparent 34%),
        linear-gradient(180deg, #e9fbff 0%, #bfefff 52%, #eafbd6 100%) !important;
    }

    .page::after {
      background:
        linear-gradient(90deg, rgba(255,255,255,.25), transparent 24%, transparent 76%, rgba(255,255,255,.25)),
        radial-gradient(circle at 50% 50%, transparent 0 48%, rgba(73,184,255,.12) 100%) !important;
      mix-blend-mode: normal !important;
    }

    .miao-logo {
      color: #ffffff !important;
      text-shadow: 0 4px 0 var(--fresh-stroke), 2px 0 0 var(--fresh-stroke), -2px 0 0 var(--fresh-stroke), 0 -2px 0 var(--fresh-stroke) !important;
    }

    .miao-logo span {
      color: #24a9ff !important;
    }

    .miao-currency,
    .miao-side-btn,
    .miao-chest,
    .miao-event,
    .miao-rhythm-stat,
    .miao-rhythm-start,
    .miao-rhythm-result-card {
      background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(219,246,255,.9)) !important;
      color: var(--fresh-ink) !important;
      text-shadow: none !important;
      border-color: var(--fresh-stroke) !important;
      box-shadow: 0 5px 0 rgba(23,51,74,.22), 0 14px 26px rgba(73,184,255,.16) !important;
    }

    .miao-currency b,
    .miao-side-btn,
    .miao-chest strong,
    .miao-event strong,
    .miao-rhythm-stat strong,
    .miao-rhythm-start strong,
    .miao-rhythm-result-card h2 {
      color: var(--fresh-ink) !important;
      text-shadow: none !important;
    }

    .miao-chest span,
    .miao-event span,
    .miao-rhythm-stat span,
    .miao-rhythm-start p,
    .miao-rhythm-result-grid span {
      color: rgba(23,51,74,.72) !important;
    }

    .miao-side-btn i,
    .miao-event::before {
      background: linear-gradient(180deg, #ffffff, #bff2ff) !important;
    }

    .miao-hero-glow {
      background: radial-gradient(circle, rgba(255,255,255,.9), rgba(73,184,255,.32) 44%, transparent 70%) !important;
    }

    .miao-play,
    .miao-rhythm-start button,
    .miao-rhythm-result-actions button {
      background: linear-gradient(180deg, #fff172, #ffd447) !important;
      color: var(--fresh-ink) !important;
      text-shadow: none !important;
      border-color: var(--fresh-stroke) !important;
      box-shadow: 0 7px 0 rgba(168,121,0,.35), 0 14px 24px rgba(255,212,71,.24) !important;
    }

    .miao-rhythm-root {
      color: var(--fresh-ink) !important;
      text-shadow: none !important;
    }

    .miao-rhythm-track::before {
      background: #ffffff !important;
      border-color: var(--fresh-stroke) !important;
      box-shadow: 0 0 22px rgba(73,184,255,.45), 0 5px 0 rgba(23,51,74,.16) !important;
    }

    .miao-rhythm-lane {
      background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.48) 68%, rgba(255,255,255,.26)) !important;
    }

    .miao-rhythm-note,
    .miao-rhythm-btn,
    .miao-rhythm-super {
      border-color: var(--fresh-stroke) !important;
      text-shadow: none !important;
      box-shadow: 0 7px 0 rgba(23,51,74,.24), inset 0 -6px 0 rgba(23,51,74,.12) !important;
    }

    .miao-rhythm-judge {
      color: var(--fresh-ink) !important;
      background: linear-gradient(180deg, #ffffff, #fff0a6) !important;
      border-color: var(--fresh-stroke) !important;
      text-shadow: none !important;
      box-shadow: 0 6px 0 rgba(168,121,0,.28) !important;
    }

    .miao-rhythm-judge.bad,
    .miao-rhythm-judge.miss {
      color: #fff !important;
      background: linear-gradient(180deg, #ff8894, #f23a4a) !important;
      text-shadow: 0 2px 0 rgba(0,0,0,.2) !important;
    }

    .miao-rhythm-judge.super {
      color: #fff !important;
      background: linear-gradient(180deg, #b78cff, #7b4dff) !important;
      text-shadow: 0 2px 0 rgba(0,0,0,.2) !important;
    }
  `;

  document.head.appendChild(style);
  return () => style.remove();
}
