// SF Symbol: list.bullet — cross-platform SVG
import React from 'react';
import Svg, { Line, Circle } from 'react-native-svg';

interface Props { size?: number; color?: string; }

export const IconListBullet = ({ size = 24, color = '#ffffff' }: Props) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="4.5" cy="8" r="1.5" fill={color} />
        <Circle cx="4.5" cy="12" r="1.5" fill={color} />
        <Circle cx="4.5" cy="16" r="1.5" fill={color} />
        <Line x1="9" y1="8" x2="20" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="9" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="9" y1="16" x2="20" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);
