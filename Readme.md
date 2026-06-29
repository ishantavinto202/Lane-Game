# Lane — Endless Car Avoidance Game

Expo SDK 53 · React Native 0.79 · Reanimated · Zustand · NativeWind

---

## App Navigation

The lane game runs **outside** the tab navigator for fullscreen, professional mobile-game behavior (no tab bar, no safe-area conflicts).

```txt
app/
├── _layout.tsx          Root stack
├── lane-game.tsx        Fullscreen game route → GameScreen
└── (tabs)/
    ├── _layout.tsx      Tab navigator (Home, Tab Two)
    └── index.tsx        Home landing → preload assets → router.push('/lane-game')

src/game/assets/
└── preload-lane-game-images.ts   Lane-only Image.prefetch before navigation
```

- **Home tab** (`/(tabs)`) — landing with **Play** button
- **Game route** (`/lane-game`) — pushed onto root stack; no bottom tab bar
- **Launch flow:** tap **Play** → button disables immediately → all Lane PNGs prefetch → `router.push('/lane-game')`
- **Double-tap guard:** synchronous ref lock + disabled Pressable; only one navigation per launch
- **Return to Home:** `useFocusEffect` resets Play button to idle when the tab regains focus
- **Preload scope:** player, road, grass, sidewalk, obstacles, coins (atlas), shield (atlas + HUD voxel), speed boost, trees, HUD hearts — no Daily Word or audio assets

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

- Home tab → tap **Play** → fullscreen **`/lane-game`** route; road scrolls on start, arrow buttons active
- Tap **←** / **→** (bottom corners) → player moves one lane per tap
- **Swipe left / right** anywhere on the playfield → same single-lane movement (`source: 'swipe'`)
- Invalid moves at lane boundaries are ignored (Lane 0 + left = no-op)
- Successful lane change triggers haptic feedback + car tilt animation
- Tap **Pause** → scroll and input stop; **Reset** → center lane restored (stays in Playing)

### New Modules

```txt
src/game/systems/
  input/InputManager.ts           Central input router (button + swipe)
  input/resolve-swipe-lane-direction.ts Swipe threshold + horizontal dominance gate
src/components/lane-game/
  controls/ControlButton.tsx      Memoized arrow button with press scale
  controls/LaneSwipeSurface.tsx   Full-screen pan gesture → lane change
  layers/ControlsLayer.tsx        Swipe surface + bottom-left / bottom-right buttons
docs/architecture/
  PHASE-2-MOVEMENT.md             Input + animation architecture
```

---

## Phase 3 — Obstacles, Collision & Scoring (Complete)

Phase 3 adds lane hazards, collision detection, distance-based scoring, and best-score persistence.

### What You Can Run Today

- Obstacles spawn in lanes 0–2 (Tire 64×64, Cone 48×48, Crate 96×96, Barrier 96×80, Puddle 72×72 — all voxel PNGs)
- **Spawn bag** holds one of each obstacle type (Tire, Cone, Crate, Barrier, Puddle), shuffled on creation and on each refill; every five successful pulls depletes exactly one full bag with no type starvation
- **Opening showcase cadence** temporarily uses a 900ms obstacle interval for the first 4 successful spawns, introducing Tire, Cone, Crate, and Barrier early while preserving natural vertical spacing; Puddle enters on the fifth bag pull; normal difficulty-based spawn timing resumes afterward
- Failed placements are retried via `returnType` before the next bag pull, so a blocked type is not lost or skipped permanently
- **Pickup-safe placement** — obstacle **presentation bounds** (scaled sprite AABB) + per-type clearance must not intersect any active collectible; lane retry up to `obstacleSpawnLaneRetryLimit` across `obstacleSpawnYRetryOffsetsPx`, then skip spawn
- Fair spawn logic always leaves at least one open lane — no impossible walls
- Obstacles move downward at game speed via pooled Reanimated shared values (no per-frame React state)
- Lane-based collision → **Game Over** stops engine, road, and obstacles + heavy haptic
- Score increases by **+5 every 1 second survived** while actively playing; best score persisted to AsyncStorage
- **Pause** button (top-right) freezes road, obstacles, and input; **Resume** continues
- **Game Over** overlay shows score, best score, and **Play Again**

### Pause & Game Over UI

```txt
src/components/lane-game/
  controls/PauseButton.tsx         Top-right circular pause/resume icon (no label)
  ui/game-hud.styles.ts            Shared HUD spacing, chrome, and z-index
  layers/UiLayer.tsx               Top-left score + best (no gameplay state text)
  overlays/GameOverOverlay.tsx     Full-screen game over modal
```

**Engine rule:** `GameStatus.Playing` → rAF loop runs · `Countdown` / `Paused` / `GameOver` → engine stopped, input disabled · score timer starts only after countdown `GO!`.

**Play Again** (`restartRun`) → reset road, obstacles, player (center lane), score → `Playing`.

### New Modules

