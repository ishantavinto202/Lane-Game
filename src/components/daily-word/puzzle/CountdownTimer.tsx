import { memo, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

import { SCREEN_COLORS } from '../constants/colors';

interface CountdownTimerProps {
  initialElapsedMs: number;
  running: boolean;
  onTick: (deltaMs: number) => void;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function CountdownTimerComponent({ initialElapsedMs, running, onTick }: CountdownTimerProps) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const elapsedRef = useRef(initialElapsedMs);
  const labelRef = useRef(formatElapsed(initialElapsedMs));
  const textRef = useRef<Text>(null);

  useEffect(() => {
    elapsedRef.current = initialElapsedMs;
    const nextLabel = formatElapsed(initialElapsedMs);
    labelRef.current = nextLabel;
    textRef.current?.setNativeProps({ text: nextLabel });
  }, [initialElapsedMs]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const intervalId = setInterval(() => {
      elapsedRef.current += 1000;
      onTickRef.current(1000);
      const nextLabel = formatElapsed(elapsedRef.current);
      if (nextLabel !== labelRef.current) {
        labelRef.current = nextLabel;
        textRef.current?.setNativeProps({ text: nextLabel });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [running]);

  return (
    <View className="items-center py-2">
      <Text ref={textRef} className="text-sm font-semibold" style={{ color: SCREEN_COLORS.textSecondary }}>
        {labelRef.current}
      </Text>
    </View>
  );
}

export const CountdownTimer = memo(CountdownTimerComponent);
