/**
 * YouFormScreen
 *
 * Pantalla que embebe el YouForm de Prestax.
 * Se muestra después de que el usuario confirma en ConfirmScreen.
 *
 * En web → usa <iframe> nativo.
 * En iOS/Android → usa <WebView> de react-native-webview.
 *
 * ⚠️ Para cambiar el formulario, actualizar YOUFORM_URL abajo.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Text } from '../components/atoms/Text';
import { Colors } from '../theme/Colors';

// Conditional import — only loaded on native platforms
let WebView: any = null;
if (Platform.OS !== 'web') {
    try {
        WebView = require('react-native-webview').default;
    } catch {
        // Will render fallback if package is missing
    }
}

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const YOUFORM_URL = 'https://app.youform.com/forms/vbyuoc6z';
const PLACEHOLDER_URL = 'YOUFORM_URL_PENDIENTE';
// ─────────────────────────────────────────────────────────────────────────────

interface YouFormScreenProps {
    /** Monto pre-seleccionado para pre-fill (si YouForm soporta query params) */
    amount?: number;
    /** Cuotas pre-seleccionadas para pre-fill */
    months?: number;
}

export const YouFormScreen: React.FC<YouFormScreenProps> = ({ amount, months }) => {
    const [isLoading, setIsLoading] = useState(true);

    // Construir URL con query params para pre-fill si el form lo soporta
    const isPending = (YOUFORM_URL as string) === PLACEHOLDER_URL;
    const formUrl = !isPending
        ? `${YOUFORM_URL}?amount=${amount ?? ''}&months=${months ?? ''}`
        : YOUFORM_URL;

    if (isPending) {
        return (
            <View style={styles.placeholderContainer}>
                <Text variant="headline" color="white" align="center">
                    YouForm
                </Text>
                <Text variant="body" style={styles.placeholderSubtitle} align="center">
                    URL del formulario pendiente de configuración.{'\n'}
                    Actualizá YOUFORM_URL en YouFormScreen.tsx
                </Text>
            </View>
        );
    }

    // Web: iframe nativo
    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={Colors.primaryMain} />
                    </View>
                )}
                <iframe
                    src={formUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: Colors.backgroundDefault,
                    }}
                    onLoad={() => setIsLoading(false)}
                    allow="camera; microphone"
                    title="Prestax Form"
                />
            </View>
        );
    }

    // Native (iOS / Android): WebView de react-native-webview
    if (WebView) {
        return (
            <View style={styles.container}>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={Colors.primaryMain} />
                    </View>
                )}
                <WebView
                    source={{ uri: formUrl }}
                    style={styles.webview}
                    onLoadEnd={() => setIsLoading(false)}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState={false}
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    scalesPageToFit={Platform.OS === 'android'}
                />
            </View>
        );
    }

    // Fallback si react-native-webview no se pudo cargar
    return (
        <View style={styles.placeholderContainer}>
            <Text variant="headline" color="white" align="center">
                Formulario
            </Text>
            <Text variant="body" style={styles.placeholderSubtitle} align="center">
                Error al cargar el formulario.{'\n'}
                Verificá que react-native-webview esté instalado.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundDefault,
    },
    webview: {
        flex: 1,
        backgroundColor: Colors.backgroundDefault,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundDefault,
        zIndex: 1,
    },
    placeholderContainer: {
        flex: 1,
        backgroundColor: Colors.backgroundDefault,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    placeholderSubtitle: {
        color: Colors.white50,
        fontFamily: 'Lufga-Regular',
        fontSize: 14,
    },
});