```txt
src/game/systems/
  obstacle/ObstacleSystem.ts       Spawn, pool, move, fair lane gaps
  obstacle/obstacle-spawn-bag.ts   Shuffled spawn bag + returnType on skip
  obstacle/obstacle-spawn-debug.ts   Unified Tire/Cone/Crate/Barrier audit (50-attempt summary) + legacy logs
  collision/CollisionSystem.ts     Lane + Y overlap detection
  score/ScoreSystem.ts               Time-based +5/sec score, best tracking
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
  ScoreSystem.addSurvivalTime() →
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
7. **PauseButton** — top-right circular ⏸ / ▶ icon
8. **GameOverOverlay** — score, best, Play Again
9. **Controls** — left/right arrows (disabled when not Playing)

**Camera zoom (render-only):** `GameScreen` applies a single `scale: 0.875` from **top-center** so the road stays horizontally centered (top-left pivot shifted the world left). `RoadLayer` extends render height to `screenHeight / 0.875` so the road fills vertically after scaling. Gameplay layout, speeds, and collision math are unchanged.

---

## Phase 4 — Game Loop, Audio & Persistence (Complete)

Phase 4 completes the gameplay loop: game over, retry, pause/resume polish, SFX, run statistics, and collision feedback.

### What You Can Run Today

- **Game Over** — collision freezes engine (road, obstacles, score); centered modal with Score, Best, **Retry**
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
  GameOverOverlay.tsx                 Score / Best / Retry
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
8. **PauseButton** — top-right circular icon
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
  HealthHud.tsx                    Top-center hearts + shield countdown (amber/red expiry colors)
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

Adds lane collectible coins with independent spawning, overlap collection, and instant score rewards.

### What You Can Run Today

- **Coins** spawn independently in lanes 0–2 (38×38 animated atlas from `assets/Coin Animations/texture.png` + `texture.json`, +20% brightness/contrast on atlas texture, pooled Reanimated slots)
- **Fair placement** — shuffled lane + Y-offset retry; collectible sprite bounds must respect **sprite-aware** obstacle presentation bounds + per-type clearance (`computeObstaclePresentationBounds` + `getObstacleCollectibleClearancePx`) and `minCollectibleSpacingPx` from other active collectibles; skip spawn if no valid position (`CoinSpawnRejected` / `CoinSpawnSkipped` dev logs with bounds + overlap area)
- **Symmetrical spawn validation** — coin, shield, and speed boost share `findObstacleCollectibleSpawnConflict`; obstacles reject collectible spawns using the same presentation-bound + clearance helpers
- **Collection** — player overlap removes coin, adds **+20 score** instantly, light haptic, floating **`+20`** popup (green)
- **HUD** — three-zone top bar: **left** large score + best, **center** hearts + shield countdown, **right** circular pause icon (no PLAYING/PAUSED labels)
- **Retry** — active coin pool cleared, spawning restarts; score resets via `ScoreSystem.reset()`

### New Modules

```txt
src/game/systems/coin/
  CoinSystem.ts                    Spawn, pool, move, obstacle-safe lanes, collection probes
  coin-spawn-debug.ts              Sprite-aware spawn validation + dev rejection logs
  coin-motion.types.ts             Reanimated render bridge
  coin.contract.ts
src/game/assets/definitions/
  coin.assets.ts                   38×38 coin gameplay asset definition
  coin-atlas.assets.ts             Spin atlas frames + layout metadata (texture.png/json)
src/components/lane-game/
  coin/CoinSprite.tsx              Memoized pooled animated coin render (14.5 FPS shared clock)
  coin/coinAnimationClock.ts       One shared Reanimated loop for all coin sprites
  ui/FloatingScoreFeedbackLayer.tsx Unified +/− score floaters with vertical stacking
  layers/CoinLayer.tsx             Between Road and Obstacles (pointerEvents="none")
```

### Collection Flow

```
GameEngine.tick() →
  CoinSystem.updateCoins() →
  createPlayerCollisionProbe() + createCoinCollisionProbes() →
  CoinSystem.evaluateCollection() →
  removeCoinById() + ScoreSystem.addPickupBonus(+20) + setScoreSnapshot + triggerCoinCollect + light haptic
```

Coin collection does **not** call `HealthSystem` or obstacle collision handlers.

### Collectible Spawn Spacing

| Setting | Value |
|---------|-------|
| `COLLECTIBLE_SPAWN_CONFIG.minCollectibleSpacingPx` | **48** (coin ↔ shield ↔ speed boost) |
| `COLLECTIBLE_SPAWN_CONFIG.obstacleCollectibleBaseClearancePx` | **12** (added to every obstacle type) |
| Per-type obstacle clearance (base + extra) | Puddle **48**, Barrier **40**, Crate **30**, Tyre **30**, Cone **22** |

Validated via `computeObstaclePresentationBounds()` + `findObstacleCollectibleSpawnConflict()` in existing lane/Y retry loops (`coin-spawn-debug.ts`).

### Engine Tick Flow (Phase 4.2)

```
rAF tick →
  RoadSystem.updateScroll() →
  ObstacleSystem.updateObstacles() →
  CoinSystem.updateCoins(obstacles) →
  CollisionSystem.evaluate() (obstacles only) →
  CoinSystem.evaluateCollection() →
  ScoreSystem.addSurvivalTime() →
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
9. **UiLayer** — score + best (top left)
10. **HealthHud** — hearts + shield countdown (top center)
11. **PauseButton** — circular icon (top right)
11. **PauseOverlay** / **CollisionFlashOverlay** / **GameOverOverlay**

### Retry Integration

```
restartRun() → GameEngine.reset() → coinSystem.reset()
```

---

## Phase 4.3A — Shield Power-Up (Complete)

Adds a collectible shield that absorbs one obstacle hit without health loss or invulnerability.

### What You Can Run Today

