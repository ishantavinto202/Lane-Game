# Lane — Endless Car Avoidance Game

Expo SDK 53 · React Native 0.79 · Reanimated · Zustand · NativeWind

---

## Phase 1 — Playable World Foundation (Complete)

Phase 1 delivers the scalable architecture and a **rendered, scrollable world** with the player car in the center lane.

### What You Can Run (Phase 1 baseline)

- Full-screen game view with infinite scrolling road
- Player rendered at bottom-third in center lane
- Pause / Resume / Reset session controls (game starts in **Playing** automatically)

---

## Phase 2 — Player Controls & Lane Switching (Complete)

Phase 2 adds on-screen controls and smooth lane-based movement. Road continues scrolling. No obstacles or gameplay systems yet.

### What You Can Run Today

- App launches directly into **Playing** — road scrolls immediately, arrow buttons active
- Tap **←** / **→** (bottom corners) → player moves one lane per tap
- Invalid moves at lane boundaries are ignored (Lane 0 + left = no-op)
- Successful lane change triggers haptic feedback + car tilt animation
- Tap **Pause** → scroll and input stop; **Reset** → center lane restored (stays in Playing)

### New Modules

```txt
src/game/systems/
  input/InputManager.ts           Central input router (button + future swipe)
  player/PlayerMotionController.ts Reanimated X + tilt animations
src/components/lane-game/
  controls/ControlButton.tsx      Memoized arrow button with press scale
  layers/ControlsLayer.tsx        Bottom-left / bottom-right placement
docs/architecture/
  PHASE-2-MOVEMENT.md             Input + animation architecture
```

---

## Phase 3 — Obstacles, Collision & Scoring (Complete)

Phase 3 adds lane hazards, collision detection, distance-based scoring, and best-score persistence.

### What You Can Run Today

- Obstacles spawn in lanes 0–2 (Tire 64×64, Cone 48×48, Crate 96×96, Barrier 96×80)
- **Spawn bag** selects obstacle type: shuffled bag of `[Tire, Tire, Cone, Cone, Crate, Barrier]` — one pull per spawn attempt; if no fair lane exists the type is returned to the bag and the spawn is skipped (no fallback substitution)
- Fair spawn logic always leaves at least one open lane — no impossible walls
- Obstacles move downward at game speed via pooled Reanimated shared values (no per-frame React state)
- Lane-based collision → **Game Over** stops engine, road, and obstacles + heavy haptic
- Score increases with distance survived; best score persisted to AsyncStorage
- **Pause** button (top-right) freezes road, obstacles, and input; **Resume** continues
- **Game Over** overlay shows score, best score, and **Play Again**

### Pause & Game Over UI

```txt
src/components/lane-game/
  controls/PauseButton.tsx         Top-right Pause / Resume toggle
  overlays/GameOverOverlay.tsx     Full-screen game over modal
```

**Engine rule:** `GameStatus.Playing` → rAF loop runs · `Paused` / `GameOver` → engine stopped, input disabled.

**Play Again** (`restartRun`) → reset road, obstacles, player (center lane), score → `Playing`.

### New Modules

```txt
src/game/systems/
  obstacle/ObstacleSystem.ts       Spawn, pool, move, fair lane gaps
  obstacle/obstacle-spawn-bag.ts   Shuffled spawn bag + returnType on skip
  obstacle/obstacle-spawn-debug.ts Dev spawn audit logs (100-attempt summary)
  collision/CollisionSystem.ts     Lane + Y overlap detection
  score/ScoreSystem.ts               Distance → score, best tracking
  persistence/player-stats.persistence.ts  AsyncStorage best score
src/components/lane-game/
  obstacle/ObstacleSprite.tsx      Memoized pooled obstacle render
  layers/ObstacleLayer.tsx         Between Road and Player
```

### Engine Tick Flow (Phase 3)

```
rAF tick →
  RoadSystem.updateScroll() →
  ObstacleSystem.updateObstacles() →
  CollisionSystem.evaluate() →
  ScoreSystem.addDistance() →
  Reanimated shared values (render)
```

On collision: `GameStatus.GameOver` → engine.stop() → haptic → persist best score.

