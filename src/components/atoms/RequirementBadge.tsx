/**
 * RequirementBadge — Atom
 *
 * Pill/badge that shows a single loan requirement.
 * Figma: dark semi-transparent background, white text, rounded 100.
 * Used inside the "Requisitos" section of ConfirmScreen.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Colors } from '../../theme/Colors';

interface RequirementBadgeProps {
    label: string | React.ReactNode;
}

export const RequirementBadge = ({ label }: RequirementBadgeProps) => {
    return (
        <View style={styles.badge}>
            <Text variant="footnote" color="white" align="center">
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        // Figma exacts:
        backgroundColor: Colors.secondary20,
        borderRadius: 999, // fully rounded pill
        paddingVertical: 12, // py-[12px]
        paddingHorizontal: 14, // px-[14.205px]
        justifyContent: 'center',
        alignItems: 'center',
    },
});
