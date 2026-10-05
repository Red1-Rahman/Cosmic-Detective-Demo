# Cosmic Detective: Frontend Concept Demo

Team **Pleadies**, NASA Space Apps Challenge.

A frontend-only, playable slice of Cosmic Detective: a story-driven tool for inspecting NASA SPHEREx sky images and finding objects that move between observations.

**Stack:** Phaser 3 (tile scanner) · React + TypeScript (UI shell) · Vite

## Important: demo data

The tiles in this build are **procedurally generated stand-ins**, not real SPHEREx observations. They exist so the concept can be shown without a backend. Real data (Level 2 cutouts, spectral mosaics, and catalogs) replaces `src/game/data.ts` in the full build. Nothing here should be presented as a scientific result.

## What's in this demo

- Mission brief and narrative framing
- Anomaly Scanner: a 4×3 tile grid rendered in Phaser
- Blink Comparator: toggles between two epochs
- Flag and verification pipeline: stationary, halo, catalog match, candidate
- Rank and XP bar, with a placeholder Rank 2 threshold
- First-time guided tutorial that runs on a guaranteed correct tile
- Dark, light, and colorblind-safe (Okabe-Ito) display modes

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to Netlify

1. Push this folder to a Git repository.
2. In Netlify, choose **Add new site → Import an existing project** and select the repo.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`.
4. No environment variables are needed.

Or drag the built `dist/` folder into Netlify Drop after running `npm run build`.

## Project layout

```
src/
  App.tsx                 React shell, HUD, state
  main.tsx                entry point
  theme.ts                dark / light / colorblind palettes (GDD §9)
  game/
    data.ts               DEMO tile generator (not real data)
    verify.ts             verification pipeline (GDD §5.3)
    createGame.ts         Phaser bootstrap
    scenes/ScannerScene.ts  tile grid + blink comparator
  ui/
    Brief.tsx             narrative brief
    RankBar.tsx           rank and XP
    ResultPanel.tsx       per-check verification report
    Guide.tsx             first-time tutorial
```

## Team Pleadies

- Ashratul Zannati Purnota (@argi), Bangladesh
- Redwan Rahman (@red1_rahman), Bangladesh
- Yead Muhammad Ivan (@yead_muhammad), Bangladesh
- Farhana Ferdous (@farna), United States
- Md Shahadat Hossain Shahal (@shahadatw6), Bangladesh
