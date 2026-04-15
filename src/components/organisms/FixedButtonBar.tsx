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
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Text } from '../atoms/Text';
import { Colors } from '../../theme/Colors';
import { Metrics } from '../../theme/Metrics';
import { LinearGradient } from 'expo-linear-gradient';

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
            {/* Primary Button */}
            <TouchableOpacity
                style={[styles.primaryButtonWrapper, disabled && styles.primaryDisabled]}
                onPress={onPressPrimary}
                disabled={disabled || loading}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={['#00DBBF', '#00C9AF']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.primaryButtonInner}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.primaryDarkest} />
                    ) : (
                        <Text variant="headline" style={styles.primaryButtonText} align="center">
                            {primaryLabel}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
                style={styles.textButton}
                onPress={onPressBack}
                activeOpacity={0.7}
            >
                <Text variant="headline" style={styles.textButtonText} align="center">
                    Atrás
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Figma spec: px-16, py-16, min-w-320
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 24,
        width: '100%',
        backgroundColor: 'rgba(0, 21, 17, 0.75)',
    },
    primaryButtonWrapper: {
        height: 56, // p-[4px] + h-[48px] inner
        borderRadius: 80,
        backgroundColor: '#00C9AF', // fallback bg
        padding: 4,
        shadowColor: Colors.primaryMain,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 10,
        width: '100%',
    },
    primaryButtonInner: {
        flex: 1,
        borderRadius: 1000,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    primaryDisabled: {
        opacity: 0.5,
    },
    primaryButtonText: {
        color: Colors.primaryDarkest,
        fontFamily: 'Lufga-Medium', // from figma text-[17px] Lufga-Medium
        fontSize: 17,
        lineHeight: 17,
    },
    textButton: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    textButtonText: {
        color: Colors.primaryMain,
        fontFamily: 'Lufga-Medium',
        fontSize: 17,
        lineHeight: 17,
    },
});
