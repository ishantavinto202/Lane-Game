import { BlurView } from 'expo-blur';
import { X } from 'phosphor-react-native';
import { memo, useCallback, useEffect, useMemo, type ReactNode } from 'react';
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

import { ensureCoinAnimationClock } from '../coin/coinAnimationClock';
import { ensureSpeedBoostAnimationClock } from '../speed-boost/speedBoostAnimationClock';

import { ScoringGuideCoinIcon } from './ScoringGuideCoinIcon';
import { ScoringGuideSpeedBoostIcon } from './ScoringGuideSpeedBoostIcon';
import { ScoringGuideStaticIcon } from './ScoringGuideStaticIcon';

const REWARD_COLOR = '#34C759';
const PENALTY_COLOR = '#FF453A';
const DESCRIPTION_COLOR = 'rgba(255, 255, 255, 0.48)';
const CLOSE_ICON_COLOR = 'rgba(255, 255, 255, 0.72)';

const HORIZONTAL_PADDING = 26;
const CARD_MAX_HEIGHT_RATIO = 0.66;
const CARD_MAX_HEIGHT_PX = 520;

export interface ScoringGuideModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

interface GuideRowProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly scoreLabel?: string;
  readonly scoreTone?: 'reward' | 'penalty';
  readonly healthLabel?: string;
  readonly isLast?: boolean;
}

function GuideRow({
  icon,
  title,
  description,
  scoreLabel,
  scoreTone,
  healthLabel,
  isLast = false,
}: GuideRowProps) {
  return (
    <View style={[styles.rowCard, !isLast && styles.rowCardWithSeparator]}>
      {icon}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <View style={styles.rowStats}>
        {scoreLabel ? (
          <Text
            style={[
              styles.scoreValue,
              scoreTone === 'reward' && styles.rewardText,
              scoreTone === 'penalty' && styles.penaltyText,
            ]}
          >
            {scoreLabel}
          </Text>
        ) : null}
        {healthLabel ? <Text style={styles.healthValue}>{healthLabel}</Text> : null}
      </View>
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
  const icon = useMemo(() => {
    if (entry.kind === 'coin') {
      return <ScoringGuideCoinIcon />;
    }

    return <ScoringGuideSpeedBoostIcon />;
  }, [entry.kind]);

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
      description={entry.guideDescription}
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
      />
    ),
    [entry.imageSource, entry.visualBounds],
  );

  return (
    <GuideRow
      icon={icon}
      title={entry.name}
      description={entry.guideDescription}
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

  useEffect(() => {
    if (!visible) {
      return;
    }

    ensureCoinAnimationClock();
    ensureSpeedBoostAnimationClock();
  }, [visible]);

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
                <X size={22} color={CLOSE_ICON_COLOR} weight="bold" />
              </Pressable>
            </View>
            <View style={styles.headerDivider} />

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text style={styles.sectionTitle}>⭐ Collectibles</Text>
              <View style={styles.sectionBody}>
                {SCORING_GUIDE_COLLECTIBLES.map((entry, index, items) => (
                  <CollectibleRow
                    key={entry.id}
                    entry={entry}
                    isLast={index === items.length - 1}
                  />
                ))}
              </View>

              <Text style={[styles.sectionTitle, styles.obstaclesSectionTitle]}>🚧 Obstacles</Text>
              <View style={styles.sectionBody}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    backgroundColor: 'rgba(24, 24, 30, 0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 18,
    paddingBottom: 12,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: HORIZONTAL_PADDING,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 14,
    paddingBottom: 18,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  obstaclesSectionTitle: {
    marginTop: 16,
  },
  sectionBody: {
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 72,
  },
  rowCardWithSeparator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  rowBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    paddingRight: 8,
  },
  rowTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  rowDescription: {
    color: DESCRIPTION_COLOR,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  rowStats: {
    minWidth: 52,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  rewardText: {
    color: REWARD_COLOR,
  },
  penaltyText: {
    color: PENALTY_COLOR,
  },
  healthValue: {
    color: PENALTY_COLOR,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});

export const ScoringGuideModal = memo(ScoringGuideModalComponent);
