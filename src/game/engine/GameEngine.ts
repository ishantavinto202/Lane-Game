import type { SharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ENGINE_CONFIG, GAME_CONFIG, HEALTH_CONFIG, SCORE_CONFIG } from '../config';
import { playerStatsPersistence } from '../persistence/player-stats.persistence';
import { useGameStore } from '../store';
import type { AudioManagerContract } from '../systems/audio/audio.contract';
import type { CollisionEvent } from '../types';
import type { GameLayout, LaneDirection } from '../types';
import { GameStatus } from '../types';
import { evaluateDifficulty } from '../utils/difficulty';
import {
  CollisionSystem,
  createObstacleCollisionProbes,
  createPlayerCollisionProbe,
} from '../systems/collision/CollisionSystem';
import { HealthSystem } from '../systems/health/HealthSystem';
import { InputManager } from '../systems/input/InputManager';
import { InputManagerAudioBridge } from '../systems/audio/InputManagerAudioBridge';
import { LaneSystem } from '../systems/lane/LaneSystem';
import {
  PlayerMotionController,
  type PlayerMotionSharedValues,
} from '../systems/player/PlayerMotionController';
import { PlayerSystem, type PlayerSnapshot } from '../systems/player/PlayerSystem';
import { ObstacleSystem } from '../systems/obstacle/ObstacleSystem';
import type { ObstacleRenderBridge } from '../systems/obstacle/obstacle-motion.types';
import {
  CoinSystem,
  createCoinCollisionProbes,
} from '../systems/coin/CoinSystem';
import type { CoinRenderBridge } from '../systems/coin/coin-motion.types';
import {
  ShieldSystem,
  createShieldCollisionProbes,
} from '../systems/shield/ShieldSystem';
import type { ShieldRenderBridge } from '../systems/shield/shield-motion.types';
import { RoadSystem } from '../systems/road/RoadSystem';
import { ScoreSystem } from '../systems/score/ScoreSystem';

import type { InputSource } from '../systems/input/input.types';

export interface GameEngineOptions {
  readonly layout: GameLayout;
  readonly scrollY: SharedValue<number>;
  readonly playerMotion: PlayerMotionSharedValues;
  readonly obstacleRenderBridge: ObstacleRenderBridge;
  readonly coinRenderBridge: CoinRenderBridge;
  readonly shieldRenderBridge: ShieldRenderBridge;
  readonly audioManager: AudioManagerContract;
}

/** Central orchestrator — Phase 4.3A: shield power-up. */
export class GameEngine {
  readonly laneSystem = new LaneSystem();
  readonly roadSystem: RoadSystem;
  readonly playerSystem = new PlayerSystem();
  readonly obstacleSystem: ObstacleSystem;
  readonly coinSystem: CoinSystem;
  readonly shieldSystem: ShieldSystem;
  readonly collisionSystem = new CollisionSystem();
  readonly scoreSystem = new ScoreSystem();
  readonly healthSystem = new HealthSystem();
  readonly motionController: PlayerMotionController;
  readonly inputManager: InputManager;
  readonly inputBridge: InputManagerAudioBridge;

  private readonly audioManager: AudioManagerContract;
  private layout: GameLayout | null = null;
  private rafId: number | null = null;
  private lastTimestamp: number | null = null;
  private running = false;
  private elapsedMs = 0;
  private lastScoreHudUpdateMs = 0;
  private gameOverTriggered = false;
  private runCoins = 0;

  constructor(options: GameEngineOptions) {
    this.audioManager = options.audioManager;
    this.roadSystem = new RoadSystem({ scrollY: options.scrollY });
    this.obstacleSystem = new ObstacleSystem(options.obstacleRenderBridge);
    this.coinSystem = new CoinSystem(options.coinRenderBridge);
    this.shieldSystem = new ShieldSystem(options.shieldRenderBridge);
    this.motionController = new PlayerMotionController(options.playerMotion);
    this.inputManager = new InputManager({
      playerSystem: this.playerSystem,
      laneSystem: this.laneSystem,
      motionController: this.motionController,
    });
    this.inputBridge = new InputManagerAudioBridge(this.inputManager, this.audioManager);
    this.initialize(options.layout);
    void this.loadPersistedStats();
  }

