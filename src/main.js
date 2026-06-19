import { createGameRuntime } from "./systems/game-runtime.js";
import { mountBrawlRestyle } from "./ui/brawl-restyle.js";
import { mountBrawlCleanup } from "./ui/brawl-cleanup.js";
import { mountFreshLearningTheme } from "./ui/fresh-learning-theme.js";
import { mountMusicLearningOverlay } from "./ui/music-learning-overlay.js";
import { mountRhythmBattle } from "./ui/rhythm-battle.js";
import { mountRhythmArena3D } from "./scene/rhythm-arena-3d.js";

document.title = "Miaosic";
document.documentElement.dataset.app = "miaosic";

const runtime = createGameRuntime();

mountBrawlRestyle(runtime);
mountBrawlCleanup();
mountFreshLearningTheme();
mountRhythmArena3D();
mountRhythmBattle();
mountMusicLearningOverlay();
