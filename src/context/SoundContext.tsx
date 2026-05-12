import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// --- Tipos y Configuración ---
export type SoundType = 'action' | 'hover' | 'back' | 'hover2' | 'doc';

interface SoundContextType {
    volume: number;
    isMuted: boolean;
    setVolume: (v: number) => void;
    setIsMuted: (m: boolean) => void;
    playSound: (type: SoundType | string, overrideFile?: any) => Promise<void>;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const STORAGE_KEYS = {
    VOLUME: '@prestax_volume',
    MUTED: '@prestax_muted',
};

const STATIC_ASSETS: Record<string, any> = {
    'action': require('../../assets/ui_sound/atras_aceptar.ogg'),
    'back': require('../../assets/ui_sound/atras_aceptar.ogg'),
    'hover': require('../../assets/ui_sound/hover.ogg'),
    'hover2': require('../../assets/ui_sound/hover2.ogg'),
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [volume, setVolumeState] = useState(0.8);
    const [isMuted, setIsMutedState] = useState(false);
    
    // Pool de objetos de sonido
    const soundsRef = useRef<Record<string, Audio.Sound>>({});
    const loadingPromises = useRef<Record<string, Promise<Audio.Sound | null>>>({});

    // 1. Inicialización Ultra-Rápida del Motor
    useEffect(() => {
        const initAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    staysActiveInBackground: false,
                    interruptionModeIOS: InterruptionModeIOS.DuckOthers, // Cambiado para evitar lagueo inicial
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                    playThroughEarpieceAndroid: false,
                });
            } catch (e) {}
        };
        initAudio();
    }, []);

    // 2. Carga de settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                if (AsyncStorage?.getItem) {
                    const [v, m] = await Promise.all([
                        AsyncStorage.getItem(STORAGE_KEYS.VOLUME),
                        AsyncStorage.getItem(STORAGE_KEYS.MUTED)
                    ]);
                    if (v !== null) setVolumeState(parseFloat(v));
                    if (m !== null) setIsMutedState(m === 'true');
                }
            } catch (e) {}
        };
        loadSettings();
    }, []);

    // 3. Función de Carga (Garantiza que el sonido esté listo antes de sonar)
    const getOrLoadSound = async (id: string, asset: any): Promise<Audio.Sound | null> => {
        if (soundsRef.current[id]) return soundsRef.current[id];
        
        if (loadingPromises.current[id]) return loadingPromises.current[id];

        loadingPromises.current[id] = (async () => {
            try {
                // En Web usamos downloadFirst para asegurar que el asset esté local antes del primer render
                const { sound } = await Audio.Sound.createAsync(
                    asset, 
                    { shouldPlay: false, volume: 0 },
                    null,
                    Platform.OS === 'web'
                );
                soundsRef.current[id] = sound;
                return sound;
            } catch (e) {
                return null;
            } finally {
                delete loadingPromises.current[id];
            }
        })();

        return loadingPromises.current[id];
    };

    // Pre-cargar esenciales + Listener para desbloquear Audio en Web
    useEffect(() => {
        Object.entries(STATIC_ASSETS).forEach(([key, asset]) => getOrLoadSound(key, asset));

        // Hack para Web: Muchos browsers bloquean audio hasta el primer click
        if (Platform.OS === 'web') {
            const unlock = () => {
                // Intentamos sonar un silencio para activar el contexto
                Object.values(soundsRef.current).forEach(s => s.getStatusAsync().then(status => {
                    if (status.isLoaded) s.playAsync().then(() => s.stopAsync());
                }));
                window.removeEventListener('click', unlock);
            };
            window.addEventListener('click', unlock);
        }

        return () => {
            Object.values(soundsRef.current).forEach(s => s.unloadAsync());
        };
    }, []);

    const setVolume = async (v: number) => {
        setVolumeState(v);
        try { if (AsyncStorage?.setItem) await AsyncStorage.setItem(STORAGE_KEYS.VOLUME, v.toString()); } catch (e) {}
    };

    const setIsMuted = async (m: boolean) => {
        setIsMutedState(m);
        try { if (AsyncStorage?.setItem) await AsyncStorage.setItem(STORAGE_KEYS.MUTED, m.toString()); } catch (e) {}
    };

    // 4. Reproducción Instantánea (Sin InteractionManager para evitar lagueo en UI rápida)
    const playSound = useCallback(async (type: SoundType | string, overrideFile?: any) => {
        if (isMuted) return;

        try {
            const soundId = overrideFile ? `override_${type}` : type;
            const asset = overrideFile || STATIC_ASSETS[type as string];
            
            if (!asset) return;

            const soundObj = await getOrLoadSound(soundId, asset);
            if (!soundObj) return;

            // Reset instantáneo
            await soundObj.stopAsync();
            await soundObj.setVolumeAsync(volume);
            await soundObj.playAsync();

            // Auto-descarga de overrides para liberar RAM
            if (overrideFile) {
                soundObj.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        soundObj.unloadAsync();
                        delete soundsRef.current[soundId];
                    }
                });
            }

        } catch (error) {
            // Error silencioso para no romper la UX
        }
    }, [isMuted, volume]);

    return (
        <SoundContext.Provider value={{ volume, isMuted, setVolume, setIsMuted, playSound }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) throw new Error('useSound must be used within a SoundProvider');
    return context;
};

interface SoundOverrideContextType { overrides: Partial<Record<SoundType, any>>; }
const SoundOverrideContext = createContext<SoundOverrideContextType>({ overrides: {} });

export const SoundOverrideProvider: React.FC<{ overrides: Partial<Record<SoundType, any>>, children: React.ReactNode }> = ({ overrides, children }) => {
    return <SoundOverrideContext.Provider value={{ overrides }}>{children}</SoundOverrideContext.Provider>;
};

export const useSoundOverride = () => useContext(SoundOverrideContext);
