import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
    // --- Apple HIG sizes, Lufga weights ---
    // Rule: No Bold anywhere. Bold → Medium. SemiBold → Medium.
    // Each title has a default (Medium) and a Regular variant.

    largeTitle: { fontSize: 34, lineHeight: 41, fontFamily: 'Lufga-Medium' },
    largeTitleRegular: { fontSize: 34, lineHeight: 41, fontFamily: 'Lufga-Regular' },

    title1: { fontSize: 28, lineHeight: 34, fontFamily: 'Lufga-Medium' },
    title1Regular: { fontSize: 28, lineHeight: 34, fontFamily: 'Lufga-Regular' },

    title2: { fontSize: 22, lineHeight: 28, fontFamily: 'Lufga-Medium' },
    title2Regular: { fontSize: 22, lineHeight: 28, fontFamily: 'Lufga-Regular' },

    title3: { fontSize: 18, lineHeight: 24, fontFamily: 'Lufga-Medium' },
    title3Regular: { fontSize: 18, lineHeight: 24, fontFamily: 'Lufga-Regular' },  // ← used for questions

    headline: { fontSize: 17, lineHeight: 22, fontFamily: 'Lufga-Medium' },
    body: { fontSize: 17, lineHeight: 22, fontFamily: 'Lufga-Regular' },
    callout: { fontSize: 16, lineHeight: 21, fontFamily: 'Lufga-Regular' },
    subhead: { fontSize: 15, lineHeight: 20, fontFamily: 'Lufga-Regular' },
    footnote: { fontSize: 13, lineHeight: 18, fontFamily: 'Lufga-Regular' },

    // Custom
    displayAmount: { fontSize: 32, lineHeight: 38, fontFamily: 'Lufga-Regular' },
    displayCurrency: { fontSize: 32, lineHeight: 38, fontFamily: 'Lufga-ExtraLight' }, // "Gs" ExtraLight white50
};
