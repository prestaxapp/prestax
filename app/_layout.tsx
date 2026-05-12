import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

import { SoundProvider } from '../src/context/SoundContext';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Lufga-ExtraLight': require('../assets/fonts/Lufga-ExtraLight.ttf'),
    'Lufga-Regular': require('../assets/fonts/Lufga-Regular.ttf'),
    'Lufga-Medium': require('../assets/fonts/Lufga-Medium.ttf'),
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <SoundProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SoundProvider>
  );
}
