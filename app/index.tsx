import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Star } from 'phosphor-react-native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { preloadLaneGameImages } from '@/src/game/assets/preload-lane-game-images';

type PlayState = 'idle' | 'loading';

const LOGO_SOURCE = require('../assets/Ui/JAM RIDE Text.png');
const VEHICLE_SOURCE = require('../assets/Ui/CAR.gif');
const SCORE_ICON_COLOR = '#FFFFFF';

function HomeScreenComponent() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const navigatingRef = useRef(false);
  const vehicleFloatY = useRef(new Animated.Value(0)).current;
  const [playState, setPlayState] = useState<PlayState>('idle');

  useFocusEffect(
    useCallback(() => {
      navigatingRef.current = false;
      setPlayState('idle');
    }, []),
  );

  const handlePlay = useCallback(async () => {
    if (navigatingRef.current) {
      return;
    }

    navigatingRef.current = true;
    setPlayState('loading');

    try {
      await preloadLaneGameImages();
      router.push('/lane-game');
    } catch {
      navigatingRef.current = false;
      setPlayState('idle');
    }
  }, [router]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(vehicleFloatY, {
          toValue: -8,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(vehicleFloatY, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [vehicleFloatY]);

  const handlePlaceholderPress = useCallback(() => {}, []);

  const logoStyle = useMemo<ImageStyle>(
    () => ({
      width: Math.min(width - 32, 360),
      height: Math.min(width - 32, 360) * 0.55,
    }),
    [width],
  );

  const vehicleStyle = useMemo<ImageStyle>(
    () => ({
      width: Math.min(width * 0.42, 154),
      height: Math.min(width * 0.42, 154) * 1.38,
    }),
    [width],
  );

  const animatedVehicleStyle = useMemo(
    () => ({
      transform: [{ translateY: vehicleFloatY }],
    }),
    [vehicleFloatY],
  );

  const isPlayDisabled = playState !== 'idle';
  const isLoading = playState === 'loading';

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Image source={LOGO_SOURCE} style={[styles.logo, logoStyle]} resizeMode="contain" />

        <Animated.View style={[styles.vehicleFrame, animatedVehicleStyle]}>
          <Image source={VEHICLE_SOURCE} style={[styles.vehicle, vehicleStyle]} resizeMode="contain" />
        </Animated.View>

        <View style={styles.statsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Your best placeholder"
            onPress={handlePlaceholderPress}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>Your Best</Text>
            <View style={styles.scoreLine}>
              <Star size={21} color={SCORE_ICON_COLOR} weight="regular" />
              <Text style={styles.scoreValue}>1025</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Global best placeholder"
            onPress={handlePlaceholderPress}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>Global Best</Text>
            <View style={styles.scoreLine}>
              <Star size={21} color={SCORE_ICON_COLOR} weight="regular" />
              <Text style={styles.scoreValue}>2900</Text>
            </View>
          </Pressable>
        </View>

        <Pressable
          onPress={handlePlay}
          disabled={isPlayDisabled}
          accessibilityLabel={isLoading ? 'Loading game' : 'Play Lane'}
          accessibilityState={{ disabled: isPlayDisabled, busy: isLoading }}
          style={[styles.primaryButton, isPlayDisabled && styles.buttonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Play</Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit placeholder"
          onPress={handlePlaceholderPress}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Exit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020202',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 28,
  },
  logo: {
    marginBottom: 28,
  },
  vehicleFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 46,
    shadowColor: '#FFD84A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
  },
  vehicle: {
    alignSelf: 'center',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minHeight: 61,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282828',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    minHeight: 55,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#432DF5',
    marginBottom: 17,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282828',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default memo(HomeScreenComponent);
