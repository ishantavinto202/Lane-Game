import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export const SCORING_GUIDE_ICON_SIZE = 64;

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
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
});

export const ScoringGuideIconSlot = memo(ScoringGuideIconSlotComponent);
