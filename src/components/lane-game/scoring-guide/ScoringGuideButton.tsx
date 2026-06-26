import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export interface ScoringGuideButtonProps {
  readonly onPress: () => void;
}

function ScoringGuideButtonComponent({ onPress }: ScoringGuideButtonProps) {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Scoring Guide"
      onPress={handlePress}
      style={styles.button}
    >
      <Text style={styles.label}>ⓘ Scoring Guide</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    width: '100%',
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export const ScoringGuideButton = memo(ScoringGuideButtonComponent);
