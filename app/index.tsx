import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LoanCalculator } from '../src/components/organisms/LoanCalculator';

export default function IndexScreen() {
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
  },
});
