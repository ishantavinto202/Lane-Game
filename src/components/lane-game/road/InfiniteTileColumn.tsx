import { memo, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

export interface InfiniteTileColumnProps {
  readonly x: number;
  readonly width: number;
  readonly tileSize: number;
  readonly screenHeight: number;
  readonly scrollY: SharedValue<number>;
  readonly colors: readonly string[];
  readonly colorMode: 'alternate' | 'indexed';
  readonly sideSeed?: number;
}

function resolveTileColor(
  index: number,
  colors: readonly string[],
  colorMode: InfiniteTileColumnProps['colorMode'],
  sideSeed: number,
): string {
  if (colorMode === 'alternate') {
    return colors[index % colors.length] ?? colors[0];
  }
  return colors[(index + sideSeed) % colors.length] ?? colors[0];
}

function InfiniteTileColumnComponent({
  x,
  width,
  tileSize,
  screenHeight,
  scrollY,
  colors,
  colorMode,
  sideSeed = 0,
}: InfiniteTileColumnProps) {
  const tileCount = useMemo(
    () => Math.ceil(screenHeight / tileSize) + 4,
    [screenHeight, tileSize],
  );

  const tiles = useMemo(
    () => Array.from({ length: tileCount }, (_, index) => index),
    [tileCount],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value % tileSize }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x,
          top: -tileSize,
          width,
          height: tileCount * tileSize + tileSize,
        },
        animatedStyle,
      ]}
    >
      {tiles.map((index) => (
        <View
          key={`tile-${index}`}
          style={{
            width,
            height: tileSize,
            backgroundColor: resolveTileColor(index, colors, colorMode, sideSeed),
          }}
        />
      ))}
    </Animated.View>
  );
}

export const InfiniteTileColumn = memo(InfiniteTileColumnComponent);
