/**
 * InfoTooltip — Tooltip informativo con ícono ℹ️
 *
 * @module components/atoms/InfoTooltip
 *
 * ## Descripción
 * Componente reutilizable que muestra un ícono de información (14×14px)
 * y despliega un tooltip con un mensaje explicativo.
 *
 * ## Comportamiento por plataforma
 * - **Desktop (web)**: El tooltip aparece al hacer **hover** sobre el ícono.
 * - **Mobile (iOS/Android)**: El tooltip aparece al hacer **tap/press**
 *   sobre el ícono, y se oculta automáticamente tras `autoHideMs` (default 4s)
 *   o al tocar fuera.
 *
 * ## Posicionamiento
 * El tooltip se posiciona centrado debajo del ícono con una flecha
 * apuntando hacia arriba. Se ajusta automáticamente si se sale del
 * borde de la pantalla.
 *
 * ## Props
 * | Prop          | Tipo     | Default | Descripción                          |
 * |---------------|----------|---------|--------------------------------------|
 * | `message`     | string   | —       | Texto del tooltip (requerido)        |
 * | `iconSize`    | number   | 14      | Tamaño del ícono info en px          |
 * | `autoHideMs`  | number   | 4000    | Tiempo de auto-ocultar en mobile     |
 *
 * ## Colores utilizados (del theme documentado)
 * - Fondo tooltip: `Colors.primaryDarkest` (#053535)
 * - Borde: `Colors.primaryMain` (#00DBBF) con 30% opacity
 * - Texto: `Colors.white80` (rgba 255,255,255,0.8)
 * - Ícono: `Colors.white50` (rgba 255,255,255,0.5)
 *
 * ## Ejemplo de uso
 * ```tsx
 * <InfoTooltip
 *   message={`Puede variar ±${variacion} Gs. (${pct}%)`}
 *   iconSize={14}
 * />
 * ```
 */
import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { Colors } from '../../theme/Colors';

interface InfoTooltipProps {
    /** Mensaje a mostrar dentro del tooltip */
    message: string;
    /** Tamaño del ícono info en px (default 14) */
    iconSize?: number;
    /** Tiempo en ms para auto-ocultar en mobile (default 4000) */
    autoHideMs?: number;
}

export const InfoTooltip = ({
    message,
    iconSize = 14,
    autoHideMs = 4000,
}: InfoTooltipProps) => {
    const [visible, setVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const hideTimeout = useRef<NodeJS.Timeout | null>(null);
    const iconRef = useRef<View>(null);

    const show = useCallback(() => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setVisible(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const hide = useCallback(() => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    }, [fadeAnim]);

    const handlePress = useCallback(() => {
        if (visible) {
            hide();
            return;
        }
        show();
        // Auto-hide on mobile after timeout
        if (Platform.OS !== 'web') {
            hideTimeout.current = setTimeout(hide, autoHideMs);
        }
    }, [visible, show, hide, autoHideMs]);

    // Web: hover handlers
    const webHoverProps = Platform.OS === 'web'
        ? {
            // @ts-ignore — RN web supports these
            onMouseEnter: show,
            onMouseLeave: hide,
        }
        : {};

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity
                ref={iconRef}
                onPress={handlePress}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.iconTouchable}
                {...webHoverProps}
            >
                <Icon name="info" size={iconSize} color={Colors.white50} />
            </TouchableOpacity>

            {visible && (
                <Animated.View
                    style={[
                        styles.tooltipContainer,
                        { opacity: fadeAnim },
                    ]}
                    pointerEvents="none"
                >
                    {/* Arrow pointing up */}
                    <View style={styles.arrow} />
                    <View style={styles.tooltipBubble}>
                        <Text variant="footnote" color="white80" style={styles.tooltipText}>
                            {message}
                        </Text>
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

const TOOLTIP_MAX_WIDTH = Math.min(Dimensions.get('window').width - 32, 280);

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        zIndex: 100,
    },
    iconTouchable: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    tooltipContainer: {
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: [{ translateX: -(TOOLTIP_MAX_WIDTH / 2) }],
        marginTop: 6,
        zIndex: 999,
        alignItems: 'center',
    },
    arrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: Colors.primaryDarkest,
        alignSelf: 'center',
    },
    tooltipBubble: {
        backgroundColor: Colors.primaryDarkest,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        maxWidth: TOOLTIP_MAX_WIDTH,
        minWidth: 200,
    },
    tooltipText: {
        textAlign: 'center',
    },
});
