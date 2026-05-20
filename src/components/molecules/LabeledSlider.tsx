import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../atoms/Text';
import { Slider } from '../atoms/Slider';
import { Metrics } from '../../theme/Metrics';
import { Colors } from '../../theme/Colors';
import { useSound, useSoundOverride } from '../../context/SoundContext';

interface LabeledSliderProps {
    title: string;
    amount: string;
    currencyOrUnit: string;
    minLabel: string;
    maxLabel: string;
    value: number;
    minimumValue: number;
    maximumValue: number;
    step?: number;
    onValueChange: (val: number) => void;
    // Tap-to-edit (only used for amount slider)
    onAmountPress?: () => void;
    editingAmount?: boolean;
    rawInput?: string;
    onRawInputChange?: (v: string) => void;
    onRawInputSubmit?: () => void;
    disableAmountHover?: boolean;
}

export const LabeledSlider = ({
    title,
    amount,
    currencyOrUnit,
    minLabel,
    maxLabel,
    value,
    minimumValue,
    maximumValue,
    step,
    onValueChange,
    onAmountPress,
    editingAmount,
    rawInput,
    onRawInputChange,
    onRawInputSubmit,
    disableAmountHover,
}: LabeledSliderProps) => {
    const { playSound } = useSound();
    const { overrides } = useSoundOverride();
    // Shimmer animation
    const shimmerAnim = useRef(new Animated.Value(-1)).current;
    // Caret animation
    const caretOpacity = useRef(new Animated.Value(0)).current;
    const [showCaret, setShowCaret] = useState(false);
    const caretTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!onAmountPress) return; // Only for amount slider

        // Trigger Shimmer
        shimmerAnim.setValue(-1);
        Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
        }).start();

        // Trigger Caret (10 seconds)
        setShowCaret(true);
        if (caretTimeout.current) clearTimeout(caretTimeout.current);

        // Blinking animation
        const blink = Animated.loop(
            Animated.sequence([
                Animated.timing(caretOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(caretOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
            ])
        );
        blink.start();

        caretTimeout.current = setTimeout(() => {
            setShowCaret(false);
            blink.stop();
        }, 10000);

        return () => {
            if (caretTimeout.current) clearTimeout(caretTimeout.current);
            blink.stop();
        };
    }, [amount, caretOpacity, onAmountPress, shimmerAnim]); // Trigger when amount text changes

    const translateX = shimmerAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-200, 200], // Adjust based on text width
    });

    const [inputWidth, setInputWidth] = useState(120);

    const formatInputText = (text: string) => {
        const clean = text.replace(/\D/g, '');
        if (!clean) return '';
        return new Intl.NumberFormat('es-PY').format(parseInt(clean, 10));
    };

    const handleTextChange = (text: string) => {
        if (onRawInputChange) {
            const clean = text.replace(/\D/g, '');
            onRawInputChange(clean);
        }
    };

    const displayRawInput = formatInputText(rawInput || '');

    return (
        <View style={styles.container}>

            {/* Title — white70, Regular weight */}
            <Text variant="title3Regular" color="white70">{title}</Text>

            {/* Amount row — 8px below title */}
            <View style={styles.amountRow}>
                <View style={styles.amountContainer}>
                    {editingAmount && onRawInputChange && onRawInputSubmit ? (
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.amountInput, { width: Math.max(80, inputWidth + 10) }]}
                                value={displayRawInput}
                                onChangeText={handleTextChange}
                                onBlur={onRawInputSubmit}
                                onSubmitEditing={onRawInputSubmit}
                                keyboardType="numeric"
                                autoFocus
                                returnKeyType="done"
                                selectionColor={Colors.primaryMain}
                                placeholder="0"
                                placeholderTextColor={Colors.white50}
                            />
                            {/* Hidden text for measurement to achieve fit-content */}
                            <Text
                                style={[styles.amountInput, styles.hiddenMeasure]}
                                onLayout={(e) => setInputWidth(e.nativeEvent.layout.width)}
                            >
                                {displayRawInput || '0'}
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            onPress={() => {
                                playSound('action', overrides['action']);
                                onAmountPress?.();
                            }} 
                            activeOpacity={onAmountPress ? 0.7 : 1} 
                            style={styles.amountPressable}
                            // @ts-ignore - works on web
                            onMouseEnter={() => {
                                if (!disableAmountHover) {
                                    playSound('hover', overrides['hover']);
                                }
                            }}
                        >
                            <Text variant="displayAmount" color="white" numeric>{amount}</Text>

                            {/* Shimmer Wave Overlay */}
                            {onAmountPress && (
                                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                                    <Animated.View style={[styles.shimmerWrapper, { transform: [{ translateX }] }]}>
                                        <LinearGradient
                                            colors={['transparent', 'rgba(255,255,255,0.05)', Colors.primaryMain, 'rgba(255,255,255,0.05)', 'transparent']}
                                            start={{ x: 0, y: 0.5 }}
                                            end={{ x: 1, y: 0.5 }}
                                            style={styles.shimmerGradient}
                                        />
                                    </Animated.View>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Blinking Caret */}
                    {showCaret && onAmountPress && (
                        <Animated.View style={[styles.caret, { opacity: caretOpacity }]}>
                            <View style={styles.caretBar} />
                        </Animated.View>
                    )}
                </View>

                {/* Gs / cuota — ExtraLight white50 */}
                <Text variant="displayCurrency" color="white50" style={styles.unit}>{currencyOrUnit}</Text>
            </View>

            {/* Slider — 0px below labels row */}
            <View style={styles.sliderBlock}>
                <Slider
                    value={value}
                    minimumValue={minimumValue}
                    maximumValue={maximumValue}
                    step={step}
                    onValueChange={onValueChange}
                    minimumTrackTintColor={Colors.primaryMain}
                    maximumTrackTintColor={Colors.secondary20}
                />
                <View style={styles.labelsRow}>
                    <Text variant="subhead" color="white50">{minLabel}</Text>
                    <Text variant="subhead" color="white50">{maxLabel}</Text>
                </View>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: Metrics.gap0, // gap between title and amountRow handled below
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: Metrics.gap0,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'visible',
    },
    amountPressable: {
        overflow: 'hidden',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unit: {
        marginLeft: 6,
    },
    amountInput: {
        color: Colors.white,
        fontSize: 32,
        fontFamily: 'Lufga-Regular',
        padding: 0,
        margin: 0,
        includeFontPadding: false,
    },
    hiddenMeasure: {
        position: 'absolute',
        opacity: 0,
        left: -9999,
    },
    shimmerWrapper: {
        width: 200,
        height: '100%',
    },
    shimmerGradient: {
        flex: 1,
    },
    caret: {
        marginLeft: 2,
        height: 32, // Match text height
        justifyContent: 'center',
    },
    caretBar: {
        width: 2,
        height: 28,
        backgroundColor: Colors.primaryMain,
    },
    sliderBlock: {
        marginTop: Metrics.gap0, // 0px between amount and slider
    },
    labelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Metrics.gap0, // 0px between slider track and labels
    },
});
