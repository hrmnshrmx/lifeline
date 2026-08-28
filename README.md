# Lifeline

**Your life, measured in time.**

A cinematic, mobile-first personal timeline experience. Enter your date of
birth and see your life represented through time — a live counter of every
second you've been alive, how rare your birthday is, what happened on the day
you were born, and reflective statistics about your existence.

Live: [lifeline.harmansharma.in](https://lifeline.harmansharma.in/)

## Highlights

- **Live life counter** — years, months, days, hours, minutes and seconds,
  recalculated from your birth moment on every tick (never a fake incrementing
  number). Calendar-aware around leap years, month lengths and DST.
- **Birthday rarity** — an honest, clearly-labelled calendar-based estimate
  (no fabricated real-world statistics).
- **On the day you were born** — a curated, source-attributed set of real
  historical events. Nothing is invented; unknown dates say so.
- **Life in numbers** — days, weeks, full moons, sunrises and more, with
  astronomical values transparently marked as estimates.
- **A gentle perspective** — an illustrative life-progress view ("you are
  here now"), never fear-based.
- **Tasteful 3D** — a procedural rotating planet (Three.js / React Three
  Fiber) that scales down on low-power devices and is lazy-loaded so the page
  is interactive fast.

## Privacy

Everything runs locally in your browser. Your birthday is stored only in
`localStorage` on your device and is never sent anywhere. No backend, no
database, no external APIs, no accounts.

## Tech

React · Vite · JavaScript · Three.js + @react-three/fiber · modern CSS.

## Develop

```bash
npm install
npm run dev      # start dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Deploy

The build is a static SPA in `dist/` and deploys cleanly with no special
server configuration.

- **Netlify** — settings are in `netlify.toml` (build `npm run build`, publish
  `dist`, SPA fallback redirect).
- **Vercel** — auto-detected as a Vite project; no config needed.

## Project structure

```
src/
  components/   BirthdayInput, LifeCounter, BirthdayRarity, OnThisDay,
                LifeStats, LifeProgress, EarthScene, Header, Footer, Reveal
  data/         onThisDay.js        — curated historical dataset
  hooks/        useLifeCounter, useBirthday, useReducedMotion
  utils/        dateCalculations, birthdayRarity, lifeStatistics, format
  App.jsx, main.jsx
```

## Extending the data

- **Historical events**: add a `"MM-DD"` entry to `src/data/onThisDay.js` with
  any of `{ events, births, deaths }`. Only real, documented facts.
- **Real birthday-frequency data**: implement `frequencyForDate(monthDayKey)`
  in `src/utils/birthdayRarity.js` to return a share (0–1); the UI swaps to it
  automatically.

Built by Harman Sharma — [harmansharma.in](https://harmansharma.in)
