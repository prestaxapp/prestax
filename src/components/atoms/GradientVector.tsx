import React from 'react';
import { View, Image } from 'react-native';
import type { DimensionValue } from 'react-native';

interface Props {
    width?: DimensionValue;
    height?: DimensionValue;
}

export const GradientVector = ({ width = '100%', height = 300 }: Props) => {
    return (
        <View style={{ width, height, overflow: 'visible', alignItems: 'center' }}>
            <Image 
                source={require('../../../assets/Client/Vector 2.png')} 
                style={{
                    position: 'absolute',
                    top: -2,
                    height: 600, // Altura suficiente
                }} 
                resizeMode="contain" 
            />
        </View>
    );
};
