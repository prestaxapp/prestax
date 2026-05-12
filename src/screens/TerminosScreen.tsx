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
import { Metrics } from '../theme/Metrics';

interface TerminosScreenProps {
    onBack: () => void;
    onAccept: () => void;
}

const TERMINOS_TEXT = `2.4. El CLIENTE comprende y acepta VIVA REPRESENTACIONES S.A podrá tercerizar en otras empresas que no sean VIVA REPRESENTACIONES S.A. la revisión de la identidad del CLIENTE, la elegibilidad del CLIENTE para ser parte de este Contrato, o de recibir un producto o servicio proveído por VIVA REPRESENTACIONES S.A, entre otros. En tal sentido, el CLIENTE, para poder acceder a los servicios o productos ofrecidos por VIVA REPRESENTACIONES S.A. se obliga a otorgar verazmente a tales empresas tercerizadas todos los datos por éstas requeridas, incluyendo pero no limitándose a la autorización de la toma de una fotografía (retrato) de su rostro, y la toma de un archivo digital biométrico de su/s huella/s dactilar/es. Todos estos datos serán utilizados por VIVA REPRESENTACIONES S.A a efectos de analizar la elegibilidad del CLIENTE y también para fortalecer los procesos de seguridad y de prevención de fraude de la empresa.

Adicionalmente, los datos sobre los ingresos y situación patrimonial informados a VIVA REPRESENTACIONES S.A, en la manifestación de bienes, o en cualquier anexo firmado que integra este documento, podrán ser verificados por VIVA REPRESENTACIONES S.A o las empresas tercerizadas, en cumplimiento de las disposiciones legales vigentes.

2.5. El CLIENTE declara y acepta expresamente que autoriza a VIVA REPRESENTACIONES S.A. a consultar, verificar y compartir su información crediticia con cualquier entidad de información crediticia o base de datos que opere en el país, tales como INFORMCONF, RISK APTA u otras similares, en cualquier momento durante la vigencia del contrato y hasta su completa cancelación.

2.6. Asimismo, el CLIENTE autoriza a VIVA REPRESENTACIONES S.A. a reportar cualquier información relacionada con el cumplimiento o incumplimiento de sus obligaciones contraídas en virtud del presente contrato ante las entidades de información crediticia mencionadas precedentemente.

2.7. El CLIENTE reconoce haber sido debidamente informado de que la información mencionada en los puntos anteriores puede influir en futuras evaluaciones crediticias, y que la presente autorización tiene carácter irrevocable durante la vigencia del contrato.

3. CONFIDENCIALIDAD DE LA INFORMACIÓN

3.1. VIVA REPRESENTACIONES S.A. se compromete a mantener la confidencialidad de toda la información personal y financiera proporcionada por el CLIENTE, utilizándola únicamente para los fines establecidos en el presente contrato y en estricta conformidad con la Ley N° 1682/01 "Que reglamenta la información de carácter privado" y demás normativas aplicables.

3.2. No obstante lo anterior, el CLIENTE presta su consentimiento para que VIVA REPRESENTACIONES S.A. pueda compartir su información con terceros en los casos previstos por la ley o cuando sea necesario para la ejecución del contrato.`;

import { SoundOverrideProvider } from '../context/SoundContext';

export const TerminosScreen: React.FC<TerminosScreenProps> = ({ onBack, onAccept }) => {
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
                    {/* ── 2. Subtítulo: "Crédito otorgado por VIVA" ── */}
                    <View style={styles.subtitleRow}>
                        <Text style={styles.subtitleText}>Crédito otorgado por </Text>
                        <Image source={require('../../assets/Logo Container.png')} style={styles.logoImage} resizeMode="contain" />
                    </View>

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
