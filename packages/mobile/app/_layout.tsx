import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Connect' }} />
        <Stack.Screen name="albums" options={{ title: 'Albums' }} />
        <Stack.Screen name="send" options={{ title: 'Send to Frame' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
