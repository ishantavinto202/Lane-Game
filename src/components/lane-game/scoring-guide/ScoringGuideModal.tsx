import { BlurView } from 'expo-blur';
import { X } from 'phosphor-react-native';
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

import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';
import { SCORING_GUIDE_COLLECTIBLE_ICON_SCALE, SCORING_GUIDE_OBSTACLE_ICON_SCALE } from './ScoringGuideIconSlot';

const REWARD_COLOR = '#34C759';
const PENALTY_COLOR = '#FF453A';
const SUBTITLE_COLOR = 'rgba(255, 255, 255, 0.45)';
const CLOSE_ICON_COLOR = 'rgba(255, 255, 255, 0.72)';

const HORIZONTAL_PADDING = 20;
const CARD_MAX_HEIGHT_RATIO = 0.58;
const CARD_MAX_HEIGHT_PX = 460;

export interface ScoringGuideModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

interface GuideRowProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly subtitle: string;
  readonly scoreLabel?: string;
  readonly scoreTone?: 'reward' | 'penalty';
  readonly healthLabel?: string;
  readonly isLast?: boolean;
}

function GuideRow({
  icon,
  title,
  subtitle,
  scoreLabel,
  scoreTone,
  healthLabel,
  isLast = false,
}: GuideRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={styles.iconColumn}>{icon}</View>
      <View style={styles.textColumn}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {healthLabel || scoreLabel ? (
        <View style={styles.penaltyColumn}>
          {healthLabel ? (
            <View style={styles.healthBadge}>
              <Text style={styles.healthPenalty}>{healthLabel}</Text>
            </View>
          ) : null}
          {scoreLabel ? (
            <View
              style={[
                styles.scoreBadge,
                scoreTone === 'reward' && styles.scoreBadgeReward,
              ]}
            >
              <Text
                style={[
                  styles.scorePenalty,
                  scoreTone === 'reward' && styles.rewardText,
                  scoreTone === 'penalty' && styles.penaltyText,
                ]}
              >
                {scoreLabel}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function CollectibleRow({
  entry,
  isLast,
}: {
  readonly entry: ScoringGuideCollectibleEntry;
  readonly isLast: boolean;
}) {
  const icon = useMemo(
    () => (
      <ScoringGuideStaticIcon
        source={entry.imageSource}
        visualBounds={entry.visualBounds}
        displayScale={SCORING_GUIDE_COLLECTIBLE_ICON_SCALE}
      />
    ),
    [entry.imageSource, entry.visualBounds],
  );

  const scoreLabel = useMemo(() => {
    if (entry.scoreReward <= 0) {
      return undefined;
    }

    return `+${entry.scoreReward}`;
  }, [entry.scoreReward]);

  return (
    <GuideRow
      icon={icon}
      title={entry.name}
      subtitle={entry.guideDescription}
      scoreLabel={scoreLabel}
      scoreTone="reward"
      isLast={isLast}
    />
  );
}

function ObstacleRow({
  entry,
  isLast,
}: {
  readonly entry: ScoringGuideObstacleEntry;
  readonly isLast: boolean;
}) {
  const scoreLabel = useMemo(() => `-${entry.scorePenalty}`, [entry.scorePenalty]);

  const healthLabel = useMemo(() => {
    if (entry.healthLoss <= 0) {
      return undefined;
    }

    return `❤ -${entry.healthLoss}`;
  }, [entry.healthLoss]);

  const icon = useMemo(
    () => (
      <ScoringGuideStaticIcon
        source={entry.imageSource}
        visualBounds={entry.visualBounds}
        displayScale={SCORING_GUIDE_OBSTACLE_ICON_SCALE}
      />
    ),
    [entry.imageSource, entry.visualBounds],
  );

  return (
    <GuideRow
      icon={icon}
      title={entry.name}
      subtitle={entry.guideDescription}
      scoreLabel={scoreLabel}
      scoreTone="penalty"
      healthLabel={healthLabel}
      isLast={isLast}
    />
  );
}

function ScoringGuideModalComponent({ visible, onClose }: ScoringGuideModalProps) {
  const { height: windowHeight } = useWindowDimensions();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const cardMaxHeight = useMemo(
    () => Math.min(windowHeight * CARD_MAX_HEIGHT_RATIO, CARD_MAX_HEIGHT_PX),
    [windowHeight],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlayRoot}>
        <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFillObject} />
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
                <X size={20} color={CLOSE_ICON_COLOR} weight="bold" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text style={styles.sectionTitle}>Collectibles</Text>
              <View style={styles.sectionList}>
                {SCORING_GUIDE_COLLECTIBLES.map((entry, index, items) => (
                  <CollectibleRow
                    key={entry.id}
                    entry={entry}
                    isLast={index === items.length - 1}
                  />
                ))}
              </View>

              <Text style={[styles.sectionTitle, styles.obstaclesSectionTitle]}>Obstacles</Text>
              <View style={styles.sectionList}>
                {SCORING_GUIDE_OBSTACLES.map((entry, index, items) => (
                  <ObstacleRow
                    key={entry.id}
                    entry={entry}
                    isLast={index === items.length - 1}
                  />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    backgroundColor: 'rgba(22, 22, 28, 0.96)',
    overflow: 'hidden',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 14,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  obstaclesSectionTitle: {
    marginTop: 22,
  },
  sectionList: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingVertical: 6,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  iconColumn: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 1,
    paddingRight: 4,
  },
  rowTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  rowSubtitle: {
    color: SUBTITLE_COLOR,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 15,
  },
  penaltyColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    minWidth: 44,
    alignItems: 'center',
  },
  scoreBadgeReward: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  scorePenalty: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  rewardText: {
    color: REWARD_COLOR,
  },
  penaltyText: {
    color: PENALTY_COLOR,
  },
  healthPenalty: {
    color: PENALTY_COLOR,
    fontSize: 13,
    fontWeight: '700',
  },
});

export const ScoringGuideModal = memo(ScoringGuideModalComponent);
