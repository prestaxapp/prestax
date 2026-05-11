import { Animated } from 'react-native';

/**
 * Custom hook to encapsulate the scroll-driven sticky header animation logic.
 * @param scrollY - The Animated.Value tracking the ScrollView's content offset.
 * @returns An object containing the interpolated animated styles, or null if no scrollY provided.
 */
export function useStickyHeaderAnimation(scrollY?: Animated.Value) {
    if (!scrollY) return null;

    return {
        bigTitleTranslateY: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [0, -50],
            extrapolate: 'clamp',
        }),
        bigTitleOpacity: scrollY.interpolate({
            inputRange: [0, 30],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        }),
        stickyBgOpacity: scrollY.interpolate({
            inputRange: [30, 60],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        }),
        smallTitleOpacity: scrollY.interpolate({
            inputRange: [40, 70],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        }),
        smallTitleTranslateY: scrollY.interpolate({
            inputRange: [40, 70],
            outputRange: [10, 0],
            extrapolate: 'clamp',
        }),
    };
}
