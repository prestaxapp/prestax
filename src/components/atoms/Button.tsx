import React, { useState, useRef } from 'react';
import { StyleSheet, ActivityIndicator, ViewStyle, Pressable, View, Platform, Animated } from 'react-native';
import { Text } from './Text';
import { Colors } from '../../theme/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    variant?: 'primary' | 'text';
}

/**
 * Botón Universal Prestax — Átomo
 * 
 * Componente base de interacción del sistema. Implementa feedback visual (escala)
 * y soporta las dos variantes principales del diseño.
 * 
 * @param title - Texto a mostrar dentro del botón.
 * @param onPress - Función que se ejecuta al presionar.
 * @param variant 
 *  - 'primary': Botón con gradiente, bordes redondeados (pill) y sombra.
 *  - 'text': Botón sin fondo (tipo link), ideal para acciones secundarias como "Atrás".
 * @param loading - Estado de carga que muestra un ActivityIndicator.
 * @param disabled - Desactiva la interacción y aplica opacidad.
 * 
 * @example
 * <Button title="Confirmar" variant="primary" onPress={handleConfirm} />
 */
export const Button = ({ title, onPress, disabled, loading, style, variant = 'primary' }: ButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.timing(scaleAnim, {
            toValue: 0.96, // achique sutilmente
            duration: 100, // rápida smooth
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.timing(scaleAnim, {
            toValue: 1, // vuelve a su estado normal (no crece al hover)
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    if (variant === 'text') {
        return (
            <Pressable
                onPress={onPress}
                disabled={disabled || loading}
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => setIsHovered(false)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Animated.View style={[
                    styles.textContainer,
                    disabled && styles.disabled,
                    style,
                    { opacity: isPressed || isHovered ? 0.7 : 1, transform: [{ scale: scaleAnim }] }
                ]}>
                    {loading ? (
                        <ActivityIndicator color={Colors.primaryMain} />
                    ) : (
                        <Text variant="headline" style={styles.textButtonText} align="center">
                            {title}
                        </Text>
                    )}
                </Animated.View>
            </Pressable>
        );
    }

    // primary variant
    const shadowStyles = Platform.select({
        web: {
            boxShadow: '0px 35px 43px 0px rgba(0,219,191,0.16), 0px 6px 12px 0px rgba(0,219,191,0.32), 0px 2px 0px 0px #03b69f',
            // @ts-ignore
            transition: 'box-shadow 0.2s ease', 
        },
        default: {
            shadowColor: Colors.primaryMain,
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 10,
        }
    }) as any;

    const hoveredShadowStyles = Platform.select({
        web: {
            boxShadow: '0px 40px 50px 0px rgba(0,219,191,0.25), 0px 8px 16px 0px rgba(0,219,191,0.4), 0px 2px 0px 0px #03b69f',
        },
        default: {
            shadowOpacity: 0.3,
            elevation: 12,
        }
    }) as any;

    const innerShadowStyles = Platform.select({
        web: {
            // Default and Hover have the same inner shadow
            boxShadow: 'inset 0px 2.29px 2.29px 0px rgba(255,255,255,0.37), inset 0px 10px 10px 0px rgba(255,255,255,0.15), inset 0px -0.8px 1.11px 0px rgba(13,199,175,0.96), inset 0px -2.41px 3.38px 0px rgba(0,255,222,0.88), inset 0px -6.38px 8.94px 0px rgba(3,228,199,0.68), inset 0px -0.72px 3.58px 0px rgba(0,0,0,0.05), inset 0px -2.17px 10.87px 0px rgba(0,0,0,0.04), inset 0px -5.74px 28.72px 0px rgba(0,0,0,0.03)'
        },
        default: {}
    }) as any;

    const pressedInnerShadowStyles = Platform.select({
        web: {
            // Note the differently colored dark borders on press according to the Figma specs
            boxShadow: 'inset 0px 2.29px 2.29px 0px rgba(255,255,255,0.37), inset 0px 10px 10px 0px rgba(255,255,255,0.15), inset 0px -0.8px 1.11px 0px rgba(0,215,188,0.96), inset 0px -2.41px 3.38px 0px rgba(0,152,132,0.88), inset 0px -6.38px 8.94px 0px rgba(0,255,222,0.68), inset 0px -0.72px 3.58px 0px rgba(0,0,0,0.05), inset 0px -2.17px 10.87px 0px rgba(0,0,0,0.04), inset 0px -5.74px 28.72px 0px rgba(0,0,0,0.03)'
        },
        default: {
            backgroundColor: '#00C9AF', // subtly darkens inner layout locally for native pressed effect
        }
    }) as any;

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[
                styles.primaryContainer,
                isHovered && !disabled ? hoveredShadowStyles : shadowStyles,
                disabled && styles.disabled,
                style,
                { transform: [{ scale: scaleAnim }] }
            ]}>
                <LinearGradient
                    colors={['#00C9AF', '#00DBBF']} 
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={styles.outerGradient}
                >
                    <View style={[
                        styles.innerLayer, 
                        isPressed && !disabled ? pressedInnerShadowStyles : innerShadowStyles
                    ]}>
                        {loading ? (
                            <ActivityIndicator color={Colors.primaryDarkest} />
                        ) : (
                            <Text variant="headline" style={styles.primaryText} align="center">
                                {title}
                            </Text>
                        )}
                    </View>
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    disabled: {
        opacity: 0.5,
    },
    // TEXT BUTTON
    textContainer: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    textButtonText: {
        color: Colors.primaryMain,
        fontFamily: 'Lufga-Medium',
        fontSize: 17,
        lineHeight: 17,
    },
    // PRIMARY BUTTON
    primaryContainer: {
        width: '100%',
        height: 56,
        borderRadius: 80,
    },
    outerGradient: {
        flex: 1,
        borderRadius: 80,
        padding: 4, 
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    innerLayer: {
        flex: 1,
        borderRadius: 1000,
        backgroundColor: Colors.primaryMain,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4, 
    },
    primaryText: {
        color: Colors.primaryDarkest, 
        fontFamily: 'Lufga-Medium',
        fontSize: 17,
        lineHeight: 17,
    },
});
