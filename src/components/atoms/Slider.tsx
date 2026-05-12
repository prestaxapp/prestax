import React, { useRef } from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { Colors } from '../../theme/Colors';
import { useSound, useSoundOverride } from '../../context/SoundContext';

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
    const { playSound } = useSound();
    const { overrides } = useSoundOverride();
    const lastValueRef = useRef(value);

    return (
        <View 
            style={[styles.container, style]}
            // @ts-ignore - web support
            onMouseEnter={() => playSound('hover', overrides['hover'])}
        >
            <RNSlider
                style={styles.slider}
                value={value}
                minimumValue={minimumValue}
                maximumValue={maximumValue}
                step={step}
                onValueChange={(val) => {
                    const roundedVal = Math.round(val / step) * step;
                    if (roundedVal !== lastValueRef.current) {
                        lastValueRef.current = roundedVal;
                        playSound('hover2', overrides['hover2']);
                    }
                    onValueChange(val);
                }}
                onSlidingStart={() => playSound('hover2', overrides['hover2'])}
                minimumTrackTintColor={minimumTrackTintColor}
                maximumTrackTintColor={maximumTrackTintColor}
                thumbTintColor={Colors.primaryMain}
                {...Platform.select({
                    android: {
                        thumbImage: require('../../../assets/thumb_android.png'),
                    },
                })}
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
