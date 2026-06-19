import * as THREE from "three";
import { createGameScene } from "./scene/world.js";
import { setupNativeBridge } from "./native/capacitor-bridge.js";
import { mountGameShell } from "./ui/game-shell.js";
import { mountVisionUpgrade } from "./ui/vision-upgrade.js";
import { mountDailyQuests } from "./ui/daily-quests.js";
import { mountBrawlRestyle } from "./ui/brawl-restyle.js";
import { mountBrawlCleanup } from "./ui/brawl-cleanup.js";
import { mountRhythmBattle } from "./ui/rhythm-battle.js";

const runtime = createGameScene({ THREE });
setupNativeBridge(runtime);
mountGameShell(runtime);
mountVisionUpgrade(runtime);
mountDailyQuests(runtime);
mountBrawlRestyle(runtime);
mountBrawlCleanup();
mountRhythmBattle();
