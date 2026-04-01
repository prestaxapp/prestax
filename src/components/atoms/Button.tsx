import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Text } from './Text';
import { Colors } from '../../theme/Colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

export const Button = ({ title, onPress, disabled, loading, style }: ButtonProps) => {
    return (
        <TouchableOpacity
            style={[styles.container, disabled && styles.disabled, style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={Colors.primaryDarkest} />
            ) : (
                <Text variant="headline" color="primaryDarkest" align="center">
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primaryMain,
        justifyContent: 'center',
        alignItems: 'center',
        height: 56, // Match the typical CTA height
        borderRadius: 28, // Matches the app's overall radius
        paddingHorizontal: 24,
    },
    disabled: {
        opacity: 0.5,
    },
});
