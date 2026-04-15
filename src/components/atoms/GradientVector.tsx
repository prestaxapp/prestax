// From assets/GradientVector.svg
import React from 'react';
import Svg, { G, Path, Defs, Filter, FeFlood, FeBlend, FeGaussianBlur, LinearGradient, Stop } from 'react-native-svg';

interface Props {
    width?: number | string;
    height?: number | string;
}

export const GradientVector = ({ width = '100%', height = 393.909 }: Props) => (
    <Svg width={width} height={height} viewBox="0 0 390 607" fill="none">
        <Defs>
            <Filter
                id="filter0_f"
                x="-359.705"
                y="-362.705"
                width="1003.84"
                height="969.319"
                filterUnits="userSpaceOnUse"
            >
                <FeFlood floodOpacity={0} result="BackgroundImageFix" />
                <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <FeGaussianBlur stdDeviation={143.852} result="effect1_foregroundBlur" />
            </Filter>
            <LinearGradient
                id="paint0_linear"
                x1="288.029"
                y1="14.5284"
                x2="75.7576"
                y2="309.352"
                gradientUnits="userSpaceOnUse"
            >
                <Stop offset="0" stopColor="#00DBBF" />
                <Stop offset="0.25" stopColor="#00DBBF" />
                <Stop offset="0.533654" stopColor="#B62CBB" />
                <Stop offset="0.711538" stopColor="#00DBBF" />
                <Stop offset="1" stopColor="#007566" />
            </LinearGradient>
        </Defs>
        <G filter="url(#filter0_f)">
            <Path
                d="M25.4625 223.478L-72 -14.0862L228.509 -75L356.428 75.2541L295.514 207.234L147.29 318.909L25.4625 223.478Z"
                fill="url(#paint0_linear)"
            />
        </G>
    </Svg>
);
