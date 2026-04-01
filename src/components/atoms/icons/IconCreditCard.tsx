// SF Symbol: creditcard — cross-platform SVG
import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface Props { size?: number; color?: string; }

export const IconCreditCard = ({ size = 24, color = '#ffffff' }: Props) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="6" width="20" height="13" rx="2" stroke={color} strokeWidth="1.5" />
        <Path d="M2 10h20" stroke={color} strokeWidth="1.5" />
        <Path d="M6 15h3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);
