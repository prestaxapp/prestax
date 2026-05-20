import React from 'react';
import Svg, { G, Rect, Path, Defs, ClipPath } from 'react-native-svg';

interface Props { size?: number; color?: string; }

/**
 * IconInfo — Icono informativo (ℹ️) basado en assets/icon/Info.svg.
 *
 * Tamaño por defecto: 14×14px (como especificado en diseño).
 * Uso principal: acompañar la etiqueta "Cuota estimada" en el
 * componente LoanCalculator con un tooltip informativo.
 */
export const IconInfo = ({ size = 14, color = 'rgba(255,255,255,0.85)' }: Props) => (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <G clipPath="url(#clip0_info)">
            <Rect
                x="1.084"
                y="1.187"
                width="11.832"
                height="11.627"
                rx="5.813"
                fill="white"
                fillOpacity={0.1}
            />
            <Path
                d="M6.895 12.808C10.102 12.808 12.705 10.204 12.705 6.997C12.705 3.79 10.102 1.187 6.895 1.187C3.687 1.187 1.084 3.79 1.084 6.997C1.084 10.204 3.687 12.808 6.895 12.808ZM6.895 11.839C4.217 11.839 2.052 9.674 2.052 6.997C2.052 4.32 4.217 2.155 6.895 2.155C9.572 2.155 11.737 4.32 11.737 6.997C11.737 9.674 9.572 11.839 6.895 11.839Z"
                fill={color}
            />
            <Path
                d="M5.898 10.187H8.216C8.45 10.187 8.632 10.016 8.632 9.783C8.632 9.561 8.45 9.384 8.216 9.384H7.51V6.485C7.51 6.177 7.356 5.972 7.066 5.972H5.995C5.761 5.972 5.579 6.148 5.579 6.371C5.579 6.604 5.761 6.775 5.995 6.775H6.604V9.384H5.898C5.664 9.384 5.482 9.561 5.482 9.783C5.482 10.016 5.664 10.187 5.898 10.187ZM6.843 5.026C7.259 5.026 7.584 4.696 7.584 4.28C7.584 3.864 7.259 3.534 6.843 3.534C6.433 3.534 6.103 3.864 6.103 4.28C6.103 4.696 6.433 5.026 6.843 5.026Z"
                fill={color}
            />
        </G>
        <Defs>
            <ClipPath id="clip0_info">
                <Rect
                    x="1.084"
                    y="1.187"
                    width="11.832"
                    height="11.627"
                    rx="5.813"
                    fill="white"
                />
            </ClipPath>
        </Defs>
    </Svg>
);
