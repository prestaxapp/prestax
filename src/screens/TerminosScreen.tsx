/**
 * TerminosScreen — Screen
 *
 * Pantalla de Términos y Condiciones.
 * Se muestra en el flujo de solicitud de crédito, entre ConfirmScreen y YouFormScreen.
 *
 * Basada en el frame "Terminos" de Figma: node 40002371:78165
 * - Variables: Primary/main #00DBBF, background/FullWhite #0a221f, Text/primary #ffffff
 * - Tipografía: Lufga Medium 28px (Título), Lufga Regular 15px (body)
 *
 * Estructura:
 *  1. GradientVector de fondo (decorativo)
 *  2. HeadingTitle (back button + título "Términos y condiciones")
 *  3. ScrollView con:
 *     - Subtítulo con logo "Crédito otorgado por VIVA"
 *     - Texto legal completo
 *  4. FixedButtonBar fijo al pie ("Acepto" + "No acepto")
 */
import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Animated,
} from 'react-native';
import { Text } from '../components/atoms/Text';
import { HeadingTitle } from '../components/organisms/HeadingTitle';
import { FixedButtonBar } from '../components/organisms/FixedButtonBar';
import { GradientVector } from '../components/atoms/GradientVector';
import { Colors } from '../theme/Colors';
import { sha256 } from '../utils/sha256';
import { SoundOverrideProvider } from '../context/SoundContext';

interface TerminosScreenProps {
    onBack: () => void;
    onAccept: () => void;
    loading?: boolean;
}

export const TERMINOS_TEXT = `1. TUS DATOS Y EVALUACIÓN
En PRESTAX queremos darte la mejor opción. Por eso, al usar la app, nos das permiso para verificar tus datos, tu perfil crediticio y conectar tu perfil con la entidad financiera que mejor se adapte a tus necesidades. Comprendés y aceptás que, gracias a esta información, dicha entidad y empresas aliadas quedan facultadas para verificar tu perfil crediticio a través de los burós de crédito autorizados. Esto nos ayuda a conocer tu historial, procesar tu solicitud de manera ágil y protegerte de fraudes.

2. ESTAMOS EN CONTACTO
Nos encanta estar conectados. Nos autorizás a que desde PRESTAX o a través de nuestras empresas aliadas te escribamos por WhatsApp, te llamemos, te mandemos SMS o correos electrónicos para notificarte cómo va tu solicitud, darte soporte o enviarte ofertas que te puedan interesar y beneficiar.

3. RESPONSABILIDAD LEGAL
A los efectos de cumplimiento con la legislación vigente en Paraguay, el usuario comprende que la marca y plataforma PRESTAX son operadas de forma unipersonal por Santiago Ezequiel Henry Moreno con RUC 4926567-9, actuando exclusivamente como canal de conexión tecnológica, siendo las entidades financieras y terceros autorizados los responsables de realizar las consultas pertinentes en los burós de crédito locales para la concesión del servicio.`;

export const TERMINOS_VERSION = 'v1.0';
export const TERMINOS_HASH = sha256(TERMINOS_TEXT);

export const TerminosScreen: React.FC<TerminosScreenProps> = ({ onBack, onAccept, loading = false }) => {
    const scrollY = useRef(new Animated.Value(0)).current;

    const terminosOverrides = {
        action: require('../../assets/ui_sound/doc.mp3'),
    };

    return (
        <SoundOverrideProvider overrides={terminosOverrides}>
            <View style={styles.screen}>
            {/* ── GradientVector decorativo de fondo ── */}
            <View style={styles.gradientBg} pointerEvents="none">
                <GradientVector width="100%" height={393.909} />
            </View>

            <View style={styles.contentWrapper}>
                {/* ── 1. Header con HeadingTitle (Sticky) ── */}
                <HeadingTitle
                    ubicacion="izq"
                    tamano="max"
                    actionType="setting"
                    showChevron={true}
                    showClose={false}
                    showMultiStepProgressBar={false}
                    showTitleContainer={true}
                    showDescription={false}
                    onPressBack={onBack}
                    label="Términos y condiciones"
                    isSticky={true}
                    scrollY={scrollY}
                    smallTitle="Términos y condiciones"
                />

                {/* ── Scrollable content ── */}
                <Animated.ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingTop: 144 }]}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                >
                    {/* ── 3. Texto legal ── */}
                    <Text style={styles.bodyText}>
                        {TERMINOS_TEXT}
                    </Text>
                </Animated.ScrollView>

                {/* ── 4. FixedButtonBar — fuera del scroll, fijo al pie ── */}
                <FixedButtonBar
                    primaryLabel="Acepto"
                    onPressPrimary={onAccept}
                    onPressBack={onBack}
                    backLabel="No acepto"
                    loading={loading}
                />
            </View>
        </View>
        </SoundOverrideProvider>
    );
};

const styles = StyleSheet.create({
    // Pantalla completa — fondo backgroundDefault
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: Colors.backgroundDefault,
    },

    // GradientVector decorativo absoluto
    gradientBg: {
        position: 'absolute',
        left: 0,
        top: -75,
        width: '100%',
        height: 393.909,
        zIndex: 0,
    },

    // Wrapper que contiene scroll + fixed bar
    contentWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },

    // Contenido del scroll
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16, // Spacing/Sidespacing: 16 (variable Figma)
        paddingBottom: 16,
    },

    // Subtítulo "Crédito otorgado por VIVA"
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    subtitleText: {
        color: Colors.white,
        fontFamily: 'Lufga-Medium',
        fontSize: 18,          // Title 3: size 18 (variable Figma)
        lineHeight: 18,
    },
    logoImage: {
        width: 61,
        height: 39,
        marginLeft: 4,
    },

    // Cuerpo del texto legal
    bodyText: {
        color: Colors.white,           // Text/primary: #ffffff (variable Figma)
        fontFamily: 'Lufga-Regular',   // Subheadline: Regular (variable Figma)
        fontSize: 15,                  // Font/Size/md: 15 (variable Figma)
        lineHeight: 22,                // 1.2 × 18 = 21.6 → 22 aprox (Figma lineHeight)
        letterSpacing: 0,
    },
});