### Render Layers (bottom → top)

1. Left / right **grass**
2. Left / right **sidewalk**
3. **Road surface** + lane dividers
4. **Obstacles** (pooled sprites, `pointerEvents="none"`)
5. **Player** (animated X + tilt)
6. **UI** — status + score badge (top center)
7. **PauseButton** — top-right Pause / Resume
8. **GameOverOverlay** — score, best, Play Again
9. **Controls** — left/right arrows (disabled when not Playing)

**Camera zoom (render-only):** `GameScreen` applies a single `scale: 0.875` from **top-center** so the road stays horizontally centered (top-left pivot shifted the world left). `RoadLayer` extends render height to `screenHeight / 0.875` so the road fills vertically after scaling. Gameplay layout, speeds, and collision math are unchanged.

---

## Phase 4 — Game Loop, Audio & Persistence (Complete)

Phase 4 completes the gameplay loop: game over, retry, pause/resume polish, SFX, run statistics, and collision feedback.

### What You Can Run Today

- **Game Over** — collision freezes engine (road, obstacles, score); centered modal with Score, Best, Runs, **Retry**
- **Retry** — no route change, no reload: resets player lane, score, obstacle pool, difficulty timers → `Playing`
- **Pause / Resume** — top-right button + dimmed pause overlay; resumes from same position
- **Audio (expo-audio)** — lane-change click, collision crash, game-over fail; preloaded reusable players
- **Persistence (AsyncStorage)** — best score, total runs, total distance; loaded on startup, saved on game over
- **Run statistics** — HUD shows live score + best; game-over shows total runs
- **Collision flash** — quick red full-screen flash on impact
- **Haptics** — heavy error on collision; success notification when beating best score

### New Modules

```txt
assets/audio/                         lane-change, collision, game-over WAV SFX
src/game/systems/audio/
  AudioManager.ts                     Preloaded expo-audio SFX pool
  InputManagerAudioBridge.ts          Lane SFX without modifying InputManager
src/game/persistence/
  player-stats.persistence.ts         bestScore + totalRuns + totalDistance
src/components/lane-game/overlays/
  GameOverOverlay.tsx                 Score / Best / Runs / Retry
  PauseOverlay.tsx                    Dimmed paused state
  CollisionFlashOverlay.tsx           Reanimated red flash
```

### Game Over Flow

```
CollisionSystem.evaluate() hit →
  GameEngine.stop() →
  ScoreSystem.resolveBestScore() →
  Zustand GameOver + collisionFlashNonce →
  AudioManager (collision + game-over) →
  Haptics (error + success if new best) →
  playerStatsPersistence.persistRunEnd()
```

### Retry Flow

```
GameOverOverlay Retry → restartRun() → resetNonce++ →
  useGameEngine effect → GameEngine.reset() + start() →
  inputBridge.reset() (center lane) + obstacle pool clear + elapsedMs = 0
```

### Engine ↔ Store Sync

| Status | Engine | Input | Score tick |
|--------|--------|-------|------------|
| `Playing` | rAF running | enabled | updating |
| `Paused` | stopped | disabled | frozen |
| `GameOver` | stopped | disabled | frozen |

### Render Layers (bottom → top)

1. Left / right **grass**
2. Left / right **sidewalk**
3. **Road surface** + lane dividers
4. **Obstacles** (pooled)
5. **Player**
6. **Controls** (arrows)
7. **UI badge** — health hearts (top center) + score/status/best (top left)
8. **PauseButton** — top-right
9. **PauseOverlay** — dimmed when paused
10. **CollisionFlashOverlay** — red flash on hit
11. **GameOverOverlay** — modal on game over

---

## Phase 4.1 — Health System (Complete)

Replaces instant death with **3-health** damage flow and invulnerability.

### What You Can Run Today

- Player starts each run with **3 health** — HUD shows ❤️ ❤️ ❤️ at top center
- Obstacle hit → **health − 1**, collided obstacle removed, red flash, car blink, collision SFX + strong haptic
- **1000ms invulnerability** after each hit — no further collisions processed, car blinks on UI thread
- **Game Over** only when health reaches **0** — engine stops, game-over SFX, persistence, overlay
- **Retry** resets health to 3, invulnerability, and blink state

