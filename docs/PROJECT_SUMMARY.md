# Lane — Project Summary

> **Start here.** This document is the executive overview for developers, designers, and AI assistants working on the Lane codebase. For phase-by-phase implementation history and deep technical notes, see [Readme.md](../Readme.md).

---

## Project Overview

| | |
|---|---|
| **Game title** | **Lane** (Jam Ride branding on the landing screen) |
| **Genre** | Endless arcade / lane-based avoidance |
| **Vision** | A polished, mobile-first endless driving game that feels like a native arcade title — fast, readable, and satisfying to replay. |
| **Elevator pitch** | Dodge obstacles across three lanes, collect power-ups, survive as long as you can, and chase your best score in a voxel-styled endless road runner. |
| **Core gameplay** | Scroll an infinite road, switch lanes to avoid hazards, grab coins and power-ups, manage health, and push your score higher as difficulty ramps up. |
| **Target audience** | Casual mobile players who enjoy quick sessions, high-score chasing, and simple touch controls. |
| **Supported platforms** | iOS, Android, and Web (via Expo) |
| **Technology stack** | Expo SDK 53 · React Native 0.79 · React 19 · Expo Router · TypeScript · Reanimated 3 · Zustand · Gesture Handler · NativeWind · AsyncStorage · expo-haptics · expo-audio · phosphor-react-native |

---

## Gameplay Summary

### Objective
Survive as long as possible on an endlessly scrolling three-lane road. Avoid obstacles, collect rewards, and maximize your score without losing all health.

### Core loop
1. Launch from the **Jam Ride** home screen and tap **Play**.
2. Assets preload, then a **3-2-1-GO** countdown begins.
3. The road scrolls, obstacles and collectibles spawn, and difficulty increases over time.
4. The player dodges hazards, collects coins and power-ups, and accumulates score.
5. On death, review score and best score, optionally open the **Scoring Guide**, and tap **Play Again** for an instant retry — no route reload.

### Controls
- **Arrow buttons** (bottom-left / bottom-right) — move one lane per tap.
- **Swipe left / right** on the playfield — same single-lane movement with horizontal-dominance detection.
- **Pause button** (top-right) — freeze gameplay; resume from the same position.
- Boundary moves are ignored (no wrap-around).

### Scoring
- **Survival:** +5 points per second while actively playing (doubled during Speed Boost).
- **Coins:** +20 instant points per pickup with a floating green feedback label.
- **Obstacles:** variable score penalties on hit (see Scoring Guide).
- **Best score** persists locally via AsyncStorage.

### Health system
- Player starts with **3 hearts**.
- Most obstacles deal health loss and/or score penalties; some deal score-only damage.
- After each hit: brief invulnerability, red collision flash, car damage blink, and collision SFX.
- **Game Over** when health reaches zero.

### Power-ups

| Power-up | Effect |
|----------|--------|
| **Coin** | +20 score on collection |
| **Shield** | Absorbs one obstacle hit; lasts 10 seconds; bubble overlay + HUD countdown |
| **Speed Boost** | 2× scroll speed and 2× score rate for 3 seconds; HUD timer + progress bar |

### Obstacles
Five voxel obstacle types spawn from a fair **spawn bag** (no type starvation): Traffic Cone, Tyre, Crate, Barrier, and Puddle. Each has distinct score penalties and health impact. Spawn logic guarantees at least one open lane — no impossible walls.

### Difficulty progression
- Scroll speed ramps from **320 → 720 px/s** over ~2 minutes.
- Obstacle spawn interval tightens from **1400 → 650 ms** over ~90 seconds.
- An opening showcase introduces obstacle types early at a fixed cadence before normal ramping resumes.

### Game over conditions
- Health reaches **0** after one or more obstacle collisions (unless absorbed by Shield).
- Engine stops, input disables, run stats persist, and the Game Over overlay appears with score, best score, and retry options.

---

## Current Features

### Core gameplay
- Endless three-lane scrolling road with grass, sidewalk, and lane dividers
- Lane switching via buttons and swipe gestures
- Five obstacle types with fair spawn bag and pickup-safe placement
- Three-health damage system with invulnerability frames
- Time-based scoring with coin bonuses and obstacle penalties
- Difficulty ramp (speed + spawn rate)
- Pre-run countdown (3-2-1-GO)
- Pause / Resume
- Instant retry (Play Again) without navigation reload