- **Shield pickups** spawn in lanes 0–2 (44×44 **Shield Animations** atlas via shared `ShieldAtlasSprite`, pooled Reanimated slots, obstacle-safe + coin-safe placement with lane/Y retry)
- **Collection** — overlap activates a **10 second** shield (`ShieldRuntime.activate()`), light haptic, pickup removed; ignored if shield already active
- **Shield bubble** — `assets/voxel/Bubble.png` voxel overlay follows the player car while active (15% display scale via `SHIELD_CONFIG.bubbleDisplayScale`)
- **Timed expiry** — HUD shows shield icon + remaining seconds; final **3 seconds** blink HUD icon + bubble at ~4.5 smooth opacity pulses/sec (visual only)
- **Collision absorb** — when shield active: obstacle destroyed, shield consumed, blue break flash, heavy haptic; no health loss, no damage blink, no red collision flash, no invulnerability
- **Natural expiry** — timer reaching zero removes bubble + HUD immediately (no break flash)
- **HUD** — `TimedPowerUpHudBadge` in top health badge while shield is active
- **Retry** — `restartRun()` clears shield state and despawns all shield pickups

### New Modules

```txt
src/game/systems/shield/
  ShieldSystem.ts                  Spawn, pool, move, obstacle-safe lanes, collection probes
  ShieldRuntime.ts                 Active shield duration timer (single source of truth)
  shield-motion.types.ts           Reanimated render bridge
  shield.contract.ts
src/game/config/
  timed-power-up.config.ts         Shared expiry warning + blink tuning
src/components/lane-game/timed-power-up/
  TimedPowerUpHudBadge.tsx         Reusable icon + countdown badge
  useTimedPowerUpExpiryBlink.ts    Smooth final-window opacity pulse hook
  compute-timed-power-up-display.ts Remaining seconds + warning window helpers
src/game/assets/definitions/
  shield.assets.ts                 44×44 hitbox + HUD icon + `SHIELD_BUBBLE_IMAGE_SOURCE` (Bubble.png)
  shield-atlas.assets.ts           Shield Animations texture.json/png (25 frames @ 18.85 FPS)
src/components/lane-game/
  shield/ShieldAtlasSprite.tsx     Shared shield atlas viewport (pickups + guide)
  shield/ShieldSprite.tsx          World-position wrapper → ShieldAtlasSprite
  shield/shieldAnimationClock.ts   Shared UI-thread frame loop
  shield/ShieldBubble.tsx          Bubble.png overlay (follows motion shared values)
  shield/ShieldBreakFlash.tsx      Blue flash on shield consumption
  layers/ShieldLayer.tsx           Between Coin and Obstacle layers
```

### Shield Flow

```
GameEngine.tick() →
  ShieldRuntime.update(deltaMs) → syncExpiredShieldState() on natural expiry →
  ShieldSystem.updateShields() →
  evaluateShieldCollection() → ShieldRuntime.activate() + setShieldState(true, 1) + removeShieldById()
  CollisionSystem.evaluate() →
    if ShieldRuntime.isActive() → handleShieldAbsorb() → removeObstacle + triggerShieldBreak()
    else → handleObstacleHit() (unchanged health path)
  publishHudIfDue() → setShieldState(active, remainingRatio)
```

### Engine Tick Flow (Phase 4.3A)

```
rAF tick →
  RoadSystem.updateScroll() →
  getActiveCoins() + getActiveShields() →
  ObstacleSystem.updateObstacles(coins, shields) →
  CoinSystem.updateCoins(obstacles) →
  ShieldSystem.updateShields(obstacles) →
  evaluateCoinCollection() + evaluateShieldCollection() →
  CollisionSystem.evaluate() → shield absorb OR health damage →
  ScoreSystem.addSurvivalTime() →
  Reanimated shared values (render)
```

### Render Layers (bottom → top)

1. Left / right **grass**
2. Left / right **sidewalk**
3. **Road surface** + lane dividers
4. **Coins** (pooled, `pointerEvents="none"`)
5. **Shield pickups** (pooled, `pointerEvents="none"`)
6. **Obstacles** (pooled)
7. **Player** + **ShieldBubble** + **ShieldBreakFlash**
8. **Controls**
9. **UI badge** — score/status/best (top left)
10. **UiLayer** — score + best (top left)
11. **HealthHud** — hearts + shield countdown (top center)
12. **PauseButton** — circular icon (top right)
12. **PauseOverlay** / **CountdownOverlay** / **CollisionFlashOverlay** / **GameOverOverlay**

### Player Sprite Alignment

The player motion anchor is the vehicle body center, not the raw PNG center. The default player skin is defined in `src/game/assets/definitions/player.assets.ts` as `PLAYER_CAR_DEFAULT`, including:

- `spriteWidth` / `spriteHeight` for the rendered PNG.
- `visualOffsetX` / `visualOffsetY` for placing the baked-shadow sprite from the body-centered world position.
- `collisionBox` for the vehicle body only.

`assets/voxel/CAR.png` includes the car and baked shadow in one image. Because the shadow extends left of the body, `PlayerCar` renders it as:

```txt
spriteX = playerWorldX + visualOffsetX
spriteY = playerWorldY + visualOffsetY
```

The current default uses a `116x140` sprite, `visualOffsetX: -72.52` (+3% sprite-width nudge right from `-76`), `visualOffsetY: -70`, and the unchanged `60x110` body collision box at `offsetX: -30`, `offsetY: -55`. Shadow pixels never affect lane centering, obstacle hits, shield pickups, coin collection, or any other gameplay collision.

