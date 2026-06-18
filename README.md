# Miaosic: Kingdom of Sound

Miaosic is being upgraded from a Three.js ear-training prototype into a mobile-first music adventure game.

The product direction: a collectible cat adventure where players learn pitch, melody, and chord knowledge through play.

## Current playable loop

1. Listen to the cat food target sound.
2. Rotate the 3D world and test cats.
3. Drag the matching cat to feed it.
4. Earn music cards and unlock learning progress.
5. Use the world map and cat album to understand long-term progression.

## Game pillars

- Three.js 3D world: floating music kingdom with cats, food bowl, effects, and touch interaction.
- Music learning engine: pitch recognition, five-note training, and chord color learning.
- Collectible cat roster: each cat maps to a note or chord concept, personality, skill, and learning tip.
- World map progression: regions unlock as players master music knowledge.
- Mobile-first HUD: safe-area aware, one-hand friendly overlays, PWA-ready preview.
- iOS migration path: Capacitor is configured for Xcode and TestFlight migration.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## iOS bridge

```bash
npm run build
npm run cap:sync:ios
npm run cap:open:ios
```

## Architecture

```text
index.html
src/main.js
src/scene/world.js
src/ui/game-shell.js
src/ui/vision-upgrade.js
src/config/stages.js
src/config/world-map.js
src/config/cat-roster.js
src/native/capacitor-bridge.js
```

## Roadmap

### V1 playable learning prototype

- Pitch matching with 3D cats
- Music card rewards
- Stage-based learning
- Mobile browser preview

### V2 commercial game foundation

- Region-based progression
- Cat album and growth system
- Better mobile HUD and PWA installation
- iOS Capacitor pipeline

### V3 deeper music game

- Boss battles based on rhythm and chord recognition
- Daily training quests
- Song-based levels
- Player profile and mastery ranking
- Seasonal events and limited cats

## Design principle

Players should feel they are collecting cute cats and exploring a world. Music knowledge should be learned as a consequence of gameplay, not as homework.
