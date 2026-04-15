// From assets/icon/state.svg
// Note: this icon has a fixed red background circle (#FF6253) — color prop only affects the inner path
import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface Props { size?: number; color?: string; bgColor?: string; }

export const IconState = ({ size = 20, color = '#ffffff', bgColor = '#FF6253' }: Props) => (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Rect width="20" height="20" rx="10" fill={bgColor} />
        <Path
            d="M10 13.4722C10.382 13.4722 10.7089 13.6082 10.9809 13.8802C11.2529 14.1522 11.3889 14.4792 11.3889 14.8611C11.3889 15.2431 11.2529 15.57 10.9809 15.842C10.7089 16.114 10.382 16.25 10 16.25C9.61808 16.25 9.29111 16.114 9.01912 15.842C8.74713 15.57 8.61114 15.2431 8.61114 14.8611C8.61114 14.4792 8.74713 14.1522 9.01912 13.8802C9.29112 13.6082 9.61808 13.4722 10 13.4722ZM10 3.75C10.2894 3.75 10.5353 3.85127 10.7379 4.05382C10.9404 4.25637 11.0417 4.50231 11.0417 4.79167L11.0417 11.0417C11.0417 11.331 10.9404 11.577 10.7379 11.7795C10.5353 11.9821 10.2894 12.0833 10 12.0833C9.71068 12.0833 9.46473 11.9821 9.26218 11.7795C9.05963 11.577 8.95836 11.331 8.95836 11.0417L8.95836 4.79167C8.95836 4.50231 9.05963 4.25636 9.26218 4.05382C9.46473 3.85127 9.71068 3.75 10 3.75Z"
            fill={color}
        />
    </Svg>
);
