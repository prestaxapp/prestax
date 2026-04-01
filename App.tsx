import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { LoanCalculator } from './src/components/organisms/LoanCalculator';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Lufga-ExtraLight': require('./assets/fonts/Lufga-ExtraLight.ttf'),
    'Lufga-Regular': require('./assets/fonts/Lufga-Regular.ttf'),
    'Lufga-Medium': require('./assets/fonts/Lufga-Medium.ttf'),
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <View style={styles.container}>
      <LoanCalculator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});

