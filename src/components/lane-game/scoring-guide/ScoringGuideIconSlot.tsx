import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export const SCORING_GUIDE_ICON_SIZE = 48;
export const SCORING_GUIDE_ATLAS_DISPLAY_SIZE = 36;
/** Collectible voxel icons render at 70% of the fit scale inside the slot. */
export const SCORING_GUIDE_COLLECTIBLE_ICON_SCALE = 0.7;
/** Obstacle voxel icons render at 70% of the fit scale inside the slot. */
export const SCORING_GUIDE_OBSTACLE_ICON_SCALE = 0.7;

export interface ScoringGuideIconSlotProps {
  readonly children: ReactNode;
}

function ScoringGuideIconSlotComponent({ children }: ScoringGuideIconSlotProps) {
  return <View style={styles.iconSlot}>{children}</View>;
}

const styles = StyleSheet.create({
  iconSlot: {
    width: SCORING_GUIDE_ICON_SIZE,
    height: SCORING_GUIDE_ICON_SIZE,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
});

export const ScoringGuideIconSlot = memo(ScoringGuideIconSlotComponent);
