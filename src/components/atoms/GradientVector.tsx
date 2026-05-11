import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Metrics } from '../../theme/Metrics';

interface Props {
    width?: number | string;
    height?: number | string;
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