  initialize(layout: GameLayout): void {
    this.layout = layout;
    this.laneSystem.initialize(layout);
    this.playerSystem.initialize(layout, this.laneSystem);
    this.obstacleSystem.initialize(layout, this.laneSystem);
    this.coinSystem.initialize(layout, this.laneSystem);
    this.shieldSystem.initialize(layout, this.laneSystem);
    this.inputManager.initialize(layout);
    this.roadSystem.setSpeed(ENGINE_CONFIG.baseScrollSpeedPxPerSec);
    this.roadSystem.reset();
    this.playerSystem.reset();
    this.obstacleSystem.reset();
    this.coinSystem.reset();
    this.shieldSystem.reset();
    this.collisionSystem.reset();
    this.scoreSystem.reset();
    this.healthSystem.reset();
    this.motionController.initialize(layout, this.playerSystem.getLane());
    this.elapsedMs = 0;
    this.lastScoreHudUpdateMs = 0;
    this.gameOverTriggered = false;
    this.runCoins = 0;
    useGameStore.getState().setHealth(HEALTH_CONFIG.maxHealth);
    useGameStore.getState().setRunCoins(0);
    useGameStore.getState().clearShieldState();
  }

  getLayout(): GameLayout | null {
    return this.layout;
  }

  getPlayerSnapshot(): PlayerSnapshot {
    return this.playerSystem.getSnapshot();
  }

  setInputEnabled(enabled: boolean): void {
    this.inputBridge.setEnabled(enabled);
  }

  requestLaneChange(direction: LaneDirection, source: InputSource = 'button'): boolean {
    return this.inputBridge.requestLaneChange(direction, source);
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTimestamp = null;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastTimestamp = null;
  }

  reset(): void {
    this.roadSystem.reset();
    this.roadSystem.setSpeed(ENGINE_CONFIG.baseScrollSpeedPxPerSec);
    this.inputBridge.reset();
    this.obstacleSystem.reset();
    this.coinSystem.reset();
    this.shieldSystem.reset();
    this.collisionSystem.reset();
    this.scoreSystem.reset();
    this.healthSystem.reset();
    this.gameOverTriggered = false;
    this.elapsedMs = 0;
    this.lastScoreHudUpdateMs = 0;
    this.runCoins = 0;

    if (this.layout) {
      this.motionController.reset(this.layout, this.playerSystem.getLane());
    }

    useGameStore.getState().setScoreSnapshot({
      currentScore: 0,
      bestScore: this.scoreSystem.getSnapshot().bestScore,
      distanceTraveled: 0,
    });
    useGameStore.getState().setHealth(HEALTH_CONFIG.maxHealth);
    useGameStore.getState().setRunCoins(0);
    useGameStore.getState().clearShieldState();
  }

  dispose(): void {
    this.stop();
    this.roadSystem.dispose();
    this.obstacleSystem.dispose();
    this.coinSystem.dispose();
    this.shieldSystem.dispose();
    this.collisionSystem.reset();
    this.healthSystem.reset();
    this.motionController.dispose();
    this.inputBridge.dispose();
    this.playerSystem.dispose();
    this.laneSystem.dispose();
    this.layout = null;
  }

  private async loadPersistedStats(): Promise<void> {
    const stats = await playerStatsPersistence.loadPlayerStats();
    this.scoreSystem.loadFromStats(stats);
    useGameStore.getState().setScoreSnapshot(this.scoreSystem.getSnapshot());
    useGameStore.getState().setRunStats({
      totalRuns: stats.totalRuns,
      totalDistance: stats.totalDistance,
    });
    useGameStore.getState().setLifetimeCoins(stats.lifetimeCoins);
  }

