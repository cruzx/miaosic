const STYLE_ID = "miaosic-brawl-cleanup-style";

export function mountBrawlCleanup() {
  if (document.getElementById(STYLE_ID)) return () => {};

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .miaosic-vision-root,
    .miaosic-quest-root {
      display: none !important;
    }

    .tabs,
    .controls,
    .feedback,
    .learned,
    .mission,
    .coach,
    .hint,
    .lesson-bar,
    .quest-ribbon,
    .gesture-guide,
    .reward-card,
    .round-banner,
    .toast,
    .feed-target {
      display: none !important;
    }

    .page.brawl-play .tabs,
    .page.brawl-play .controls {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  return () => style.remove();
}
