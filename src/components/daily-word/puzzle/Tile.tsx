import { memo, useMemo } from 'react';
import { Text, View } from 'react-native';

import { TILE_COLORS } from '../constants/colors';
import { TileState } from '../game/types';

import type { TileData } from '../game/types';

interface TileProps {
  tile: TileData;
  rowIndex: number;
  colIndex: number;
  isActive: boolean;
}

function TileComponent({ tile, isActive }: TileProps) {
  const colors = useMemo(() => {
    if (tile.state === TileState.empty && tile.letter) {
      return TILE_COLORS.filled;
    }
    if (tile.state === TileState.empty) {
      return TILE_COLORS.empty;
    }
    return TILE_COLORS[tile.state];
  }, [tile.letter, tile.state]);

  const borderColor = isActive ? '#538D4E' : colors.border;

  return (
    <View
      className="items-center justify-center rounded border-2"
      style={{
        width: 56,
        height: 56,
        backgroundColor: colors.bg,
        borderColor,
      }}
    >
      <Text className="text-2xl font-bold uppercase" style={{ color: colors.text }}>
        {tile.letter}
      </Text>
    </View>
  );
}

function areTilePropsEqual(prev: TileProps, next: TileProps): boolean {
  return (
    prev.rowIndex === next.rowIndex &&
    prev.colIndex === next.colIndex &&
    prev.isActive === next.isActive &&
    prev.tile.letter === next.tile.letter &&
    prev.tile.state === next.tile.state
  );
}

export const Tile = memo(TileComponent, areTilePropsEqual);