### New Modules

```txt
src/game/systems/health/
  HealthSystem.ts                  Health pool + invulnerability timer
  health.contract.ts
src/components/lane-game/ui/
  HealthHud.tsx                    Top-center ❤️ health display (z-index above game world)
```

### Damage Flow

```
CollisionSystem.evaluate() hit →
  ObstacleSystem.removeObstacleById() →
  HealthSystem.takeDamage() →
  Zustand setHealth + collisionFlash + damageBlink →
  AudioManager.playCollision() + haptic →
  if health > 0: engine keeps running
  if health === 0: handleGameOver()
```

During invulnerability: `HealthSystem.update(deltaMs)` ticks timer; collision evaluation skipped.

### Retry Integration

```
restartRun() → health: 3 in store → GameEngine.reset() → healthSystem.reset()
PlayerCar cancels blink opacity → 1
```

---

## Phase 4.2 — Coin Collection System (Complete)

Adds lane collectible coins with independent spawning, overlap collection, run HUD, and lifetime persistence.

### What You Can Run Today

- **Coins** spawn independently in lanes 0–2 (38×38 voxel coin sprite from `assets/voxel/Coin.png`, pooled Reanimated slots)
- **Fair placement** — shuffled lane retry at spawn line; coin visual bounds + 20px clearance must not intersect any active obstacle visual bounds (+20px); skip spawn if no lane is valid (`CoinSpawnRejected` / `CoinSpawnSkipped` dev logs)
- **Collection** — player overlap removes coin, increments run count, light haptic, gold burst effect
- **HUD** — top center shows `❤️ ❤️ ❤️     🪙 X` (current run coins, instant update)
- **Retry** — run coin count resets to 0, active coin pool cleared, spawning restarts
- **Persistence** — lifetime coins saved to AsyncStorage on game over (`runCoins` added to `lifetimeCoins`)

### New Modules

```txt
src/game/systems/coin/
  CoinSystem.ts                    Spawn, pool, move, obstacle-safe lanes, collection probes
  coin-spawn-debug.ts              Expanded-bounds spawn validation + dev rejection logs
  coin-motion.types.ts             Reanimated render bridge
  coin.contract.ts
src/game/assets/definitions/
  coin.assets.ts                   38×38 coin asset + `COIN_IMAGE_SOURCE` (323×323 voxel PNG)
src/components/lane-game/
  coin/CoinSprite.tsx              Memoized pooled coin render
  coin/CoinCollectBurst.tsx        Gold pop on collection
  layers/CoinLayer.tsx             Between Road and Obstacles (pointerEvents="none")
```

### Collection Flow

```
GameEngine.tick() →
  CoinSystem.updateCoins() →
  createPlayerCollisionProbe() + createCoinCollisionProbes() →
  CoinSystem.evaluateCollection() →
  removeCoinById() + runCoins++ + setRunCoins + triggerCoinCollect + light haptic
```

Coin collection does **not** call `HealthSystem` or obstacle collision handlers.

### Engine Tick Flow (Phase 4.2)

```
rAF tick →
  RoadSystem.updateScroll() →
  ObstacleSystem.updateObstacles() →
  CoinSystem.updateCoins(obstacles) →
  CollisionSystem.evaluate() (obstacles only) →
  CoinSystem.evaluateCollection() →
  ScoreSystem.addDistance() →
  Reanimated shared values (render)
```

### Render Layers (bottom → top)

1. Left / right **grass**
2. Left / right **sidewalk**
3. **Road surface** + lane dividers
4. **Coins** (pooled, `pointerEvents="none"`)
5. **Obstacles** (pooled)
6. **Player**
7. **Controls**
8. **UI badge** — score/status/best (top left)
9. **HealthHud** — hearts + run coins (top center)
10. **PauseButton** — top-right
11. **PauseOverlay** / **CollisionFlashOverlay** / **GameOverOverlay**

### Retry Integration

```
restartRun() → runCoins: 0 in store → GameEngine.reset() → coinSystem.reset()
```

### Persistence

