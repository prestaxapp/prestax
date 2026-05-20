import React from 'react';
import { View, StyleSheet, Pressable, TextInput, Animated, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Colors } from '../../theme/Colors';
import { Metrics } from '../../theme/Metrics';
import { useStickyHeaderAnimation } from '../../animations/useStickyHeaderAnimation';
import { useSound, useSoundOverride } from '../../context/SoundContext';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// ─────────────────────────────────────────────────────────────────────────────
// ── TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base properties shared across all Heading variants.
 */
export interface HeadingBaseProps {
    /** Primary text or custom React element for the title */
    label?: string | React.ReactNode;
    /** Secondary description text shown below the title */
    text?: string;
    /** Toggle the back chevron button visibility */
    showChevron?: boolean;
    /** Toggle the close button visibility */
    showClose?: boolean;
    /** Toggle the main title container visibility */
    showTitleContainer?: boolean;
    /** Toggle the description text visibility */
    showDescription?: boolean;
    
    /** Callback triggered when back button is pressed */
    onPressBack?: () => void;
    /** Callback triggered when close button is pressed */
    onPressClose?: () => void;
    /** Callback triggered for specific actions (e.g., in chat or selection mode) */
    onPressAction?: () => void;
}

/**
 * Properties specific to the left-aligned ("izq") variant, which includes multi-step and sticky features.
 */
export interface HeadingIzqProps extends HeadingBaseProps {
    ubicacion: 'izq';
    /** Sizing variant for the left-aligned header */
    tamano?: 'max' | 'min';
    /** Toggle the multi-step progress bar */
    showMultiStepProgressBar?: boolean;
    /** Current step for the progress bar (1-indexed) */
    currentStep?: number;
    /** Total number of steps for the progress bar */
    totalSteps?: number;
    
    /** Enable scroll-driven sticky behavior */
    isSticky?: boolean;
    /** Animated value tracking ScrollView's Y offset */
    scrollY?: Animated.Value;
    /** The title text used when collapsed into sticky mode */
    smallTitle?: string;
    
    // Kept for backward compatibility if passed unnecessarily by legacy screens
    actionType?: 'setting' | 'actions';
}

export interface HeadingMinimizadoProps extends HeadingBaseProps {
    ubicacion: 'minimizado';
    tamano?: 'max' | 'min';
    actionType?: 'setting' | 'actions';
}

export interface HeadingChatProps extends HeadingBaseProps {
    ubicacion: 'chat';
    actionType?: 'setting' | 'actions';
}

export interface HeadingSearchProps extends HeadingBaseProps {
    ubicacion: 'minim. search';
    actionType?: 'setting' | 'actions';
}

export interface HeadingSeleccionarProps extends HeadingBaseProps {
    ubicacion: 'Seleccionar';
    actionType?: 'setting' | 'actions';
}

/**
 * Discriminated union of all possible heading properties based on the `ubicacion` discriminant.
 */
export type HeadingTitleProps = 
    | HeadingIzqProps 
    | HeadingMinimizadoProps 
    | HeadingChatProps 
    | HeadingSearchProps 
    | HeadingSeleccionarProps;

// ─────────────────────────────────────────────────────────────────────────────
// ── INTERNAL ATOMS (Reusable within Heading)
// ─────────────────────────────────────────────────────────────────────────────

const BackButton: React.FC<{ show?: boolean; onPress?: () => void }> = ({ show, onPress }) => {
    const { playSound } = useSound();
    const { overrides } = useSoundOverride();
    
    if (!show) return null;

    const handlePress = () => {
        playSound('back', overrides['back']);
        onPress?.();
    };

    return (
        <Pressable 
            style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={handlePress}
            // @ts-ignore - web support
            onHoverIn={() => playSound('hover', overrides['hover'])}
        >
            <Icon name="chevron-back" size={36} color="white" />
        </Pressable>
    );
};

const CloseButton: React.FC<{ show?: boolean; onPress?: () => void }> = ({ show, onPress }) => {
    const { playSound } = useSound();
    const { overrides } = useSoundOverride();
    
    if (!show) return null;

    const handlePress = () => {
        playSound('action', overrides['action']);
        onPress?.();
    };

    return (
        <Pressable 
            style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={handlePress}
            // @ts-ignore - web support
            onHoverIn={() => playSound('hover', overrides['hover'])}
        >
            {/* @ts-ignore - 'close' not yet in ICON_REGISTRY */}
            <Icon name="close" size={20} color="white" />
        </Pressable>
    );
};

