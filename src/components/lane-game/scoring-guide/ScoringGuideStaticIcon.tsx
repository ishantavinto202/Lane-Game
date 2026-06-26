import { memo, useMemo } from 'react';
import { Image, type ImageSourcePropType } from 'react-native';

import { ScoringGuideIconSlot } from './ScoringGuideIconSlot';
import {
  computeScoringGuideIconLayout,
  type ScoringGuideVisualBounds,
} from './scoring-guide-icon-layout';

export interface ScoringGuideStaticIconProps {
  readonly source: ImageSourcePropType;
  readonly visualBounds: ScoringGuideVisualBounds;
}

function ScoringGuideStaticIconComponent({ source, visualBounds }: ScoringGuideStaticIconProps) {
  const layout = useMemo(
    () => computeScoringGuideIconLayout(visualBounds),
    [visualBounds],
  );

  const imageStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      left: layout.left,
      top: layout.top,
      width: layout.width,
      height: layout.height,
    }),
    [layout.height, layout.left, layout.top, layout.width],
  );

  return (
    <ScoringGuideIconSlot>
      <Image source={source} style={imageStyle} resizeMode="stretch" />
    </ScoringGuideIconSlot>
  );
}

export const ScoringGuideStaticIcon = memo(ScoringGuideStaticIconComponent);