| Field | Scope | Updated |
|-------|-------|---------|
| `runCoins` | Zustand (current run) | On each collection |
| `lifetimeCoins` | AsyncStorage + Zustand | On game over via `persistRunEnd(snapshot, runCoins)` |

---

## Architecture

### System Separation

| System | Responsibility | Status |
|--------|----------------|--------|
| **GameEngine** | rAF loop, start/stop/reset, Phase 3 tick chain | ✅ |
| **LaneSystem** | 3-lane geometry, center X, bounds, clamp | ✅ |
| **RoadSystem** | Scroll offset via Reanimated `SharedValue` | ✅ |
| **PlayerSystem** | Authoritative lane index, `tryLaneChange()` | ✅ |
| **PlayerMotionController** | Reanimated X transition + tilt | ✅ |
| **InputManager** | Debounce, haptics, routes all lane input | ✅ |
| **ObstacleSystem** | Spawn bag type pick, pool, move, fair lane gaps | ✅ |
| **CollisionSystem** | Lane + Y overlap detection | ✅ |
| **HealthSystem** | 3-health pool, 1000ms invulnerability | ✅ |
| **CoinSystem** | Independent spawn, pool, move, obstacle-safe placement, collection | ✅ |
| **ScoreSystem** | Distance scoring, best score | ✅ |
| **AudioManager** | Preloaded SFX (lane, collision, game over) | ✅ |
| **Persistence** | Best score, total runs, total distance, lifetime coins | ✅ |
| **Zustand store** | Status + score + health + run coins + run stats + damage flash | ✅ |

**Not implemented yet:** decorations, swipe gestures, settings persistence UI.

### Lane System

| Lane | Index | Notes |
|------|-------|-------|
| Left | 0 | Left boundary — further left taps ignored |
| Center | 1 | Spawn lane |
| Right | 2 | Right boundary — further right taps ignored |

- Lane width: **100px** · Road width: **300px** · Player car: **80×140**
- Centers computed once via `createGameLayout()` → `LaneSystem.getCenterX()`
- `PlayerSystem.tryLaneChange()` uses `resolveLaneChange()` — single source of lane math

### Input Architecture

All movement flows through **`InputManager.requestLaneChange(direction, source)`**:

```
ControlButton → InputManager → PlayerSystem.tryLaneChange()
                             → PlayerMotionController.animateToLane()
                             → expo-haptics (on success)
```

- **Button controls** wired now (`source: 'button'`)
- **Swipe controls** will call the same API with `source: 'swipe'` — no duplicated logic
- Input enabled only when `GameStatus.Playing`
- Debounce: **50ms** between accepted requests

### Animation Architecture

| Animation | Implementation | Duration |
|-----------|----------------|----------|
| Lane X move | `withTiming` + `Easing.out(cubic)` | **180ms** |
| Car tilt | `withSequence(±8°, return 0)` | 90ms + 90ms |
| Button press | scale → **0.92** | 80ms |

**Interrupt-safe:** each lane tap calls `cancelAnimation(x)` then retargets from current X to exact lane center. Rapid taps never drift position.

Player position uses Reanimated shared values (`playerX`, `playerY`, `playerTilt`) — **no React state per frame**.

### Render Layers (bottom → top)

1. Left / right **grass**
2. Left / right **sidewalk**
3. **Road surface** + lane dividers
4. **Obstacles** (pooled, between road and player)
5. **Player** (animated X + tilt)
6. **UI** — status + score badge (top center)
7. **PauseButton** — top-right Pause / Resume
8. **GameOverOverlay** — score, best, Play Again
9. **Controls** — left/right arrows, bottom corners, safe area inset

### Performance Decisions (Phase 2)

- `React.memo` on `ControlButton`, `ControlsLayer`, `PlayerCar`, all layers
- Stable `useCallback` handlers in controls and UI
- `useMemo` for layout, regions, button styles
- `useRef` for `GameEngine` + `InputManager` — no engine rerenders
- Zustand selectors only (`status`, action fns)
- Lane animation on UI thread via Reanimated — 60 FPS target maintained

### Planned Phases

