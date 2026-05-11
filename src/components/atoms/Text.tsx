import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, Platform } from 'react-native';
import { Typography } from '../../theme/Typography';
import { Colors } from '../../theme/Colors';

interface TextProps extends RNTextProps {
    variant?: keyof typeof Typography;
    color?: keyof typeof Colors;
    align?: TextStyle['textAlign'];
    numeric?: boolean; // Global rule: numbers always use Lufga
}

export const Text = ({
    variant = 'body',
    color = 'white',
    align = 'left',
    numeric = false,
    style,
    children,
    ...rest
}: TextProps) => {

    const colorValue = Colors[color as keyof typeof Colors] || color;
    const baseTextStyle: TextStyle = {
        ...Typography[variant],
        color: Array.isArray(colorValue) ? colorValue[0] : (colorValue as string),
        textAlign: align,
        ...(numeric && { fontFamily: 'Lufga-Regular' }), // Numbers always Lufga
    };

    // Aplana todos los estilos (el base + cualquier estilo custom pasado por prop)
    const finalStyle = StyleSheet.flatten([baseTextStyle, style]) as TextStyle;

    // GLOBAL IOS CLIPPING FIX:
    // Al leer el estilo FINAL, aseguramos que ningún componente "rompa" la regla.
    if (Platform.OS === 'ios') {
        finalStyle.paddingHorizontal = (finalStyle.paddingHorizontal as number || 0) + 2;
        if (finalStyle.lineHeight && finalStyle.fontSize && finalStyle.lineHeight <= finalStyle.fontSize) {
            finalStyle.lineHeight = finalStyle.fontSize + 4;
        }
    }

    return (
        <RNText style={finalStyle} {...rest}>
            {children}
        </RNText>
    );
};
