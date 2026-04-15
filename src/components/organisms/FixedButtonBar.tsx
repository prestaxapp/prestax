/**
 * FixedButtonBar — Organism
 *
 * Componente de botones fijo al pie de pantalla.
 * Copia fiel del componente "Fixed Button" de Figma.
 *
 * Estructura:
 *  1. Botón primario (pill, primaryMain bg, primaryDarkest text)
 *  2. Text button "Atrás" (sin fondo, primaryMain text)
 *
 * Figma specs:
 *  - Botón primario: height 56, borderRadius 100 (pill), bg primaryMain, text primaryDarkest, Lufga-Medium/headline
 *  - Text button: height 56, sin bg, color primaryMain, headline, centrado
 *  - Container: paddingHorizontal 24, gap 8 entre botones
 *
 * ⚠️ HARDCODED:
 *  - paddingBottom: 32 — safe area no mapeada a insets todavía
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../atoms/Button';

interface FixedButtonBarProps {
    primaryLabel: string;
    onPressPrimary: () => void;
    onPressBack: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export const FixedButtonBar = ({
    primaryLabel,
    onPressPrimary,
    onPressBack,
    loading = false,
    disabled = false,
}: FixedButtonBarProps) => {
    return (
        <View style={styles.container}>
            <Button
                title={primaryLabel}
                onPress={onPressPrimary}
                loading={loading}
                disabled={disabled}
                variant="primary"
            />
            <Button
                title="Atrás"
                onPress={onPressBack}
                disabled={loading || disabled}
                variant="text"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 24,
        width: '100%',
        backgroundColor: 'rgba(0, 21, 17, 0.75)',
    },
});
