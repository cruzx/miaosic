import * as THREE from "three";
import { createGameScene } from "./scene/world.js";
import { setupNativeBridge } from "./native/capacitor-bridge.js";
import { mountGameShell } from "./ui/game-shell.js";

const runtime = createGameScene({ THREE });
setupNativeBridge(runtime);
mountGameShell(runtime);
