/**
 * GradientSeparator — Atom
 *
 * Separador horizontal con gradiente transparente → blanco → transparente.
 *
 * Figma spec:
 *   height: 0.4px; align-self: stretch;
 *   background: linear-gradient(90deg,
 *     rgba(255,255,255,0.00) 0%,
 *     rgba(255,255,255,0.60) 50.68%,
 *     rgba(255,255,255,0.00) 100%
 *   );
 */
import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientSeparatorProps {
    style?: ViewStyle;
}

export const GradientSeparator = ({ style }: GradientSeparatorProps) => {
    return (
        <LinearGradient
            colors={[
                'rgba(255,255,255,0.00)',
                'rgba(255,255,255,0.60)',
                'rgba(255,255,255,0.00)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[{ height: 0.4, alignSelf: 'stretch' }, style]}
        />
    );
};
