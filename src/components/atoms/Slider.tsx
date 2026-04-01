import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { Colors } from '../../theme/Colors';

interface SliderProps {
    value: number;
    minimumValue: number;
    maximumValue: number;
    step?: number;
    onValueChange: (val: number) => void;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    style?: ViewStyle;
}

export const Slider = ({
    value,
    minimumValue,
    maximumValue,
    step = 1,
    onValueChange,
    minimumTrackTintColor = Colors.primaryMain,
    maximumTrackTintColor = Colors.white50,
    style,
}: SliderProps) => {
    return (
        <View style={[styles.container, style]}>
            <RNSlider
                style={styles.slider}
                value={value}
                minimumValue={minimumValue}
                maximumValue={maximumValue}
                step={step}
                onValueChange={onValueChange}
                minimumTrackTintColor={minimumTrackTintColor}
                maximumTrackTintColor={maximumTrackTintColor}
                thumbTintColor={Colors.primaryMain}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        height: 40,
    },
    slider: {
        width: '100%',
        height: 40,
    },
});
