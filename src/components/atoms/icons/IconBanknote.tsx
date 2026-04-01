// SF Symbol: banknote — cross-platform SVG
import React from 'react';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

interface Props { size?: number; color?: string; }

export const IconBanknote = ({ size = 24, color = '#ffffff' }: Props) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="6" width="20" height="13" rx="2" stroke={color} strokeWidth="1.5" />
        <Circle cx="12" cy="12.5" r="2.5" stroke={color} strokeWidth="1.5" />
        <Path d="M6 9.5v.01M18 15.5v.01" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);
