// SF Symbol: percent — cross-platform SVG
import React from 'react';
import Svg, { Line, Circle } from 'react-native-svg';

interface Props { size?: number; color?: string; }

export const IconPercent = ({ size = 24, color = '#ffffff' }: Props) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="6.5" cy="6.5" r="2.5" stroke={color} strokeWidth="1.5" />
        <Circle cx="17.5" cy="17.5" r="2.5" stroke={color} strokeWidth="1.5" />
    </Svg>
);
