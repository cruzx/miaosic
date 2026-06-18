# Miaosic iOS Release Checklist

This checklist keeps the HTML preview, PWA preview, and Capacitor iOS build aligned.

## 1. Web build

```bash
npm install
npm run build
npm run preview
```

Expected result:

- Vite builds without errors.
- `dist/` is generated.
- The Three.js scene loads inside the browser preview.
- World Map and Cat Album buttons are visible.
- Audio starts only after user interaction.

## 2. Mobile browser QA

Test on Safari iOS and Chrome Android:

- Safe-area padding does not overlap the Dynamic Island or home indicator.
- The map and cat album panels can open and close.
- Dragging the world does not scroll the page.
- Dragging cats remains smooth.
- Listen button and Next button are reachable with one hand.

## 3. PWA preview

- `manifest.webmanifest` is reachable.
- App name displays as `Miaosic` on the home screen.
- SVG icons load from `/icons/icon-192.svg` and `/icons/icon-512.svg`.
- Standalone mode opens without browser chrome.

## 4. Capacitor sync

```bash
npm run build
npm run cap:sync:ios
npm run cap:open:ios
```

Expected result:

- Xcode opens the iOS project.
- Web assets are copied into the native shell.
- Status bar uses the configured dark style.
- Haptics bridge does not break if native APIs are unavailable.

## 5. App Store preparation

Before TestFlight:

- Replace SVG placeholder icons with final App Store PNG icon set.
- Add launch screen assets.
- Decide privacy policy URL.
- Add music/audio learning description.
- Confirm all sounds are generated or licensed.
- Add analytics only after consent and privacy review.

## 6. Product quality bar

Miaosic should feel like a game first:

- Every music lesson must be attached to an action.
- Every reward should unlock a cat, region, animation, or learning card.
- Avoid long textbook copy during gameplay.
- Keep theory explanations short, visual, and collectible.