### Crate Obstacle Sprite Alignment

The Crate obstacle keeps its **96×96** gameplay footprint, spawn dimensions, and `76×76` collision box unchanged. Only the presentation layer swaps to `assets/voxel/Crate.png` (`148×112`, baked shadow on the left).

`OBSTACLE_CRATE_SKIN` in `src/game/assets/definitions/obstacle.assets.ts` defines:

- `sourceBodyOffsetX: 56` / `sourceBodyOffsetY: 0` — original 92×100 body origin inside the merged PNG
- `visualOffsetX: -102` / `visualOffsetY: -50` — places the visible crate body at the same world center as before
- Render formula: `spriteX = obstacleWorldX + visualOffsetX`, `spriteY = obstacleWorldY + visualOffsetY`

Shadow pixels extend outside the 96×96 gameplay box but move with the crate because they are baked into the PNG. ObstacleSystem, spawn logic, render bridge, pooling, and collision code are untouched.

### Cone Obstacle Sprite Alignment

The Cone obstacle keeps its **48×48** gameplay footprint, spawn dimensions, and `32×36` collision box unchanged. Only the presentation layer swaps to `assets/voxel/Cone.png` (`138×118`, baked shadow on the left).

`OBSTACLE_CONE_SKIN` in `src/game/assets/definitions/obstacle.assets.ts` defines:

- `sourceBodyOffsetX: 53` / `sourceBodyOffsetY: 0` — original 85×92 body origin inside the merged PNG
- `visualOffsetX: -95.5` / `visualOffsetY: -46` — places the visible cone body at the same world center as before
- Render formula: `spriteX = obstacleWorldX + visualOffsetX`, `spriteY = obstacleWorldY + visualOffsetY`

Shadow pixels extend outside the 48×48 gameplay box but move with the cone because they are baked into the PNG. ObstacleSystem, spawn logic, render bridge, pooling, and collision code are untouched.

### Barrier Obstacle Sprite Alignment

The Barrier obstacle keeps its **96×80** gameplay footprint, spawn dimensions, and `76×56` collision box unchanged. Only the presentation layer swaps to `assets/voxel/Barrier.png` (`153×158`, baked shadow included).

`OBSTACLE_BARRIER_SKIN` in `src/game/assets/definitions/obstacle.assets.ts` defines:

- `sourceBodyOffsetX: 13` / `sourceBodyOffsetY: 0` — original 141×135 body origin inside the merged PNG
- `visualOffsetX: -83.5` / `visualOffsetY: -67.5` — places the visible barrier body at the same world center as before
- Render formula: `spriteX = obstacleWorldX + visualOffsetX`, `spriteY = obstacleWorldY + visualOffsetY`

Shadow pixels extend outside the 96×80 gameplay box but move with the barrier because they are baked into the PNG. ObstacleSystem, spawn logic, render bridge, pooling, and collision code are untouched.

### Tire Obstacle Sprite Alignment

The Tire obstacle keeps its **64×64** gameplay footprint, spawn dimensions, and `48×48` collision box unchanged. Only the presentation layer swaps to `assets/voxel/Tyre.png` (`144×95`, baked shadow on the left).

`OBSTACLE_TIRE_SKIN` in `src/game/assets/definitions/obstacle.assets.ts` defines:

- `sourceBodyOffsetX: 20` / `sourceBodyOffsetY: 0` — original 124×95 body origin inside the merged PNG
- `visualOffsetX: -82` / `visualOffsetY: -47.5` — places the visible tire body at the same world center as before
- Render formula: `spriteX = obstacleWorldX + visualOffsetX`, `spriteY = obstacleWorldY + visualOffsetY`

Shadow pixels extend outside the 64×64 gameplay box but move with the tire because they are baked into the PNG. ObstacleSystem, spawn logic, render bridge, pooling, and collision code are untouched.

### Puddle Obstacle Sprite Alignment

The Puddle obstacle keeps its **72×72** gameplay footprint, spawn dimensions, and `54×54` collision box unchanged. Only the presentation layer swaps to `assets/voxel/Puddle.png` (`138×67`, flat ground art).

`OBSTACLE_PUDDLE_SKIN` in `src/game/assets/definitions/obstacle.assets.ts` defines:

- `sourceBodyOffsetX: 33` / `sourceBodyOffsetY: 0` — 72×67 body region centered inside the merged PNG
- `visualOffsetX: -69` / `visualOffsetY: -33.5` — places the visible puddle body at the same world center as before
- Render formula: `spriteX = obstacleWorldX + visualOffsetX`, `spriteY = obstacleWorldY + visualOffsetY`

Wider art extends outside the 72×72 gameplay box but moves with the puddle. ObstacleSystem, spawn logic, render bridge, pooling, and collision code are untouched.

### Obstacle Visual Scale (presentation only)

Each obstacle skin defines a `visualScale` multiplier applied in `ObstacleSprite` via `transform: [{ scale }]`. Scaling uses the sprite view center, which matches the body center and obstacle world position — shadow offsets and alignment are unchanged.

| Obstacle | `visualScale` | Rendered size (W×H px) | Gameplay footprint |
|----------|---------------|------------------------|-------------------|
| Tire | **0.82** | 118 × 78 | 64×64 unchanged |
| Cone | **0.64** | 88 × 76 | 48×48 unchanged |
| Crate | **0.72** | 107 × 81 | 96×96 unchanged |
| Barrier | **0.54** | 83 × 85 | 96×80 unchanged |
| Puddle | **0.595** | 82 × 40 | 72×72 unchanged |

