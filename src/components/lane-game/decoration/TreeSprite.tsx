import { memo } from 'react';
import { Image } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { TREE_SKIN } from '@/src/game/assets/definitions/decoration.assets';

const TREE_VISUAL_OFFSET_X = TREE_SKIN.visualOffsetX;
const TREE_VISUAL_OFFSET_Y = TREE_SKIN.visualOffsetY;
const TREE_SPRITE_WIDTH = TREE_SKIN.spriteWidth;
const TREE_SPRITE_HEIGHT = TREE_SKIN.spriteHeight;
const TREE_BASE_VISUAL_SCALE = TREE_SKIN.visualScale;

export interface TreeSpriteProps {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly opacity: SharedValue<number>;
  readonly instanceScale: number;
}

function TreeSpriteComponent({ x, y, opacity, instanceScale }: TreeSpriteProps) {
  const totalScale = TREE_BASE_VISUAL_SCALE * instanceScale;

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value + TREE_VISUAL_OFFSET_X,
    top: y.value + TREE_VISUAL_OFFSET_Y,
    width: TREE_SPRITE_WIDTH,
    height: TREE_SPRITE_HEIGHT,
    opacity: opacity.value,
    transform: [{ scale: totalScale }],
  }));

  return (
    <Animated.View pointerEvents="none" style={animatedStyle}>
      <Image
        source={TREE_SKIN.source}
        style={{ width: TREE_SPRITE_WIDTH, height: TREE_SPRITE_HEIGHT }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

export const TreeSprite = memo(TreeSpriteComponent);
