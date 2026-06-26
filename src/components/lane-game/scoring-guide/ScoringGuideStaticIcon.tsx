import { memo } from 'react';
import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';

import { ScoringGuideIconSlot } from './ScoringGuideIconSlot';

export interface ScoringGuideStaticIconProps {
  readonly source: ImageSourcePropType;
}

function ScoringGuideStaticIconComponent({ source }: ScoringGuideStaticIconProps) {
  return (
    <ScoringGuideIconSlot>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </ScoringGuideIconSlot>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

export const ScoringGuideStaticIcon = memo(ScoringGuideStaticIconComponent);