Collision boxes, spawn dimensions, lane positions, and spacing logic are untouched.

### Retry Integration

```
restartRun() → GameStatus.Countdown + resetNonce → GameEngine.reset()/stop() →
  CountdownOverlay → startPlaying() → GameEngine.start()
```

---

## Phase 5.1 — Game Start Countdown (Complete)

Phase 5.1 adds a pre-run countdown before gameplay begins.

### What You Can Run Today

- App launch and **Retry** both enter `GameStatus.Countdown` first
- Centered overlay shows **3 → 2 → 1 → GO!**
- Player input, obstacle spawning/movement, road scroll, and score timer remain paused until `GO!`
- Overlay unmounts automatically when status transitions to `Playing`
- Pause button stays hidden during countdown

### New Module

```txt
src/components/lane-game/
  overlays/CountdownOverlay.tsx   Centered 3-2-1-GO sequence + auto-start
src/game/config/game.config.ts    COUNTDOWN_CONFIG (stepDurationMs, goHoldMs)
```

### Countdown Flow

```
App launch / restartRun() → GameStatus.Countdown →
  CountdownOverlay (3 → 2 → 1 → GO!) → startPlaying() →
  GameStatus.Playing → GameEngine.start() + input enabled
```

### Execution Chain

```
UI (CountdownOverlay timer)
  → Zustand startPlaying()
  → useGameEngine syncEngineToStatus()
  → GameEngine.start() + setInputEnabled(true)
  → existing Phase 3–4 tick chain (obstacles, score, collision)
```

---

## Phase 5.2 — Score System Refactor (Complete)

Phase 5.2 replaces distance-based scoring with survival time scoring.

### What You Can Run Today

- Score increases by **+5 every 1 second** while `GameStatus.Playing`
- No score gain during **Countdown**, **Pause**, or **Game Over** (engine stopped → no survival time accumulated)
- Accumulator preserves partial seconds across pause/resume — no score drift or loss
- Best score and run distance persistence unchanged

### Scoring Rules

| Setting | Value |
|---------|-------|
| Points per interval | **+5** |
| Interval | **1000ms** active play time |
| Accumulator | Frame `deltaMs` summed; points awarded in whole intervals only |
| HUD publish | Throttled via `SCORE_CONFIG.hudUpdateIntervalMs` (100ms) |

### Execution Chain

```
GameEngine.tick(deltaMs) [Playing only]
  → ScoreSystem.addSurvivalTime(deltaMs)
  → accumulator += deltaMs
  → every 1000ms accumulated → currentScore += 5
  → publishScoreIfDue() → Zustand HUD
```

---

## Phase 5.3 — Coin → Score Pickup Refactor (Complete)

Phase 5.3 removes coin wallet/currency tracking. Coins remain spawnable collectibles that grant instant score.

### What You Can Run Today

- Collecting a coin adds **+20 score** immediately via `ScoreSystem.addPickupBonus()`
- Floating pickup feedback shows **`+20`** at collection position — each pickup spawns an independent floater
- Floaters hold at full opacity for **0.6s**, then fade out over **0.3s** with eased upward drift (~**0.9s** total readable time)
- No shared animation state between concurrent pickups
- No `runCoins` or `lifetimeCoins` in Zustand store
- No coin currency persisted to AsyncStorage
- Coin spawn, pool, movement, and collision collection unchanged

### Pickup Flow

```
GameEngine.evaluateCoinCollection()
  → CoinSystem.evaluateCollection() [unchanged]
  → removeCoinById()
  → ScoreSystem.addPickupBonus(COIN_CONFIG.scoreReward)
  → setScoreSnapshot() + triggerCoinCollect() + light haptic
```

### Config

| Setting | Value |
|---------|-------|
| `COIN_CONFIG.scoreReward` | **20** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.holdMs` | **600** (full opacity) |
| `FLOATING_SCORE_FEEDBACK_CONFIG.fadeMs` | **300** (eased fade-out) |
| `FLOATING_SCORE_FEEDBACK_CONFIG.floatPx` | **30** (upward drift) |

---

## Phase 5.4 — Obstacle Personality System (Complete)

Phase 5.4 introduced per-type collision resolution and floating score feedback. **Collision penalties are now defined in `OBSTACLE_PENALTY_CONFIG` (Phase 5.6).**

### What You Can Run Today

- Each obstacle type resolves to a configured **health loss** and **score penalty** (see Phase 5.6)
- Red floating **`-N`** feedback at the hit position when a score penalty applies
- Health-damage hits still trigger collision flash, damage blink, and collision SFX

### New Modules

```txt
src/game/systems/obstacle/
  obstacle-effect.resolver.ts      Maps obstacle type → collision penalties
src/components/lane-game/
  ui/FloatingScoreFeedbackLayer.tsx     Unified green + / red − floaters with vertical stacking
  ui/FloatingScoreLabel.tsx             Shared hold → fade → drift label
src/game/config/game.config.ts    OBSTACLE_PENALTY_CONFIG, OBSTACLE_PERSONALITY_CONFIG
```

### Effect Resolution Chain

```
CollisionSystem.evaluate() [unchanged]
  → GameEngine.handleObstacleHit()
  → resolveObstacleCollisionPenalty(assetId)
  → ScoreSystem.applyScorePenalty() when scorePenalty > 0 + triggerObstacleEffectFloater("-N")
  → HealthSystem.takeDamage(healthLoss) when healthLoss > 0 + collision flash / game over
