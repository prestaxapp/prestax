import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Colors } from '../../theme/Colors';

export interface HeadingTitleProps {
    ubicacion?: 'izq' | 'minimizado' | 'chat' | 'minim. search' | 'Seleccionar';
    tamano?: 'max' | 'min';
    actionType?: 'setting' | 'actions';
    label?: string | React.ReactNode;
    text?: string;
    showBreadcrumbs?: boolean;
    showChevron?: boolean;
    showClose?: boolean;
    showDescription?: boolean;
    showMultiStepProgressBar?: boolean;
    showTitleContainer?: boolean;
    
    // Callbacks
    onPressBack?: () => void;
    onPressClose?: () => void;
    onPressAction?: () => void;
    
    // Multi-step
    currentStep?: number;
    totalSteps?: number;
}

/**
 * Organism/HeadingTitle
 *
 * Un Super-Componente que renderiza diferentes cabeceras basado en `ubicacion`.
 */
export const HeadingTitle: React.FC<HeadingTitleProps> = ({
    ubicacion = 'izq',
    tamano = 'max',
    actionType = 'setting',
    label = 'Title',
    text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    showBreadcrumbs = false,
    showChevron = true,
    showClose = true,
    showDescription = true,
    showMultiStepProgressBar = false,
    showTitleContainer = true,
    currentStep = 1,
    totalSteps = 2,
    onPressBack,
    onPressClose,
    onPressAction,
}) => {

    const renderBackButton = () => {
        if (!showChevron) return null;
        return (
            <TouchableOpacity style={styles.iconButton} onPress={onPressBack} activeOpacity={0.7}>
                <Icon name="chevron-back" size={36} color="white" />
            </TouchableOpacity>
        );
    };

    const renderCloseButton = () => {
        if (!showClose) return null;
        return (
            <TouchableOpacity style={styles.iconButton} onPress={onPressClose} activeOpacity={0.7}>
                {/* Fallback to close-outline if small close doesn't exist */}
                {/* @ts-ignore - 'close' not yet in ICON_REGISTRY */}
                <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
        );
    };

    const renderMultiStepProgress = () => {
        if (!showMultiStepProgressBar) return null;
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

    // ── 1. Variante: "izq" (Expandido por defecto con alineación izquierda) ──
    if (ubicacion === 'izq') {
        const isMin = tamano === 'min';
        return (
            <View style={[styles.container, isMin ? styles.containerMin : styles.containerMax]}>
                <View style={styles.topRowSpaceBetween}>
                    {renderBackButton()}
                    {renderMultiStepProgress()}
                    {renderCloseButton()}
                </View>
                {showTitleContainer && (
                    <View style={isMin ? styles.titleBoxMin : styles.titleBoxMax}>
                        <Text style={isMin ? styles.titleMin : styles.titleMax}>{label}</Text>
                        {!isMin && showDescription && (
                            <Text style={styles.descriptionText}>{text}</Text>
                        )}
                    </View>
                )}
            </View>
        );
    }

    // ── 2. Variante: "minimizado" (Título centrado, nav a los lados) ──
    if (ubicacion === 'minimizado') {
        return (
            <View style={styles.containerMin}>
                <View style={styles.topRowCenterTitle}>
                    <View style={styles.iconBoxLeft}>{renderBackButton()}</View>
                    {showTitleContainer && (
                        <View style={styles.titleCenterBox}>
                            <Text style={styles.titleMin}>{label}</Text>
                        </View>
                    )}
                    <View style={styles.iconBoxRight}>{renderCloseButton()}</View>
                </View>
                {tamano === 'max' && showDescription && (
                    <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionText}>{text}</Text>
                    </View>
                )}
            </View>
        );
    }

    // ── 3. Variante: "chat" (Mónica Armoa, o foto) ──
    if (ubicacion === 'chat') {
        return (
            <View style={styles.containerChat}>
                <View style={styles.chatProfileRow}>
                    <View style={styles.chatProfilePicture}>
                        {/* @ts-ignore - 'person' not yet in ICON_REGISTRY */}
                        <Icon name="person" size={24} color="white50" />
                    </View>
                    <Text style={styles.titleMin}>Mónica Armoa</Text>
                </View>
                {actionType === 'actions' && (
                    <TouchableOpacity onPress={onPressAction} style={styles.chatActionBtn}>
                        <Text style={styles.chatActionText}>Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    // ── 4. Variante: "minim. search" (Barra de búsqueda) ──
    if (ubicacion === 'minim. search') {
        return (
            <View style={styles.containerSearch}>
                <View style={styles.topRowCenterTitle}>
                    <View style={styles.iconBoxLeft}>{renderBackButton()}</View>
                    <View style={styles.titleCenterBox}>
                        <Text style={styles.titleMin}>{label}</Text>
                    </View>
                    <View style={styles.iconBoxRight}>{renderCloseButton()}</View>
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
    }

    // ── 5. Variante: "Seleccionar" (Seleccionar todo) ──
    if (ubicacion === 'Seleccionar') {
        return (
            <View style={styles.containerMax}>
                <View style={styles.topRowSpaceBetween}>
                    <View style={styles.topRowSelectLeft}>
                        {renderBackButton()}
                        <Text style={styles.selectionCount}>0</Text>
                    </View>
                    <View style={styles.iconActionGroup}>
                        <TouchableOpacity onPress={onPressAction} style={styles.actionIconPad}>
                            {/* @ts-ignore - 'pencil' not yet in ICON_REGISTRY */}
                            <Icon name="pencil" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onPressAction} style={styles.actionIconPad}>
                            {/* @ts-ignore - 'trash' not yet in ICON_REGISTRY */}
                            <Icon name="trash" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
                {showTitleContainer && (
                    <View style={styles.titleBoxMax}>
                        <TouchableOpacity style={styles.selectAllRow}>
                            {/* @ts-ignore - 'square-outline' not yet in ICON_REGISTRY */}
                            <Icon name="square-outline" size={24} color="white50" />
                            <Text style={styles.selectAllText}>Seleccionar todo</Text>
                        </TouchableOpacity>
                        {showDescription && (
                            <Text style={styles.descriptionText}>{text}</Text>
                        )}
                    </View>
                )}
            </View>
        );
    }

    // Fallback
    return null;
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'stretch',
    },
    containerMin: {
        width: '100%',
        paddingVertical: 16,
    },
    containerMax: {
        width: '100%',
        paddingTop: 40,
        paddingBottom: 20,
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
        backgroundColor: '#0B6FC7', // Figma brand/primary for stepper
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
        fontFamily: 'Lufga-Medium', // Fallback from Montserrat SemiBold
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
        fontFamily: 'Lufga-Medium', // Fallback from Gilroy Semibold
        fontSize: 16,
    },
});
