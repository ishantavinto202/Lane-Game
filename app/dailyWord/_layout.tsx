import { Stack } from 'expo-router';

export default function DailyWordLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121213' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="game" />
      <Stack.Screen name="victory" />
      <Stack.Screen name="defeat" />
      <Stack.Screen name="pause" options={{ presentation: 'modal' }} />
      <Stack.Screen name="stats" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