const MultiStepProgress: React.FC<{ show?: boolean; currentStep?: number }> = ({ show, currentStep = 1 }) => {
    if (!show) return null;
    return (
        <View style={styles.stepperContainer}>
            <View style={[styles.stepCircle, currentStep >= 1 ? styles.stepActive : styles.stepInactive]}>
                <Text variant="footnote" color={currentStep >= 1 ? 'white' : 'white50'}>1</Text>
            </View>
            <View style={styles.stepLineContainer}>
                <View style={[styles.stepLine, currentStep >= 2 ? styles.stepLineActive : {}]} />
            </View>
            <View style={[styles.stepCircle, currentStep >= 2 ? styles.stepActive : styles.stepInactive]}>
                <Text variant="footnote" color={currentStep >= 2 ? 'white' : 'white50'}>2</Text>
            </View>
        </View>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── SUB-COMPONENTS (Variants)
// ─────────────────────────────────────────────────────────────────────────────

const HeadingIzq: React.FC<HeadingIzqProps> = (props) => {
    const isMin = props.tamano === 'min';
    const anims = useStickyHeaderAnimation(props.scrollY);

    if (props.scrollY && props.isSticky && anims) {
        return (
            <View style={[styles.container, styles.containerMax, styles.stickyWrapper]} pointerEvents="box-none">
                {/* Sticky Gradient Background with subtle Blur for slow devices */}
                <AnimatedBlurView
                    tint="dark"
                    intensity={40} // Increased intensity so it's noticeable
                    experimentalBlurMethod="dimezisBlurView" // Fix for Android performance and visibility
                    style={[
                        StyleSheet.absoluteFill, 
                        { 
                            opacity: anims.stickyBgOpacity, 
                            zIndex: 0,
                            bottom: undefined, // Don't cover the whole container, just the header
                            height: Platform.OS === 'ios' ? 100 : 88
                        }
                    ]}
                >
                    <LinearGradient
                        // Using backgroundDefault to backgroundDefault+00 (transparent) avoids gray banding
                        colors={[Colors.backgroundDefault, Colors.backgroundDefault + '00']}
                        locations={[0, 1]}
                        style={StyleSheet.absoluteFill}
                    />
                </AnimatedBlurView>

                {/* Top Row: Chevron + Small Title + Close */}
                <View style={[styles.topRowSpaceBetween, { zIndex: 10 }]}>
                    <View style={styles.iconBoxLeft}>
                        <BackButton show={props.showChevron} onPress={props.onPressBack} />
                    </View>
                    
                    <Animated.View style={[styles.titleCenterBox, { opacity: anims.smallTitleOpacity, transform: [{ translateY: anims.smallTitleTranslateY }] }]}>
                        {props.smallTitle && (
                            <Text variant="title3Regular" numberOfLines={1} ellipsizeMode="tail">
                                {props.smallTitle}
                            </Text>
                        )}
                    </Animated.View>

                    <View style={styles.iconBoxRight}>
                        <CloseButton show={props.showClose} onPress={props.onPressClose} />
                    </View>
                </View>

                {/* Big Title (Instancia 1) */}
                {props.showTitleContainer && (
                    <Animated.View style={[isMin ? styles.titleBoxMin : styles.titleBoxMax, { opacity: anims.bigTitleOpacity, transform: [{ translateY: anims.bigTitleTranslateY }], zIndex: 5 }]}>
                        {typeof props.label === 'string' ? (
                            <Text style={isMin ? styles.titleMin : styles.titleMax}>{props.label}</Text>
                        ) : (
                            props.label
                        )}
                        {!isMin && props.showDescription && (
                            <Text style={styles.descriptionText}>{props.text}</Text>
                        )}
                    </Animated.View>
                )}
            </View>
        );
    }

    // Default non-sticky behavior
    return (
        <View style={[styles.container, isMin ? styles.containerMin : styles.containerMax]}>
            <View style={styles.topRowSpaceBetween}>
                <BackButton show={props.showChevron} onPress={props.onPressBack} />
                <MultiStepProgress show={props.showMultiStepProgressBar} currentStep={props.currentStep} />
                <CloseButton show={props.showClose} onPress={props.onPressClose} />
            </View>
            {props.showTitleContainer && (
                <View style={isMin ? styles.titleBoxMin : styles.titleBoxMax}>
                    {typeof props.label === 'string' ? (
                        <Text style={isMin ? styles.titleMin : styles.titleMax}>{props.label}</Text>
                    ) : (
                        props.label
                    )}
                    {!isMin && props.showDescription && (
                        <Text style={styles.descriptionText}>{props.text}</Text>
                    )}
                </View>
            )}
        </View>
    );
};

const HeadingMinimizado: React.FC<HeadingMinimizadoProps> = (props) => (
    <View style={styles.containerMin}>
        <View style={styles.topRowCenterTitle}>
            <View style={styles.iconBoxLeft}>
                <BackButton show={props.showChevron} onPress={props.onPressBack} />
            </View>
            {props.showTitleContainer && (
                <View style={styles.titleCenterBox}>
                    <Text style={styles.titleMin}>{props.label as string}</Text>
                </View>
            )}
            <View style={styles.iconBoxRight}>
                <CloseButton show={props.showClose} onPress={props.onPressClose} />
            </View>
        </View>
        {props.tamano === 'max' && props.showDescription && (
            <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>{props.text}</Text>
            </View>
        )}
    </View>
);

const HeadingChat: React.FC<HeadingChatProps> = (props) => (
    <View style={styles.containerChat}>
        <View style={styles.chatProfileRow}>
            <View style={styles.chatProfilePicture}>
                {/* @ts-ignore - 'person' not yet in ICON_REGISTRY */}
                <Icon name="person" size={24} color="white50" />
            </View>
            <Text style={styles.titleMin}>Mónica Armoa</Text>
        </View>
        {props.actionType === 'actions' && (
            <TouchableOpacity onPress={props.onPressAction} style={styles.chatActionBtn}>
                <Text style={styles.chatActionText}>Cancelar</Text>
            </TouchableOpacity>
        )}
    </View>
);

const HeadingSearch: React.FC<HeadingSearchProps> = (props) => (
    <View style={styles.containerSearch}>
        <View style={styles.topRowCenterTitle}>
            <View style={styles.iconBoxLeft}>
                <BackButton show={props.showChevron} onPress={props.onPressBack} />
            </View>
            <View style={styles.titleCenterBox}>
                <Text style={styles.titleMin}>{props.label as string}</Text>
            </View>
            <View style={styles.iconBoxRight}>
                <CloseButton show={props.showClose} onPress={props.onPressClose} />
            </View>
        </View>
        <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
                {/* @ts-ignore - 'search' not yet in ICON_REGISTRY */}
                <Icon name="search" size={20} color="white50" />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Buscar"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
            </View>
        </View>
    </View>
);

const HeadingSeleccionar: React.FC<HeadingSeleccionarProps> = (props) => (
    <View style={styles.containerMax}>
        <View style={styles.topRowSpaceBetween}>
            <View style={styles.topRowSelectLeft}>
                <BackButton show={props.showChevron} onPress={props.onPressBack} />
                <Text style={styles.selectionCount}>0</Text>
            </View>
            <View style={styles.iconActionGroup}>
                <TouchableOpacity onPress={props.onPressAction} style={styles.actionIconPad}>
                    {/* @ts-ignore - 'pencil' not yet in ICON_REGISTRY */}
                    <Icon name="pencil" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={props.onPressAction} style={styles.actionIconPad}>
                    {/* @ts-ignore - 'trash' not yet in ICON_REGISTRY */}
                    <Icon name="trash" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
        {props.showTitleContainer && (
            <View style={styles.titleBoxMax}>
                <TouchableOpacity style={styles.selectAllRow}>
                    {/* @ts-ignore - 'square-outline' not yet in ICON_REGISTRY */}
                    <Icon name="square-outline" size={24} color="white50" />
                    <Text style={styles.selectAllText}>Seleccionar todo</Text>
                </TouchableOpacity>
                {props.showDescription && (
                    <Text style={styles.descriptionText}>{props.text}</Text>
                )}
            </View>
        )}
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// ── MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Organism/HeadingTitle
 *
 * A scalable super-component that routes to the correct Heading variant.
 * Refactored using Clean Architecture and SOLID principles.
 */
export const HeadingTitle: React.FC<HeadingTitleProps> = (props) => {
    // Default values mapping to maintain backward compatibility
    const hydratedProps = {
        tamano: 'max' as const,
        actionType: 'setting' as const,
        label: 'Title',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        showBreadcrumbs: false,
        showChevron: true,
        showClose: true,
        showDescription: true,
        showMultiStepProgressBar: false,
        showTitleContainer: true,
        currentStep: 1,
        totalSteps: 2,
        ...props,
    };

    switch (props.ubicacion) {
        case 'izq':
            return <HeadingIzq {...(hydratedProps as HeadingIzqProps)} />;
        case 'minimizado':
            return <HeadingMinimizado {...(hydratedProps as HeadingMinimizadoProps)} />;
        case 'chat':
            return <HeadingChat {...(hydratedProps as HeadingChatProps)} />;
        case 'minim. search':
            return <HeadingSearch {...(hydratedProps as HeadingSearchProps)} />;
        case 'Seleccionar':
            return <HeadingSeleccionar {...(hydratedProps as HeadingSeleccionarProps)} />;
        default:
            // Fallback default routing (equivalent to izq)
            return <HeadingIzq {...(hydratedProps as HeadingIzqProps)} ubicacion="izq" />;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// ── STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'stretch',
    },
    containerMin: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: Metrics.sideSpacing,
    },
    containerMax: {
        width: '100%',
        paddingTop: Platform.OS === 'ios' ? 52 : 40,
        paddingBottom: 20,
        paddingHorizontal: Metrics.sideSpacing,
    },
    topRowSpaceBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: 36,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // MultiStep config
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepActive: {
        backgroundColor: '#0B6FC7',
    },
    stepInactive: {
        borderWidth: 1,
        borderColor: '#B7D7F3',
    },
    stepLineContainer: {
        width: 24,
        height: 2,
        backgroundColor: '#B7D7F3',
        borderRadius: 4,
    },
    stepLine: {
        height: 2,
        width: 0,
        borderRadius: 4,
    },
    stepLineActive: {
        width: '100%',
        backgroundColor: '#0B6FC7',
    },

    // Title configs
    titleBoxMax: {
        marginTop: 20,
        gap: 4,
    },
    titleBoxMin: {
        marginTop: 16,
    },
    titleMax: {
        color: Colors.white,
        fontFamily: 'Lufga-Medium',
        fontSize: 28,
        lineHeight: 28,
    },
    titleMin: {
        color: Colors.white,
        fontFamily: 'Lufga-Medium',
        fontSize: 18,
        lineHeight: 18,
    },
    descriptionText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'Lufga-Regular',
        fontSize: 17,
        lineHeight: 22,
    },

    // Minimizado layout
    topRowCenterTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    iconBoxLeft: {
        width: 36,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    iconBoxRight: {
        width: 36,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    titleCenterBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    descriptionBox: {
        alignItems: 'center',
        marginTop: 16,
    },

    // Chat Layout
    containerChat: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: Metrics.sideSpacing,
    },
    chatProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    chatProfilePicture: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatActionBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    chatActionText: {
        color: Colors.primaryMain,
        fontFamily: 'Lufga-Medium',
        fontSize: 14,
    },

    // Search Layout
    containerSearch: {
        paddingTop: 40,
        paddingBottom: 20,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: Metrics.sideSpacing,
    },
    searchBarContainer: {
        width: '100%',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 32,
        height: 48,
        paddingHorizontal: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: Colors.white,
        fontFamily: 'Lufga-Regular',
        fontSize: 15,
        height: '100%',
    },

    // Seleccionar Layout
    topRowSelectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    selectionCount: {
        color: Colors.primaryMain,
        fontFamily: 'Lufga-Medium',
        fontSize: 16,
    },
    iconActionGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    actionIconPad: {
        padding: 4,
    },
    selectAllRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8,
    },
    selectAllText: {
        color: Colors.white,
        fontFamily: 'Lufga-Medium',
        fontSize: 16,
    },
    
    // Sticky Header additional styles
    stickyWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
    },
    title3Regular: {
        color: Colors.white,
        fontFamily: 'Lufga-Regular',
        fontSize: 18,
        lineHeight: 22,
    },
});
