// SF Symbol: calendar — cross-platform SVG
import React from 'react';
import Svg, { Path, Rect, Line } from 'react-native-svg';

interface Props { size?: number; color?: string; }

export const IconCalendar = ({ size = 24, color = '#ffffff' }: Props) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="17" rx="2.5" stroke={color} strokeWidth="1.5" />
        <Path d="M16 2v4M8 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.5" />
        <Rect x="7" y="13" width="2" height="2" rx="0.5" fill={color} />
        <Rect x="11" y="13" width="2" height="2" rx="0.5" fill={color} />
        <Rect x="7" y="17" width="2" height="2" rx="0.5" fill={color} />
        <Rect x="11" y="17" width="2" height="2" rx="0.5" fill={color} />
        <Rect x="15" y="13" width="2" height="2" rx="0.5" fill={color} />
    </Svg>
);
