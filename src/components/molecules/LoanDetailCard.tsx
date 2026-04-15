/**
 * LoanDetailCard — Molecule
 *
 * Tarjeta PLAZO / CUOTA del ConfirmScreen.
 *
 * Figma spec exacto:
 *   display: flex;
 *   padding: 12px 14.205px 12px 10.653px;  → usamos padding12 (horizontal) como aproximación
 *   flex-direction: column;
 *   justify-content: center;
 *   align-items: flex-start;
 *   gap: 8px;            → gap8 (8.878px redondeado)
 *   flex: 1 0 0;
 *
 *   border-radius: 16px; → borderRadius16
 *   background: rgba(124, 153, 149, 0.20); → Colors.secondary20
 *   (sin border — cometido en v1, corregido aquí)
 *
 * Label (PLAZO / CUOTA): white50, footnote
 * Value (12 meses / 115.000 Gs): white, title3, numeric
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon, IconName } from '../atoms/Icon';
import { Colors } from '../../theme/Colors';
import { Metrics } from '../../theme/Metrics';

interface LoanDetailCardProps {
    iconName: IconName;
    label: string;
    value: string;
}

export const LoanDetailCard = ({ iconName, label, value }: LoanDetailCardProps) => {
    const valueParts = value.split(' ');
    const numberPart = valueParts[0];
    const unitPart = valueParts.slice(1).join(' ');

    return (
        <View style={styles.card}>
            <View style={styles.labelRow}>
                {/* @ts-ignore */}
                <Icon name={iconName} size={20} color="white" />
                <Text style={styles.labelText}>
                    {label}
                </Text>
            </View>
            <View style={styles.valueRow}>
                <Text style={styles.valueNumber}>
                    {numberPart}
                </Text>
                {unitPart ? (
                    <Text style={styles.valueUnit}>
                        {unitPart}
                    </Text>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: Colors.secondary20,
        borderRadius: 16,
        paddingLeft: 11,
        paddingRight: 14,
        paddingVertical: 12,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 12, // Figma says gap 12px for the ListDetails stack
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4, // gap between icon and text 4px
    },
    labelText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'Lufga-Regular',
        fontSize: 11.5,
        letterSpacing: 0.23,
        textTransform: 'uppercase',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    valueNumber: {
        color: '#FFFFFF',
        fontFamily: 'Lufga-Medium',
        fontSize: 22,
        lineHeight: 22,
    },
    valueUnit: {
        color: '#FFFFFF',
        fontFamily: 'Lufga-Regular',
        fontSize: 15,
        lineHeight: 18,
        paddingBottom: 2, // Optical alignment with number baseline
    },
});