  private tick = (timestamp: number): void => {
    if (!this.running || !this.layout) {
      return;
    }

    const deltaMs =
      this.lastTimestamp === null
        ? 0
        : Math.min(timestamp - this.lastTimestamp, ENGINE_CONFIG.maxDeltaMs);
    this.lastTimestamp = timestamp;

    if (deltaMs <= 0) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    this.elapsedMs += deltaMs;
    this.healthSystem.update(deltaMs);
    const difficulty = evaluateDifficulty(this.elapsedMs);
    this.roadSystem.setSpeed(difficulty.speedPxPerSec);

    this.roadSystem.updateScroll(deltaMs);

    const scrollDeltaPx = (difficulty.speedPxPerSec * deltaMs) / 1000;
    const activeCoinsBeforeObstacles = this.coinSystem.getActiveCoins();
    const activeShields = this.shieldSystem.getActiveShields();
    const obstacles = this.obstacleSystem.updateObstacles(
      deltaMs,
      difficulty.speedPxPerSec,
      activeCoinsBeforeObstacles,
      activeShields,
    );
    this.coinSystem.updateCoins(deltaMs, difficulty.speedPxPerSec, obstacles, activeShields);
    const activeCoins = this.coinSystem.getActiveCoins();
    this.shieldSystem.updateShields(deltaMs, difficulty.speedPxPerSec, obstacles, activeCoins);
    const scoreSnapshot = this.scoreSystem.addDistance(scrollDeltaPx, difficulty);
    this.publishScoreIfDue(scoreSnapshot, deltaMs);

    const playerLane = this.playerSystem.getLane();
    const playerX = this.laneSystem.getCenterX(playerLane);
    const playerProbe = createPlayerCollisionProbe(
      'player',
      playerLane,
      playerX,
      this.layout.playerY,
    );

    this.evaluateCoinCollection(playerProbe);
    this.evaluateShieldCollection(playerProbe);

    if (!this.gameOverTriggered && !this.healthSystem.isInvulnerable()) {
      const obstacleProbes = createObstacleCollisionProbes(obstacles);
      const collision = this.collisionSystem.evaluate(playerProbe, obstacleProbes);

      if (collision) {
        if (useGameStore.getState().shieldActive) {
          this.handleShieldAbsorb(collision);
        } else {
          this.handleObstacleHit(collision);
        }
      }
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private publishScoreIfDue(
    snapshot: ReturnType<ScoreSystem['getSnapshot']>,
    deltaMs: number,
  ): void {
    this.lastScoreHudUpdateMs += deltaMs;

    if (this.lastScoreHudUpdateMs < SCORE_CONFIG.hudUpdateIntervalMs) {
      return;
    }

    this.lastScoreHudUpdateMs = 0;
    useGameStore.getState().setScoreSnapshot(snapshot);
  }

  private handleShieldAbsorb(collision: CollisionEvent): void {
    if (this.gameOverTriggered || !useGameStore.getState().shieldActive) {
      return;
    }

    this.obstacleSystem.removeObstacleById(collision.obstacleId);
    useGameStore.getState().triggerShieldBreak();

    if (GAME_CONFIG.enableHaptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  private handleObstacleHit(collision: CollisionEvent): void {
    if (this.gameOverTriggered || this.healthSystem.isInvulnerable()) {
      return;
    }

    this.obstacleSystem.removeObstacleById(collision.obstacleId);
    const healthSnapshot = this.healthSystem.takeDamage();

    useGameStore.getState().setHealth(healthSnapshot.current);
    useGameStore.getState().triggerCollisionFlash();
    useGameStore.getState().triggerDamageBlink();

    this.audioManager.playCollision();

    if (GAME_CONFIG.enableHaptics) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    if (healthSnapshot.current <= 0) {
      this.handleGameOver();
    }
  }

  private handleGameOver(): void {
    if (this.gameOverTriggered) {
      return;
    }

    this.gameOverTriggered = true;
    this.stop();

    const previousBest = this.scoreSystem.getSnapshot().bestScore;
    const finalSnapshot = this.scoreSystem.resolveBestScore();
    const isNewBest = finalSnapshot.currentScore > previousBest && finalSnapshot.currentScore > 0;

    useGameStore.setState({
      status: GameStatus.GameOver,
      scoreSnapshot: finalSnapshot,
    });

    this.audioManager.playGameOver();

    if (GAME_CONFIG.enableHaptics) {
      if (isNewBest) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    if (SCORE_CONFIG.persistBestScoreImmediately) {
      void playerStatsPersistence.persistRunEnd(finalSnapshot, this.runCoins).then((stats) => {
        useGameStore.getState().setRunStats({
          totalRuns: stats.totalRuns,
          totalDistance: stats.totalDistance,
        });
        useGameStore.getState().setLifetimeCoins(stats.lifetimeCoins);
      });
    }
  }

  private evaluateCoinCollection(
    playerProbe: ReturnType<typeof createPlayerCollisionProbe>,
  ): void {
    const activeCoins = this.coinSystem.getActiveCoins();
    const coinProbes = createCoinCollisionProbes(activeCoins);
    const collectedIds = this.coinSystem.evaluateCollection(playerProbe, coinProbes);

    if (collectedIds.length === 0) {
      return;
    }

    for (const coinId of collectedIds) {
      const position = this.coinSystem.removeCoinById(coinId);
      if (!position) {
        continue;
      }

      this.runCoins += 1;
      useGameStore.getState().setRunCoins(this.runCoins);
      useGameStore.getState().triggerCoinCollect(position.x, position.y);

      if (GAME_CONFIG.enableHaptics) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }

  private evaluateShieldCollection(
    playerProbe: ReturnType<typeof createPlayerCollisionProbe>,
  ): void {
    if (useGameStore.getState().shieldActive) {
      return;
    }

    const activeShields = this.shieldSystem.getActiveShields();
    const shieldProbes = createShieldCollisionProbes(activeShields);
    const collectedIds = this.shieldSystem.evaluateCollection(playerProbe, shieldProbes);

    if (collectedIds.length === 0) {
      return;
    }

    for (const shieldId of collectedIds) {
      const position = this.shieldSystem.removeShieldById(shieldId);
      if (!position) {
        continue;
      }

      useGameStore.getState().setShieldActive(true);

      if (GAME_CONFIG.enableHaptics) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }
}
