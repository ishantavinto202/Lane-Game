import { memo } from 'react';
import { View } from 'react-native';

import { Tile } from './Tile';

import type { GuessRow } from '../game/types';

interface BoardGridProps {
  rows: GuessRow[];
  currentRowIndex: number;
  currentColIndex: number;
  shakeRowIndex: number | null;
}

function BoardGridComponent({ rows, currentRowIndex, currentColIndex, shakeRowIndex }: BoardGridProps) {
  return (
    <View className="items-center gap-1.5">
      {rows.map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          className="flex-row gap-1.5"
          style={shakeRowIndex === rowIndex ? { transform: [{ translateX: 4 }] } : undefined}
        >
          {row.tiles.map((tile, colIndex) => (
            <Tile
              key={`tile-${rowIndex}-${colIndex}`}
              tile={tile}
              rowIndex={rowIndex}
              colIndex={colIndex}
              isActive={
                rowIndex === currentRowIndex &&
                colIndex === currentColIndex &&
                !row.submitted
              }
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export const BoardGrid = memo(BoardGridComponent);