### Collectibles & power-ups
- Animated coin pickups (+20 score)
- Shield pickup with bubble overlay, break flash, and timed expiry
- Speed Boost pickup with doubled speed and score rate
- Floating +/− score feedback with near-anchor stacking

### Presentation & UI
- Jam Ride landing page (logo, animated car, Play button)
- Fullscreen game route (no tab bar)
- Three-zone HUD: score + best (left), hearts + shield badge (center), pause (right)
- Speed Boost HUD with countdown and progress bar
- Pause overlay with Resume + Scoring Guide entry
- Game Over overlay with Play Again + Scoring Guide entry
- In-game Scoring Guide modal (collectibles + obstacles with icons and penalty badges)
- Collision flash, damage blink, shield break flash
- Side decoration trees (non-colliding ambient layer)
- Render-only camera zoom for improved mobile framing

### Audio & feedback
- Lane-change, collision, and game-over SFX (expo-audio)
- Haptic feedback on lane change, collection, collision, and new best score

### Persistence
- Best score, total runs, and total distance (AsyncStorage)

### Secondary mode — Daily Word
- Fully implemented Word-style puzzle at `/dailyWord/*`
- Independent nested stack: landing, game, victory, defeat, pause, stats, settings
- Not linked from the Lane home screen; navigable by route

### Animations
- Reanimated-driven motion for player, road scroll, and all pooled entity slots
- Shared UI-thread animation clocks for coin, shield, and speed boost atlases
- Car tilt on lane change; timed power-up expiry blink

---

## Project Structure

### Navigation (`app/`)
Expo Router file-based routing with a root stack:

| Route | Purpose |
|-------|---------|
| `/` (`index.tsx`) | Jam Ride landing — preload assets, tap Play |
| `/lane-game` | Fullscreen Lane game (`GameScreen`) |
| `/dailyWord/*` | Daily Word nested stack (separate game mode) |

**Flow:** Home → asset preload → push `/lane-game` → countdown → play.

### Screens
- **Landing** — `app/index.tsx`
- **Lane game** — `app/lane-game.tsx` → `src/components/lane-game/screens/GameScreen.tsx`
- **Daily Word** — `app/dailyWord/` → `src/components/daily-word/`

### Game engine (`src/game/engine/`)
- **`GameEngine.ts`** — requestAnimationFrame loop orchestrating all systems
- Tick order: road → obstacles → collectibles → collision → score → HUD publish
- Status-driven: `Ready` → `Countdown` → `Playing` → `Paused` / `GameOver`

### Systems (`src/game/systems/`)
Isolated, single-responsibility modules:

| System | Role |
|--------|------|
| Input | Button + swipe lane changes |
| Player | Position, motion, lane state |
| Road | Infinite scroll |
| Obstacle | Spawn bag, pool, movement, fair lanes |
| Coin | Spawn, collection, score reward |
| Shield | Spawn, collection, absorb logic |
| Speed Boost | Spawn, collection, timed multipliers |
| Collision | Overlap detection, hit resolution |
| Health | Hearts, invulnerability |
| Score | Survival + bonus scoring, best tracking |
| Decoration | Ambient tree placement |
| Audio | SFX playback |

### Asset system (`src/game/assets/`)
- **`definitions/`** — typed asset metadata (dimensions, sources, atlas frames)
- **`preload-lane-game-images.ts`** — Image.prefetch before gameplay
- **Texture atlases** — coin, shield, and speed boost animation sheets
- **Voxel PNGs** — player, road, obstacles, HUD icons
- **Scoring Guide assets** — static reference PNGs separate from gameplay sprites

### Stores (`src/game/store/`)
- **Zustand** game store with stable slice selectors (`gameStoreSelectors`)
- Holds UI-facing state: status, score, health, power-up timers, floating score stack, flash/blink nonces
- Engine writes via `getState()` / `setState()`; components subscribe to slices only

### Components (`src/components/lane-game/`)
Layered, memoized render tree:

```
GameScreen
├── RoadLayer / DecorationLayer
├── CoinLayer / ShieldLayer / SpeedBoostLayer / ObstacleLayer
├── PlayerLayer + ShieldBubble
├── ControlsLayer (swipe + arrows)
├── UiLayer / HealthHud / SpeedBoostHud / PauseButton
├── FloatingScoreFeedbackLayer
└── Overlays (Countdown, Pause, GameOver, CollisionFlash)
```

Motion runs on **Reanimated shared values**; React re-renders are limited to pool revision bumps and store slice updates.

