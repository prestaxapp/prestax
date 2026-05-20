import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon, IconName } from '../atoms/Icon';
import { Colors } from '../../theme/Colors';
import { Metrics } from '../../theme/Metrics';

interface ListDetailsProps {
    iconName?: IconName;
    label: string;
    value: string;
    isPrimary?: boolean;
    style?: ViewStyle;
    /**
     * Elemento opcional renderizado junto al label (ej: InfoTooltip).
     * Se posiciona a 3px de spacing desde el texto del label.
     */
    rightAccessory?: React.ReactNode;
}

export const ListDetails = ({
    iconName,
    label,
    value,
    isPrimary = false,
    style,
    rightAccessory,
}: ListDetailsProps) => {
    return (
        <View style={[styles.container, isPrimary && styles.primaryContainer, style]}>
            <View style={styles.leftContent}>
                {iconName && (
                    <Icon name={iconName} size={24} color="white" style={styles.icon} />
                )}
                <Text variant={isPrimary ? 'body' : 'subhead'} color={isPrimary ? 'white' : 'white80'}>
                    {label}
                </Text>
                {rightAccessory && (
                    <View style={styles.accessory}>
                        {rightAccessory}
                    </View>
                )}
            </View>
            <Text variant={isPrimary ? 'headline' : 'subhead'} color="white" numeric>
                {value}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: Metrics.height56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: Metrics.padding12,
        paddingRight: Metrics.padding16,
    },
    primaryContainer: {
        backgroundColor: Colors.secondary20,
        borderRadius: Metrics.borderRadius100,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: Metrics.padding8,
    },
    /** 3px de spacing desde el label, como especificado en diseño */
    accessory: {
        marginLeft: 3,
    },
});
