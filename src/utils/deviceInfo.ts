import { Platform } from 'react-native';
import * as Device from 'expo-device';

export interface DeviceInfo {
    deviceModel: string;
    deviceOS: string;
}

/**
 * Detecta modelo y OS del dispositivo.
 * - Web: parsea navigator.userAgent para extraer modelo iPhone, Android, etc.
 * - Native iOS/Android: usa expo-device para el modelo exacto ("iPhone 14 Pro", "Pixel 7")
 */
export const getDeviceInfo = (): DeviceInfo => {
    if (Platform.OS === 'web') {
        return getWebDeviceInfo();
    }
    return getNativeDeviceInfo();
};

const getWebDeviceInfo = (): DeviceInfo => {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';

    let deviceModel = 'Desconocido';
    let deviceOS = 'Web';

    // iPhone detection
    const iphoneMatch = ua.match(/iPhone(?:\s+OS\s+([\d_]+))?/);
    if (iphoneMatch) {
        const osVer = iphoneMatch[1] ? iphoneMatch[1].replace(/_/g, '.') : '';
        deviceModel = 'iPhone';
        deviceOS = `iOS ${osVer}`.trim();
        return { deviceModel, deviceOS };
    }

    // iPad detection
    const ipadMatch = ua.match(/iPad.*OS\s+([\d_]+)/);
    if (ipadMatch) {
        const osVer = ipadMatch[1].replace(/_/g, '.');
        deviceModel = 'iPad';
        deviceOS = `iPadOS ${osVer}`;
        return { deviceModel, deviceOS };
    }

    // Android detection (includes Samsung model)
    const androidMatch = ua.match(/Android\s+([\d.]+);\s*([^)]+)\)/);
    if (androidMatch) {
        const osVer = androidMatch[1];
        const rawModel = androidMatch[2].trim();
        const galaxyMatch = rawModel.match(/(SM-[A-Z0-9]+)/);
        deviceModel = galaxyMatch ? `Samsung ${galaxyMatch[1]}` : rawModel;
        deviceOS = `Android ${osVer}`;
        return { deviceModel, deviceOS };
    }

    // Mac desktop
    if (ua.includes('Macintosh')) {
        const macMatch = ua.match(/Mac OS X ([\d_]+)/);
        const osVer = macMatch ? macMatch[1].replace(/_/g, '.') : '';
        deviceModel = 'Mac';
        deviceOS = `macOS ${osVer}`.trim();
        return { deviceModel, deviceOS };
    }

    // Windows
    if (ua.includes('Windows')) {
        return { deviceModel: 'PC', deviceOS: 'Windows' };
    }

    return { deviceModel: 'Web Browser', deviceOS: 'Desconocido' };
};

const getNativeDeviceInfo = (): DeviceInfo => {
    // expo-device proporciona el modelo exacto: "iPhone 14 Pro", "Pixel 7", etc.
    const deviceModel = Device.modelName ?? `${Platform.OS === 'ios' ? 'iOS' : 'Android'} Device`;
    const deviceOS = `${Device.osName ?? Platform.OS} ${Device.osVersion ?? ''}`.trim();
    return { deviceModel, deviceOS };
};