```

### Config

| Setting | Value |
|---------|-------|
| `FLOATING_SCORE_FEEDBACK_CONFIG.holdMs` | **600** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.fadeMs` | **300** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.floatPx` | **30** |

---

## Phase 5.6 — Obstacle-Specific Collision Penalties (Complete)

Each obstacle type applies independent health loss and score penalty from a single config map.

### Penalty Table

| Obstacle | Health Loss | Score Penalty |
| -------- | ----------: | ------------: |
| Cone     |           0 |           -30 |
| Tyre     |           0 |           -40 |
| Crate    |           1 |           -20 |
| Barrier  |           2 |           -40 |
| Puddle   |           0 |           -25 |

- Score clamped to **≥ 0**; health clamped to **≥ 0**
- Score-only hits (Cone, Tyre, Puddle): floating `-N` label + light haptic
- Health hits (Crate, Barrier): also collision flash, damage blink, collision SFX, error haptic
- Combined hits apply both penalties in one collision; game over when health reaches 0

### Config

```ts
OBSTACLE_PENALTY_CONFIG = {
  OBSTACLE_CONE:    { healthLoss: 0, scorePenalty: 30 },
  OBSTACLE_TIRE:    { healthLoss: 0, scorePenalty: 40 },
  OBSTACLE_CRATE:   { healthLoss: 1, scorePenalty: 20 },
  OBSTACLE_BARRIER: { healthLoss: 2, scorePenalty: 40 },
  OBSTACLE_PUDDLE:  { healthLoss: 0, scorePenalty: 25 },
}
```

---

## Phase X.X — Floating Score Feedback Polish (Complete)

Improves readability and collision handling for `+N` / `−N` score popups without changing gameplay values or pooling.

### What You Can Run Today

- **Larger text** — `FLOATING_SCORE_FEEDBACK_CONFIG.fontSize` **26** (~30% larger than the previous 20px)
- **Readable timing** — **600ms** hold + **300ms** eased fade/drift (~**0.9s** total)
- **Visual clarity** — stronger drop shadow; green **`+N`** (`#34C759`), red **`−N`** (`#FF3B30`)
- **Vertical stacking** — simultaneous events within **20px** of the same anchor offset by **16px** instead of overlapping; spawn order preserved via monotonic `sequence`
- **Unified layer** — `FloatingScoreFeedbackLayer` renders coin and obstacle floaters inside the world camera (same coordinate space)

### Spawn / Stack Chain

```
GameEngine triggerCoinCollect() / triggerObstacleEffectFloater()
  → resolveFloatingScoreStackOffsetY() counts active floaters near (x, y)
  → Zustand appends floater with stackOffsetY + sequence
  → FloatingScoreFeedbackLayer merges both arrays, sorts by sequence
  → FloatingScoreLabel animates hold → eased fade + upward drift
  → dismissCoinScoreFloater() / dismissObstacleEffectFloater() on complete
```

### Config

| Setting | Value |
|---------|-------|
| `FLOATING_SCORE_FEEDBACK_CONFIG.fontSize` | **26** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.holdMs` | **600** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.fadeMs` | **300** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.floatPx` | **30** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.stackSpacingPx` | **16** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.positionTolerancePx` | **20** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.positiveColor` | **`#34C759`** |
| `FLOATING_SCORE_FEEDBACK_CONFIG.negativeColor` | **`#FF3B30`** |

### New Modules

```txt
src/game/store/
  floating-score-stack.ts          Near-anchor stack slot resolver
src/components/lane-game/ui/
  FloatingScoreFeedbackLayer.tsx   Unified renderer for coin + obstacle floaters
```

---

## Phase 5.7 — Scoring Guide Modal (Complete)

A minimal in-game reference for every collectible reward and obstacle penalty — accessible without interrupting gameplay state.

### What You Can Run Today

- **Pause screen** — **Resume** primary button + **ⓘ Scoring Guide** secondary button below
- **Game Over screen** — **Play Again** primary button + **ⓘ Scoring Guide** secondary button below
- **Modal** — compact card (~58% viewport height, max 460px), blur + dim overlay, scrollable on small screens, tap outside or **×** to dismiss
- **Layout** — three-column rows: **48×48** centered icon, bold title + muted subtitle, right-aligned inline penalties
- **Header** — bold **Scoring Guide** title, phosphor **×** close button (top-right), hairline divider
- **Sections** — `Collectibles` and `Obstacles` labels with extra whitespace between groups; hairline row dividers (no heavy card borders)
- **Typography** — rewards as green `+N`; penalties as large red `-N`; health `❤ -N` inline beside score on the same line (Crate, Barrier)
- **Data source** — `scoring-guide.content.ts` reads `COIN_CONFIG`, `SHIELD_CONFIG`, `SPEED_BOOST_CONFIG`, and `OBSTACLE_PENALTY_CONFIG` (no duplicated gameplay values)
- **Collectibles** — Coin, Shield (`Absorbs one hit · lasts 10s`), Speed Boost (`2× speed · lasts 3s`); durations sourced from config
- **Assets** — static voxel PNGs for all collectibles and obstacles in `assets/Voxel asset guide/` at fit scale inside **48×48** slots
- In-game sprites unchanged — gameplay atlases and obstacle skins untouched
- Game stays paused / game-over while the guide is open

### New Modules

