import { BlurView } from 'expo-blur';
import { memo, useCallback, useMemo, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  SCORING_GUIDE_COLLECTIBLES,
  SCORING_GUIDE_OBSTACLES,
  type ScoringGuideCollectibleEntry,
  type ScoringGuideObstacleEntry,
} from '@/src/game/content/scoring-guide.content';

import { ScoringGuideCoinIcon } from './ScoringGuideCoinIcon';
import { SCORING_GUIDE_ICON_SIZE } from './ScoringGuideIconSlot';
import { ScoringGuideSpeedBoostIcon } from './ScoringGuideSpeedBoostIcon';
import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';
const REWARD_COLOR = '#4ADE80';
const PENALTY_COLOR = '#FF453A';
const SECONDARY_COLOR = 'rgba(255, 255, 255, 0.52)';

const ROW_ICON_GAP = 16;
const ROW_PADDING_VERTICAL = 12;
const ROW_SPACING = 12;
const TITLE_TO_DETAIL_GAP = 4;
const DETAIL_LINE_GAP = 3;

type GuideTextTone = 'reward' | 'penalty' | 'secondary';

interface GuideTextLine {
  readonly key: string;
  readonly text: string;
  readonly tone: GuideTextTone;
}

export interface ScoringGuideModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

function GuideTextLines({ lines }: { readonly lines: readonly GuideTextLine[] }) {
  return (
    <View style={styles.detailBlock}>
      {lines.map((line) => (
        <Text
          key={line.key}
          style={[
            styles.detailLine,
            line.tone === 'reward' && styles.rewardText,
            line.tone === 'penalty' && styles.penaltyText,
            line.tone === 'secondary' && styles.secondaryText,
          ]}
        >
          {line.text}
        </Text>
      ))}
    </View>
  );
}

function GuideRow({
  icon,
  title,
  lines,
  description,
}: {
  readonly icon: ReactNode;
  readonly title: string;
  readonly lines: readonly GuideTextLine[];
  readonly description?: string;
}) {
  return (
    <View style={styles.row}>
      {icon}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        <GuideTextLines lines={lines} />
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
    </View>
  );
}

function CollectibleRow({ entry }: { readonly entry: ScoringGuideCollectibleEntry }) {
  const lines = useMemo((): readonly GuideTextLine[] => {
    if (entry.scoreReward > 0) {
      return [{ key: 'score', text: `+${entry.scoreReward} Score`, tone: 'reward' }];
    }

    return [{ key: 'score-none', text: 'No Score Change', tone: 'secondary' }];
  }, [entry.scoreReward]);

  const icon = useMemo(() => {
    if (entry.kind === 'coin') {
      return <ScoringGuideCoinIcon />;
    }

    return <ScoringGuideSpeedBoostIcon />;
  }, [entry.kind]);

  return (
    <GuideRow
      icon={icon}
      title={entry.name}
      lines={lines}
      description={entry.description}
    />
  );
}

function ObstacleRow({ entry }: { readonly entry: ScoringGuideObstacleEntry }) {
  const lines = useMemo((): readonly GuideTextLine[] => {
    const result: GuideTextLine[] = [
      { key: 'score', text: `-${entry.scorePenalty} Score`, tone: 'penalty' },
    ];

    if (entry.healthLoss > 0) {
      result.push({
        key: 'health',
        text: `-${entry.healthLoss} Health`,
        tone: 'penalty',
      });
    } else {
      result.push({
        key: 'health-none',
        text: 'No Health Loss',
        tone: 'secondary',
      });
    }

    return result;
  }, [entry.healthLoss, entry.scorePenalty]);

  const icon = useMemo(
    () => <ScoringGuideStaticIcon source={entry.imageSource} />,
    [entry.imageSource],
  );

  return <GuideRow icon={icon} title={entry.name} lines={lines} />;
}

function ScoringGuideModalComponent({ visible, onClose }: ScoringGuideModalProps) {
  const { height: windowHeight } = useWindowDimensions();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const cardMaxHeight = useMemo(() => Math.min(windowHeight * 0.82, 640), [windowHeight]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlayRoot}>
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={styles.dimLayer} />

        <View style={styles.backdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close scoring guide"
            style={StyleSheet.absoluteFillObject}
            onPress={handleClose}
          />

          <View style={[styles.card, { maxHeight: cardMaxHeight }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Scoring Guide</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={handleClose}
                hitSlop={12}
                style={styles.closeButton}
              >
                <Text style={styles.closeLabel}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text style={styles.sectionTitle}>Collectibles</Text>
              <View style={styles.sectionBody}>
                {SCORING_GUIDE_COLLECTIBLES.map((entry) => (
                  <CollectibleRow key={entry.id} entry={entry} />
                ))}
              </View>

              <Text style={[styles.sectionTitle, styles.obstaclesSectionTitle]}>Obstacles</Text>
              <View style={styles.sectionBody}>
                {SCORING_GUIDE_OBSTACLES.map((entry) => (
                  <ObstacleRow key={entry.id} entry={entry} />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
  },
  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: 'rgba(24, 24, 30, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  obstaclesSectionTitle: {
    marginTop: 28,
  },
  sectionBody: {
    gap: ROW_SPACING,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ROW_ICON_GAP,
    paddingVertical: ROW_PADDING_VERTICAL,
    minHeight: SCORING_GUIDE_ICON_SIZE + ROW_PADDING_VERTICAL * 2,
  },
  rowBody: {
    flex: 1,
    justifyContent: 'center',
    gap: TITLE_TO_DETAIL_GAP,
  },
  rowTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  detailBlock: {
    gap: DETAIL_LINE_GAP,
  },
  detailLine: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  rewardText: {
    color: REWARD_COLOR,
  },
  penaltyText: {
    color: PENALTY_COLOR,
  },
  secondaryText: {
    color: SECONDARY_COLOR,
    fontWeight: '500',
  },
  rowDescription: {
    color: SECONDARY_COLOR,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 2,
  },
});

export const ScoringGuideModal = memo(ScoringGuideModalComponent);