| Phase | Scope |
|-------|-------|
| **1** ✅ | Scrolling road, player render, status store |
| **2** ✅ | Controls, lane switching, haptics, tilt animation |
| **3** ✅ | Obstacles, collision, scoring, difficulty ramp |
| **4** ✅ | Audio SFX, game-over/retry loop, pause overlay, run stats, collision flash |

Full Phase 2 doc: [`docs/architecture/PHASE-2-MOVEMENT.md`](docs/architecture/PHASE-2-MOVEMENT.md)

---

## Phase 1 — Playable World Foundation (Complete)

Phase 1 established the scalable architecture and rendered scrollable world with the player in the center lane.

### Folder Structure

```txt
src/
  game/
    engine/GameEngine.ts
    systems/lane|road|player|input/
    assets/definitions/
    config/ | constants/ | store/ | types/ | utils/
  components/lane-game/
    screens/ | layers/ | controls/ | road/ | player/ | hooks/
docs/architecture/PHASE-1-ARCHITECTURE.md
```

---

## Requirements

Before starting, make sure you have installed:

- Node.js (LTS version recommended)
- npm
- Xcode (for iOS development on Mac)
- Android Studio (for Android development)
- Expo Go app on your phone (optional)

---

## Project Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npx expo start
```

---

## Running the App

### iPhone Simulator

Press `i` inside the terminal after Expo starts.

### Android Emulator

Press `a` inside the terminal after Expo starts.

### Physical Device

1. Install the Expo Go app
2. Scan the QR code shown in terminal/browser

---

## Native Build

```bash
npx expo run:ios
# or
npx expo run:android
```

---

## Daily Word — Word Puzzle Module

Daily Word is a self-contained Wordle-style puzzle at `/dailyWord`, built under `src/components/daily-word/` with performance-isolated board, keyboard, and timer rendering.

### Folder Structure

```txt
src/components/daily-word/
├── index.ts
├── components/
│   ├── DailyWordLanding.tsx
│   ├── DailyWordGameScreen.tsx
│   ├── DailyWordVictoryScreen.tsx
│   ├── DailyWordDefeatScreen.tsx
│   ├── DailyWordPauseOverlay.tsx
│   ├── DailyWordStatsScreen.tsx
│   └── DailyWordSettings.tsx
├── puzzle/
│   ├── BoardGrid.tsx
│   ├── Tile.tsx
│   ├── Keyboard.tsx
│   └── CountdownTimer.tsx
├── game/
│   ├── types.ts
│   ├── scoring.ts
│   ├── tileFeedback.ts
│   ├── wordPicker.ts
│   ├── dictionary.ts
│   └── hooks/
│       └── useWordGame.ts
├── store/
│   ├── gameStore.ts
│   ├── statsStore.ts
│   └── settingsStore.ts
├── constants/
│   └── colors.ts
├── data/
│   ├── answers.json
│   └── guesses.json
└── assets/
    └── images/

app/dailyWord/
├── _layout.tsx
├── index.tsx          → Landing
├── game.tsx           → Game screen
├── victory.tsx
├── defeat.tsx
├── pause.tsx
├── stats.tsx
└── settings.tsx
```

### What You Can Run

- Navigate to **`/dailyWord`** for the landing screen
- Tap **Play Today** → 5×6 board with on-screen keyboard
- Daily answer selected deterministically from `answers.json` by date
- Win/loss screens, pause overlay, stats (AsyncStorage), and settings toggles

### Performance Notes

- `Tile` and keyboard keys use `React.memo` with custom equality checks
- Timer ticks update via `setNativeProps` and a separate `elapsedMs` store field — board rows do not re-render on tick
- Zustand selectors only — no context providers

---

## Tech Stack

- Expo SDK 53
- React Native 0.79
- React 19
- Expo Router
- NativeWind
- TypeScript
- Reanimated 3
- Zustand
- Gesture Handler
- Safe Area Context

---

## Troubleshooting

### ControlsLayer not visible

Diagnosis confirmed **CASE C** (layer mounts; layout/stacking issue). Lane buttons use explicit `top` coordinates from `useWindowDimensions` (center of playable area between safe-area top and tab bar) because flex centering collapsed when all game layers are absolutely positioned.

Clear Metro cache:

```bash
npx expo start -c
```

Reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```
# Lane-Game