```txt
src/game/content/
  scoring-guide.content.ts           Shared collectible + obstacle guide entries
src/game/assets/definitions/
  scoring-guide-voxel.assets.ts    Modal-only voxel PNG sources (not used in gameplay)
src/components/lane-game/scoring-guide/
  ScoringGuideModal.tsx              Compact three-column rows + inline penalties
  ScoringGuideButton.tsx             Secondary entry-point button
  ScoringGuideCoinIcon.tsx           Static Coin.png preview
  ScoringGuideShieldIcon.tsx         Static Sheld Guide.png preview
  ScoringGuideSpeedBoostIcon.tsx     Static Blue_Thunder_Asset.png preview
  ScoringGuideStaticIcon.tsx         Voxel obstacle PNG with shadow compensation
  ScoringGuideIconSlot.tsx           Shared 48×48 centered icon container
src/components/lane-game/coin/
  CoinAtlasSprite.tsx                Shared coin atlas viewport + clock
src/components/lane-game/shield/
  ShieldAtlasSprite.tsx              Shared shield atlas viewport (pickups + guide)
  ShieldSprite.tsx                   World-position wrapper → ShieldAtlasSprite
  shieldAnimationClock.ts            Shared UI-thread frame loop
src/components/lane-game/speed-boost/
  SpeedBoostAtlasSprite.tsx          Shared thunder atlas viewport (pickups + guide)
  SpeedBoostSprite.tsx               World-position wrapper → SpeedBoostAtlasSprite
  speedBoostAnimationClock.ts        Shared UI-thread frame loop
src/components/lane-game/atlas/
  AtlasSpriteViewport.tsx            Per-frame clip rect + atlas offset renderer
  useAtlasFrameImageStyle.ts         UI-thread image + clip styles
src/game/assets/
  texture-atlas.build.ts             TexturePacker hash layout builder (trim-aware per frame)
src/game/assets/
  texture-atlas.build.ts             Shared atlas frame/layout builders
  definitions/speed-boost-atlas.assets.ts  Thunder Animations texture.json/png
  definitions/shield-atlas.assets.ts       Shield Animations texture.json/png
src/components/lane-game/overlays/
  PauseOverlay.tsx                   Resume + Scoring Guide (updated)
  GameOverOverlay.tsx                Play Again + Scoring Guide (updated)
```

---

## Phase 5.5 — Speed Boost Power-Up (Complete)

Phase 5.5 adds a collectible ⚡ speed boost that temporarily doubles world scroll speed and score gain rate.

### What You Can Run Today

- **Speed Boost pickups** spawn independently (44×44 looping **Thunder Animations** atlas via shared `SpeedBoostAtlasSprite`, pooled Reanimated slots, obstacle/coin/shield-safe placement)
- **Collection** activates a **3 second** boost — world speed ×2 and score rate ×2 (`+10/sec` instead of `+5/sec`)
- Re-picking during an active boost **refreshes duration** to 3s (no infinite stack)
- Boost ends automatically — speed and score rate revert to baseline
- **HUD** shows Blue Thunder icon, countdown seconds, and shrinking progress bar while active

### New Modules

```txt
src/game/systems/speed-boost/
  SpeedBoostSystem.ts              Spawn, pool, move, collection probes
  SpeedBoostRuntime.ts             Active boost timer + multipliers
  speed-boost-motion.types.ts      Reanimated render bridge
src/game/assets/definitions/
  speed-boost.assets.ts            44×44 hitbox + HUD static icon
  speed-boost-atlas.assets.ts      Thunder Animations texture.json/png
src/components/lane-game/
  speed-boost/SpeedBoostAtlasSprite.tsx Shared thunder atlas viewport
  speed-boost/SpeedBoostSprite.tsx      World-position wrapper → atlas sprite
  speed-boost/speedBoostAnimationClock.ts Shared frame loop (18.85 FPS)
  layers/SpeedBoostLayer.tsx       Starts atlas clock on mount
  ui/SpeedBoostHud.tsx             Static Blue Thunder HUD icon + timer + progress bar
```

### Boost Flow

```
GameEngine.tick()
  → SpeedBoostRuntime.update(deltaMs)
  → effectiveSpeed = difficulty.speed × speedMultiplier
  → scoreRateMultiplier applied in ScoreSystem.addSurvivalTime()
  → evaluateSpeedBoostCollection() → SpeedBoostRuntime.activate() [refresh timer]
```

### Config

| Setting | Value |
|---------|-------|
| `SPEED_BOOST_CONFIG.durationMs` | **3000** |
| `SPEED_BOOST_CONFIG.speedMultiplier` | **2** |
| `SPEED_BOOST_CONFIG.scoreRateMultiplier` | **2** |

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
| **ObstacleSystem** | Spawn bag type pick, pool, move, fair lane gaps, coin/shield-safe spawn | ✅ |
| **CollisionSystem** | Lane + Y overlap detection | ✅ |
| **HealthSystem** | 3-health pool, 1000ms invulnerability | ✅ |
| **CoinSystem** | Independent spawn, pool, move, obstacle-safe placement, collection | ✅ |
| **ScoreSystem** | Time-based +5/sec scoring, best score | ✅ |
| **AudioManager** | Preloaded SFX (lane, collision, game over) | ✅ |
| **Persistence** | Best score, total runs, total distance | ✅ |
| **Zustand store** | Status + score + health + run coins + run stats + damage flash | ✅ |
| **DecorationSystem** | Cosmetic roadside trees on grass strips (pooled, no collision) | ✅ |

