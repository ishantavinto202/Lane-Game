import { memo, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';

import { WORLD_CAMERA_SCALE } from '@/src/game/constants';
import { ROAD_COLORS } from '@/src/game/config';

import { ControlsLayer } from '../layers/ControlsLayer';
import { CoinLayer } from '../layers/CoinLayer';
import { ShieldLayer } from '../layers/ShieldLayer';
import { ObstacleLayer } from '../layers/ObstacleLayer';
import { PlayerLayer } from '../layers/PlayerLayer';
import { RoadLayer } from '../layers/RoadLayer';
import { UiLayer } from '../layers/UiLayer';
import { HealthHud } from '../ui/HealthHud';
import { PauseButton } from '../controls/PauseButton';
import { CollisionFlashOverlay } from '../overlays/CollisionFlashOverlay';
import { GameOverOverlay } from '../overlays/GameOverOverlay';
import { PauseOverlay } from '../overlays/PauseOverlay';
import { useGameEngine, useGameLayout } from '../hooks/useGameEngine';

function GameScreenComponent() {
  const layout = useGameLayout();
  const {
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
  } = useGameEngine(layout);

  const rootStyle = useMemo<ViewStyle>(
    () => ({
      flex: 1,
      backgroundColor: ROAD_COLORS.grassA,
      overflow: 'hidden',
    }),
    [],
  );

  /** Single scale from top-center — road stays horizontally centered, scroll stays smooth. */
  const worldCameraStyle = useMemo<ViewStyle>(
    () => ({
      flex: 1,
      overflow: 'visible',
      transform: [{ scale: WORLD_CAMERA_SCALE }],
      transformOrigin: '50% 0%',
    }),
    [],
  );

  return (
    <View style={rootStyle}>
      <View style={worldCameraStyle}>
        <RoadLayer layout={layout} scrollY={scrollY} />
        <CoinLayer renderBridge={coinRenderBridge} poolRevision={coinPoolRevision} />
        <ShieldLayer renderBridge={shieldRenderBridge} poolRevision={shieldPoolRevision} />
        <ObstacleLayer renderBridge={obstacleRenderBridge} poolRevision={obstaclePoolRevision} />
        <PlayerLayer motion={playerMotion} snapshot={playerSnapshot} />
        <ControlsLayer inputManagerRef={inputManagerRef} />
      </View>
      <UiLayer />
      <HealthHud />
      <PauseButton />
      <PauseOverlay />
      <CollisionFlashOverlay />
      <GameOverOverlay />
    </View>
  );
}

export const GameScreen = memo(GameScreenComponent);
export default GameScreen;
