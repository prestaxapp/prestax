import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
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
    const textStyle: TextStyle = {
        ...Typography[variant],
        color: Array.isArray(colorValue) ? colorValue[0] : (colorValue as string),
        textAlign: align,
        ...(numeric && { fontFamily: 'Lufga-Regular' }), // Numbers always Lufga
    };

    return (
        <RNText style={[textStyle, style]} {...rest}>
            {children}
        </RNText>
    );
};