### Utilities & config
- **`src/game/config/`** — gameplay tuning (speed, spawn, health, penalties, power-ups)
- **`src/game/utils/`** — layout, collision bounds, difficulty curves
- **`src/game/persistence/`** — AsyncStorage read/write for player stats
- **`src/game/content/`** — Scoring Guide data sourced from config (no duplicated values)

---

## Development Philosophy

### Code style
- TypeScript throughout; strict typing for game entities, contracts, and asset definitions
- `React.memo`, `useCallback`, and `useMemo` on UI components and handlers
- `useRef` for mutable game state (engine refs, navigation locks, animation values)
- Stable references — no inline objects in hot render paths where avoidable

### Architecture philosophy
- **Systems over monoliths** — each gameplay concern is an isolated module with a contract
- **Engine orchestrates, systems execute** — single rAF tick, traceable execution chain:
  `UI Event → Handler → Input → Game System → Store → Motion → Render`
- **Fix one layer at a time** — never refactor multiple systems in a single change
- **No placeholder gameplay logic** — systems must be complete and runnable (UI placeholders on landing page are the current exception)

### UI philosophy
- Mobile-first, fullscreen game presentation
- Minimal HUD chrome — score, hearts, power-up timers, pause
- Overlays for pause, game over, and reference (Scoring Guide) without route changes
- Dark, modern landing aesthetic (Jam Ride brand)
- 60 FPS target — motion on UI thread, isolated memoized layers

### Gameplay philosophy
- **Fair but escalating** — always at least one open lane; difficulty ramps smoothly
- **Readable feedback** — haptics, SFX, floating score, collision flash, HUD badges
- **Instant retry** — no friction between death and the next run
- **Power-ups add variety, not complexity** — shield (defense), speed boost (risk/reward), coins (score)

### Asset philosophy
- Voxel PNG sprites for world objects; texture atlases for animated collectibles
- Gameplay assets and Scoring Guide reference assets are kept separate
- Preload all Lane PNGs before entering the game route
- Presentation bounds (sprite-aware hitboxes) separate from raw image dimensions for fair collision and spawn placement

---

## Current Status

### Completed systems
- Endless road rendering with camera zoom
- Lane switching (buttons + swipe)
- Obstacle spawn bag with fair placement and pickup-safe validation
- Health, collision, and invulnerability
- Coin, Shield, and Speed Boost collectibles
- Score system with survival rate, bonuses, penalties, and best-score persistence
- Difficulty ramp (speed + spawn interval)
- Countdown, pause, game over, and instant retry
- Audio SFX and haptic feedback
- Floating score feedback
- Scoring Guide modal
- Jam Ride landing page UI
- Daily Word (full separate mode)
- Run statistics persistence

### Work in progress
- **Landing page placeholders** — "Your Best", "Global Best", and "Exit" are visual placeholders (hardcoded scores, no-op handlers)
- **Global best score** — not yet connected to live data or a backend
- **Dependency cleanup** — `package.json` contains template dependencies beyond the project's strict allowed list

### Known issues
- Landing page stat cards and Exit button are non-functional placeholders by design
- NativeWind class usage is inconsistent (landing page and lane game use StyleSheet; Daily Word uses NativeWind classes)
- `package.json` project name (`trio-frontend`) reflects the original Expo template, not the Lane product name

### Future roadmap
- Wire landing page to real best-score data (local and/or global leaderboard)
- Implement Exit behavior (app close or confirm dialog)
- Settings screen for Lane (audio, haptics toggles)
- Dependency audit — align `package.json` with the allowed technology list
- Additional obstacle variants or biomes
- Achievement / milestone system
- Online leaderboards
- App Store / Play Store release polish (icons, splash, onboarding)

---

## Quick Reference for AI Assistants

| Question | Answer |
|----------|--------|
| Where does the game start? | `app/index.tsx` → preload → `/lane-game` |
| Where is the game loop? | `src/game/engine/GameEngine.ts` |
| Where is game state? | `src/game/store/` (Zustand) |
| Where are tuning values? | `src/game/config/` |
| Where are render layers? | `src/components/lane-game/layers/` |
| How to add a new obstacle? | System + assets + scoring guide content + config penalty |
| Daily Word location? | `app/dailyWord/` + `src/components/daily-word/` |
| Detailed phase docs? | [Readme.md](../Readme.md) |
| Cursor rules? | [Important-Rule.mdc](../.cursor/rules/Important-Rule.mdc) |

---

*Last updated: June 2026 · Lane v1.0.0*