**Not implemented yet:** settings persistence UI.

### Roadside Tree Decorations (cosmetic only)

```txt
src/game/systems/decoration/
  DecorationSystem.ts              Spawn, pool, move, despawn (grass strips only)
  decoration-motion.types.ts       Dedicated render bridge (32 slots)
src/game/assets/definitions/
  decoration.assets.ts             TREE_SKIN + Tree.png (233×209 source)
src/game/config/
  decoration.config.ts             spawnIntervalMs: 400, minVerticalGapPx: 175, base 234×218
src/components/lane-game/
  decoration/TreeSprite.tsx          Memoized tree render (skin + instance scale)
  layers/DecorationLayer.tsx         Top of world stack in GameScreen (above player)
```

- **Pre-seeded at initialize:** `seedInitialTrees()` fills the full Y range (`spawnY` → `despawnY`) before countdown so the roadside is populated from frame one; runtime spawn/despawn continues normally after
- Trees spawn on **left/right grass only** — never on the road
- Trunk bounds clamped via `TREE_SKIN.trunkHalfWidthPx` inside the 56px grass band — canopy may overflow; left-side trees shifted **`+16px`** toward the road via `leftTreeRoadwardOffsetPx` (trunk re-clamped to grass)
- Default render size **234×218** (+30% vs 180×168) with **±10%** instance scale variation (`0.9–1.1`)
- Density tuning: **`spawnIntervalMs: 400`**, **`minVerticalGapPx: 175`** (~1.75× spawn rate vs 700ms config; ~1.4× more roadside trees on screen)
- **No collision**, no obstacle/coin/shield interaction, separate render bridge from obstacles
- ObstacleSystem, spawn bag, obstacle render bridge, pooling, and collision code are **untouched**

### Lane System

| Lane | Index | Notes |
|------|-------|-------|
| Left | 0 | Left boundary — further left taps ignored |
| Center | 1 | Spawn lane |
| Right | 2 | Right boundary — further right taps ignored |

- Lane width: **100px** · Road width: **300px** · Player car: **80×140**
- **Voxel road strips** — `assets/voxel/R_1.png` (start), `R_2.png` / `R_3.png` (loop); native **225×869**, rendered at **300×1159** per segment; lane markings baked in (procedural dividers off when `ROAD_IMAGE.useVoxelArtwork` is true)
- Centers computed once via `createGameLayout()` → `LaneSystem.getCenterX()`
- `PlayerSystem.tryLaneChange()` uses `resolveLaneChange()` — single source of lane math

### Voxel Road, Sidewalk & Grass Art (active test)

```txt
assets/voxel/
  R_1.png                            Start road segment (once per run)
  R_2.png                            Road loop variant A
  R_3.png                            Road loop variant B
  Side_L.png                         Left sidewalk (40×1159)
  Side_R.png                         Right sidewalk (40×1159)
  Grass.png                          Left/right grass (native 28×843 → display 56×1686)
src/components/lane-game/road/
  RoadImageColumn.tsx                Road scroll column
  SidewalkImageColumn.tsx            Left/right sidewalk scroll columns
  GrassImageColumn.tsx               Left/right grass scroll columns
src/game/assets/definitions/
  road.assets.ts                     Road + sidewalk + grass image sources
src/game/config/
  road.config.ts                     ROAD_IMAGE + GRASS_IMAGE sizing
```

**Scroll chain:** `RoadSystem.updateScroll()` → `scrollY` shared value → `RoadImageColumn` / `SidewalkImageColumn` / `GrassImageColumn` apply `translateY: +scrollY` with segments stacked upward.

- `R_1` plays once at run start; loop tiles (`R_2` / `R_3`) never repeat the start PNG after segment index 0
- Sidewalks: `Side_L` / `Side_R` at **40×1159** (matches road segment height)
- Grass: `Grass.png` on both sides — native **28×843**, rendered at **56×1686**
- Procedural lane dividers disabled while `ROAD_IMAGE.useVoxelArtwork === true`
- Toggle `ROAD_IMAGE.useVoxelArtwork` to `false` in `road.config.ts` to revert to procedural strips

### Input Architecture

All movement flows through **`InputManager.requestLaneChange(direction, source)`**:

```
ControlButton / LaneSwipeSurface → InputManager.requestLaneChange(direction, source)
                                  → PlayerSystem.tryLaneChange()
                                  → PlayerMotionController.animateToLane()
                                  → expo-haptics (on success)
```

- **Button controls** (`source: 'button'`) — unchanged bottom-corner arrows
- **Swipe controls** (`source: 'swipe'`) — horizontal pan on playfield; min **60px** travel, horizontal movement must exceed vertical by **1.5×**; one lane per swipe; boundary swipes ignored
- Input enabled only when `GameStatus.Playing` (disabled during `Countdown`, pause, game over)
- Debounce: **50ms** between accepted requests (shared by buttons and swipes)

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
3. **Road surface** — voxel PNG strips or procedural fill (+ lane dividers when voxel off)
4. **Pickups** — coins, shields, speed boosts
5. **Obstacles** (pooled)
6. **Player** (animated X + tilt)
7. **Roadside trees** (DecorationLayer — cosmetic, top of world stack)
8. **Controls** (lane buttons)
9. **UI** — status + score badge (top center)
10. **PauseButton** — top-right circular icon
11. **GameOverOverlay** — score, best, Play Again

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
