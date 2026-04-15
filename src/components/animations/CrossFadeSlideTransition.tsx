import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Animated, Easing, View } from 'react-native';

interface CrossFadeSlideTransitionProps {
    /** 
     * Cuando es true, inicia la transición hacia la secundaria (haciendo fade in y bajando).
     * Cuando es false, revierte mostrando la primaria (haciendo fade in y creciendo a su tamaño natural).
     */
    showSecond: boolean;
    /** Componente o pantalla principal que desaparece sutilmente hacia el fondo */
    primaryScreen: React.ReactNode;
    /** Componente o pantalla secundaria (modal/confirmación) que entra deslizándose desde arriba */
    secondaryScreen: React.ReactNode;
}

/**
 * CrossFadeSlideTransition
 * 
 * Componente reutilizable para transiciones ligeras de pantalla completas o vistas.
 * - La primera pantalla hace un fade-out suave con un ligero scale back disminuyendo su profundidad.
 * - La segunda pantalla hace un fade-in deslizando ligeramente hacia abajo.
 */
export const CrossFadeSlideTransition: React.FC<CrossFadeSlideTransitionProps> = ({
    showSecond,
    primaryScreen,
    secondaryScreen
}) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [renderSecond, setRenderSecond] = useState(false);

    useEffect(() => {
        if (showSecond) {
            setRenderSecond(true);
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.poly(3)), // Smooth deceleration
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                setRenderSecond(false);
            });
        }
    }, [showSecond, slideAnim]);

    const primaryOpacity = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0] // Fade out entirely
    });
    
    const primaryScale = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.98] // Sutil achicamiento al irse
    });

    const secondOpacity = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1] // Fade in 
    });

    const secondTranslateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-40, 0] // Suave deslizamiento de arriba (-40) hacia 0
    });

    return (
        <View style={styles.rootContainer}>
            {/* Pantalla Principal */}
            <Animated.View 
                style={[
                    styles.primaryContainer, 
                    { 
                        opacity: primaryOpacity, 
                        transform: [{ scale: primaryScale }] 
                    }
                ]}
                pointerEvents={showSecond ? 'none' : 'auto'}
            >
                {primaryScreen}
            </Animated.View>

            {/* Pantalla Secundaria (Superpuesta interactuando con absolute fill) */}
            {renderSecond && (
                <Animated.View 
                    style={[
                        styles.secondaryContainer, 
                        { 
                            opacity: secondOpacity,
                            transform: [{ translateY: secondTranslateY }] 
                        }
                    ]}
                >
                    {secondaryScreen}
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        width: '100%',
        overflow: 'hidden', 
    },
    primaryContainer: {
        flex: 1,
        width: '100%',
    },
    // Este overlay aprovecha la absoluta opacidad para que ambas vistas convivan un momento
    secondaryContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        elevation: 20, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        zIndex: 10,
    },
});
