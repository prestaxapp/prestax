// SF Symbol: doc.text — cross-platform SVG
import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

interface Props { size?: number; color?: string; }

export const IconDocText = ({ size = 24, color = '#ffffff' }: Props) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <Path d="M14 2v6h6" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <Line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="8" y1="17" x2="13" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);
