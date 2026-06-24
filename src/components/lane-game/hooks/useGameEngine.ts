import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useWindowDimensions } from 'react-native';
import { makeMutable, useSharedValue } from 'react-native-reanimated';

import { PLAYER_CAR_ASSET } from '@/src/game/assets';
import { GAME_CONSTANTS, POOL_CONSTANTS } from '@/src/game/constants';
import { GameEngine } from '@/src/game/engine';
import { AudioManager } from '@/src/game/systems/audio/AudioManager';
import type { InputManager } from '@/src/game/systems/input/InputManager';
import type { ObstacleRenderBridge } from '@/src/game/systems/obstacle/obstacle-motion.types';
import type { CoinRenderBridge } from '@/src/game/systems/coin/coin-motion.types';
import type { ShieldRenderBridge } from '@/src/game/systems/shield/shield-motion.types';
import type { SpeedBoostRenderBridge } from '@/src/game/systems/speed-boost/speed-boost-motion.types';
import type { PlayerMotionSharedValues } from '@/src/game/systems/player/PlayerMotionController';
import type { PlayerSnapshot } from '@/src/game/systems/player/PlayerSystem';
import { gameStoreSelectors, useGameStore } from '@/src/game/store';
import type { GameLayout } from '@/src/game/types';
import { GameStatus } from '@/src/game/types';
import { createGameLayout } from '@/src/game/utils/layout';

function syncEngineToStatus(engine: GameEngine, status: GameStatus): void {
  const isRunning = status === GameStatus.Playing;
  engine.setInputEnabled(isRunning);

  if (isRunning) {
    engine.start();
    return;
  }

  engine.stop();

  if (status === GameStatus.Ready) {
    engine.reset();
  }
}

function buildObstacleRenderBridge(onRevisionChange: () => void): ObstacleRenderBridge {
  const slots = Array.from({ length: POOL_CONSTANTS.MAX_OBSTACLES }, () => ({
    x: makeMutable(0),
    y: makeMutable(0),
    opacity: makeMutable(0),
    active: false,
    assetId: null as ObstacleRenderBridge['slots'][number]['assetId'],
    width: 0,
    height: 0,
  }));

  return {
    slots,
    revision: { current: 0 },
    onRevisionChange,
  };
}

function hasTopLevelObstacleMetadata(renderBridge: ObstacleRenderBridge): boolean {
  const [firstSlot] = renderBridge.slots;
  return !firstSlot || 'active' in firstSlot;
}

function buildCoinRenderBridge(onRevisionChange: () => void): CoinRenderBridge {
  const slots = Array.from({ length: POOL_CONSTANTS.MAX_COINS }, () => ({
    x: makeMutable(0),
    y: makeMutable(0),
    opacity: makeMutable(0),
    meta: {
      active: false,
      width: 0,
      height: 0,
    },
  }));

  return {
    slots,
    revision: { current: 0 },
    onRevisionChange,
  };
}

function buildShieldRenderBridge(onRevisionChange: () => void): ShieldRenderBridge {
  const slots = Array.from({ length: POOL_CONSTANTS.MAX_SHIELDS }, () => ({
    x: makeMutable(0),
    y: makeMutable(0),
    opacity: makeMutable(0),
    meta: {
      active: false,
      width: 0,
      height: 0,
    },
  }));

  return {
    slots,
    revision: { current: 0 },
    onRevisionChange,
  };
}

function buildSpeedBoostRenderBridge(onRevisionChange: () => void): SpeedBoostRenderBridge {
  const slots = Array.from({ length: POOL_CONSTANTS.MAX_SPEED_BOOSTS }, () => ({
    x: makeMutable(0),
    y: makeMutable(0),
    opacity: makeMutable(0),
    meta: {
      active: false,
      width: 0,
      height: 0,
    },
  }));

  return {
    slots,
    revision: { current: 0 },
    onRevisionChange,
  };
}

export interface UseGameEngineResult {
  readonly layout: GameLayout;
  readonly scrollY: ReturnType<typeof useSharedValue<number>>;
  readonly playerMotion: PlayerMotionSharedValues;
  readonly playerSnapshot: PlayerSnapshot;
  readonly inputManagerRef: RefObject<InputManager | null>;
  readonly obstacleRenderBridge: ObstacleRenderBridge;
  readonly obstaclePoolRevision: number;
  readonly coinRenderBridge: CoinRenderBridge;
  readonly coinPoolRevision: number;
  readonly shieldRenderBridge: ShieldRenderBridge;
  readonly shieldPoolRevision: number;
  readonly speedBoostRenderBridge: SpeedBoostRenderBridge;
  readonly speedBoostPoolRevision: number;
}

export function useGameLayout(): GameLayout {
  const { width, height } = useWindowDimensions();
  return useMemo(() => createGameLayout(width, height), [width, height]);
}

export function useGameEngine(layout: GameLayout): UseGameEngineResult {
  const scrollY = useSharedValue(0);
  const playerX = useSharedValue(layout.laneCenters[GAME_CONSTANTS.PLAYER_SPAWN_LANE]);
  const playerY = useSharedValue(layout.playerY);
  const playerTilt = useSharedValue(0);
  const engineRef = useRef<GameEngine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const status = useGameStore(gameStoreSelectors.status);
  const resetNonce = useGameStore(gameStoreSelectors.resetNonce);
  const [obstaclePoolRevision, setObstaclePoolRevision] = useState(0);
  const [coinPoolRevision, setCoinPoolRevision] = useState(0);
  const [shieldPoolRevision, setShieldPoolRevision] = useState(0);
  const [speedBoostPoolRevision, setSpeedBoostPoolRevision] = useState(0);

  const handleObstaclePoolRevision = useCallback(() => {
    setObstaclePoolRevision((value) => value + 1);
  }, []);

  const handleCoinPoolRevision = useCallback(() => {
    setCoinPoolRevision((value) => value + 1);
  }, []);

  const handleShieldPoolRevision = useCallback(() => {
    setShieldPoolRevision((value) => value + 1);
  }, []);

  const handleSpeedBoostPoolRevision = useCallback(() => {
    setSpeedBoostPoolRevision((value) => value + 1);
  }, []);

  const obstacleRenderBridgeRef = useRef<ObstacleRenderBridge | null>(null);
  if (
    !obstacleRenderBridgeRef.current ||
    !hasTopLevelObstacleMetadata(obstacleRenderBridgeRef.current)
  ) {
    obstacleRenderBridgeRef.current = buildObstacleRenderBridge(handleObstaclePoolRevision);
  }
  const obstacleRenderBridge = obstacleRenderBridgeRef.current;
  obstacleRenderBridge.onRevisionChange = handleObstaclePoolRevision;

  const coinRenderBridgeRef = useRef<CoinRenderBridge | null>(null);
  if (!coinRenderBridgeRef.current) {
    coinRenderBridgeRef.current = buildCoinRenderBridge(handleCoinPoolRevision);
  }
  const coinRenderBridge = coinRenderBridgeRef.current;
  coinRenderBridge.onRevisionChange = handleCoinPoolRevision;

  const shieldRenderBridgeRef = useRef<ShieldRenderBridge | null>(null);
  if (!shieldRenderBridgeRef.current) {
    shieldRenderBridgeRef.current = buildShieldRenderBridge(handleShieldPoolRevision);
  }
  const shieldRenderBridge = shieldRenderBridgeRef.current;
  shieldRenderBridge.onRevisionChange = handleShieldPoolRevision;

  const speedBoostRenderBridgeRef = useRef<SpeedBoostRenderBridge | null>(null);
  if (!speedBoostRenderBridgeRef.current) {
    speedBoostRenderBridgeRef.current = buildSpeedBoostRenderBridge(handleSpeedBoostPoolRevision);
  }
  const speedBoostRenderBridge = speedBoostRenderBridgeRef.current;
  speedBoostRenderBridge.onRevisionChange = handleSpeedBoostPoolRevision;

  const playerMotion = useMemo<PlayerMotionSharedValues>(
    () => ({
      x: playerX,
      y: playerY,
      tilt: playerTilt,
    }),
    [playerX, playerY, playerTilt],
  );

  const playerSnapshot = useMemo<PlayerSnapshot>(
    () => ({
      y: layout.playerY,
      lane: GAME_CONSTANTS.PLAYER_SPAWN_LANE,
      width: PLAYER_CAR_ASSET.width,
      height: PLAYER_CAR_ASSET.height,
    }),
    [layout.playerY],
  );

  useEffect(() => {
    const audioManager = new AudioManager();
    audioManagerRef.current = audioManager;
    void audioManager.preload();

    const engine = new GameEngine({
      layout,
      scrollY,
      playerMotion,
      obstacleRenderBridge,
      coinRenderBridge,
      shieldRenderBridge,
      speedBoostRenderBridge,
      audioManager,
    });
    engineRef.current = engine;
    inputManagerRef.current = engine.inputBridge as unknown as InputManager;

    syncEngineToStatus(engine, useGameStore.getState().status);

    return () => {
      engine.dispose();
      audioManager.dispose();
      engineRef.current = null;
      inputManagerRef.current = null;
      audioManagerRef.current = null;
    };
  }, [layout, coinRenderBridge, shieldRenderBridge, speedBoostRenderBridge, obstacleRenderBridge, playerMotion, scrollY]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    syncEngineToStatus(engine, status);
  }, [status]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || resetNonce === 0) {
      return;
    }

    engine.reset();
    engine.setInputEnabled(false);
    engine.stop();
  }, [resetNonce]);

  return {
    layout,
    scrollY,
    playerMotion,
    playerSnapshot,
    inputManagerRef,
    obstacleRenderBridge,
    obstaclePoolRevision,
    coinRenderBridge,
    coinPoolRevision,
    shieldRenderBridge,
    shieldPoolRevision,
    speedBoostRenderBridge,
    speedBoostPoolRevision,
  };
}
