/**
 * ConfirmScreen — Screen
 *
 * Pantalla completa de confirmación de préstamo.
 * Se muestra después de "Continuar con la solicitud" en LoanCalculator.
 *
 * Fondo: Colors.backgroundDefault (#001511) + LinearGradient (Colors.gradientScreen)
 * NO tiene borderRadius ni border (es una pantalla, no una card).
 *
 * Estructura (top → bottom):
 *  1. Header: botón back 36×36 + pregunta con monto (title1Tight)
 *  2. Row: LoanDetailCard PLAZO + LoanDetailCard CUOTA
 *  3. Sección Requisitos:
 *       - Título "Requisitos" (title2Tight, centrado)
 *       - Contenedor único de badges (flex-wrap, centrado, gap row 7 / col 8)
 *         con GradientSeparator entre documentos e identidad (width 100%)
 *  4. Banner advertencia "¡OJO!"
 *  5. Banner "100% Digital"
 *  ─── fuera del scroll ───
 *  6. FixedButtonBar (organism)
 *
 * Monto impreso 2 veces:
 *   (1) En la pregunta: "¿Seguro/a de que querés prestar 1.000.000 Gs?"
 *   (2) En el botón primario: "Prestar 1.000.000 Gs"
 *
 * ⚠️ HARDCODED — revisar:
 *  - Back arrow: carácter '‹' (falta chevron.left en ICON_REGISTRY — ver instrucciones abajo)
 *  - Banner "100% Digital": backgroundColor '#0D1F1C' (no en Colors.ts)
 *  - Warning banner bg/border: colores rojos no están en Colors.ts
 *  - paddingBottom 32 en FixedButtonBar: safe area pendiente de insets
 *
 * DÓNDE AGREGAR ÍCONOS:
 *  Para el botón back: crear src/components/atoms/icons/IconChevronLeft.tsx
 *  y registrar 'chevron.left' en Icon.tsx (ICON_REGISTRY).
 *  Luego reemplazar el <Text>‹</Text> por <Icon name="chevron.left" size={16} />.
 */
import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Text } from '../components/atoms/Text';
import { GradientSeparator } from '../components/atoms/GradientSeparator';
import { RequirementBadge } from '../components/atoms/RequirementBadge';
import { LoanDetailCard } from '../components/molecules/LoanDetailCard';
import { FixedButtonBar } from '../components/organisms/FixedButtonBar';
import { Icon } from '../components/atoms/Icon';
import { HeadingTitle } from '../components/organisms/HeadingTitle';
import { Colors } from '../theme/Colors';
import { Metrics } from '../theme/Metrics';
import { formatCurrency } from '../utils/calculatorLogic';
import { GradientVector } from '../components/atoms/GradientVector';

interface ConfirmScreenProps {
    amount: number;
    months: number;
    monthlyQuota: number;
    onBack: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

export const ConfirmScreen = ({
    amount,
    months,
    monthlyQuota,
    onBack,
    onConfirm,
    loading = false,
}: ConfirmScreenProps) => {
    const formattedAmount = formatCurrency(amount);
    const formattedQuota = formatCurrency(monthlyQuota);
    const plazLabel = `${months} ${months === 1 ? 'mes' : 'meses'}`;
    const primaryLabel = `Prestar ${formattedAmount} Gs`;

    return (
        // Fondo sólido: backgroundDefault (#001511)
        <View style={styles.screen}>
            {/* ── GradientVector de fondo ──────────────────── */}
            <View style={styles.gradientBg} pointerEvents="none">
                <GradientVector width="100%" height={393.909} />
            </View>
            <View style={styles.contentWrapper}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={styles.topGroup}>
                        {/* ── 1. Header ────────────────────────────────────── */}
                        <View style={styles.header}>
                            <HeadingTitle
                                ubicacion="izq"
                                actionType="setting"
                                tamano="max"
                                showChevron={true}
                                showMultiStepProgressBar={false}
                                showClose={false}
                                showTitleContainer={true}
                                showDescription={false}
                                onPressBack={onBack}
                                label={
                                    <View style={styles.questionContainer}>
                                        <Text style={styles.questionBase}>
                                            {'¿Seguro/a que quieres prestar '}
                                            <Text style={styles.questionAmount}>
                                                {formattedAmount}
                                            </Text>
                                            <Text style={styles.questionCurrency}>
                                                Gs
                                            </Text>
                                            {'?'}
                                        </Text>
                                    </View>
                                }
                            />
                        </View>

                        {/* ── 2. Cards PLAZO + CUOTA ───────────────────────── */}
                        <View style={styles.cardsRow}>
                            <LoanDetailCard
                                iconName="hourglass"
                                label="PLAZO"
                                value={plazLabel}
                            />
                            <LoanDetailCard
                                iconName="calendar.pick"
                                label="CUOTA"
                                value={`${formattedQuota} Gs`}
                            />
                        </View>

                        {/* ── 3. Requisitos ────────────────────────────────── */}
                        <View style={styles.requisitosSection}>
                            {/* title2Tight: 22px, line-height 100%, centrado */}
                            <Text variant="title2Tight" color="white" align="center">
                                Requisitos
                            </Text>

                            <View style={styles.requisitosContainer}>
                                <View style={styles.badgeRow}>
                                    <RequirementBadge
                                        label={
                                            <Text variant="footnote">
                                                <Text variant="footnote" style={{ fontFamily: 'Lufga-Medium' }}>6</Text>
                                                {' Últimos IVAs'}
                                            </Text>
                                        }
                                    />
                                    <Text style={styles.orText}>o</Text>
                                    <RequirementBadge
                                        label={
                                            <Text variant="footnote">
                                                <Text variant="footnote" style={{ fontFamily: 'Lufga-Medium' }}>3 a 6</Text>
                                                {' Últimos IPS'}
                                            </Text>
                                        }
                                    />
                                    <Text style={styles.orText}>o</Text>
                                    <RequirementBadge
                                        label={
                                            <Text variant="footnote">
                                                <Text variant="footnote" style={{ fontFamily: 'Lufga-Medium' }}>6</Text>
                                                {' Últimos extractos salariales'}
                                            </Text>
                                        }
                                    />
                                </View>

                                <GradientSeparator style={styles.gradientLine} />

                                <View style={styles.badgeRow}>
                                    <RequirementBadge label="No tener Informconf" />
                                    <RequirementBadge label="C.I. a mano" />
                                </View>
                            </View>
                        </View>

                        {/* ── 4 y 5. Warning Message Container (Ahora dentro del scroll) ── */}
                        <View style={styles.warningMessageContainer}>
                            {/* Warning Box */}
                            <View style={styles.warningBox}>
                                <View style={styles.cornerCut} />
                                <View style={styles.warningRow}>
                                    <Icon name="state" size={20} color="white" />
                                    <Text style={styles.warningTitle}>
                                        ¡OJO!_  No se puede retroceder
                                    </Text>
                                </View>
                                <Text style={styles.warningDesc}>
                                    Asegúrese que los datos sean correctos
                                </Text>
                            </View>

                            {/* Promo Box */}
                            <View style={styles.promoBox}>
                                <Image
                                    source={require('../../assets/promo-digital.png')}
                                    style={styles.promoImage}
                                />
                                <Text style={styles.promoTitle}>
                                    100% Digital. Respuesta en -24h.
                                </Text>
                                <Text style={styles.promoDesc}>
                                    Aprobación acelerada, sin papeles ni demoras.
                                </Text>
                            </View>
                        </View>

                    </View>
                </ScrollView>

                {/* ── Bottom bar: FixedButtonBar pegado al fondo ── */}
                <View style={styles.bottomBar}>
                    {/* ── 6. FixedButtonBar ─────────────────────────────── */}
                    <FixedButtonBar
                        primaryLabel={primaryLabel}
                        onPressPrimary={onConfirm}
                        onPressBack={onBack}
                        loading={loading}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Pantalla completa — sin borderRadius, sin border
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: Colors.backgroundDefault,
        alignItems: 'center', // Center contentWrapper
    },
    contentWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },

    // Figma: padding top 0px (as requested), paddingSides 16px
    scrollContent: {
        flexGrow: 1,
        flexDirection: 'column',
        // Removed space-between since warning block is outside
        alignItems: 'stretch',
        paddingTop: 0, // Removed requested 40px top padding
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    topGroup: {
        alignSelf: 'stretch',
    },
    bottomBar: {
        flexDirection: 'column',
        alignSelf: 'stretch',
    },

    // ── Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        alignSelf: 'stretch',
        marginBottom: 0, // 0px de gap hacia PLAZO y CUOTA
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 150,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
        marginTop: 2, // alineación óptica
    },
    backArrowGlyph: {
        marginTop: -4,
    },
    questionContainer: {
        flex: 1,
    },
    questionBase: {
        color: Colors.white,
        fontFamily: 'Lufga-Medium',
        fontSize: 28,
        lineHeight: 28,
        includeFontPadding: false,
    },
    questionAmount: {
        color: Colors.primaryMain,
        fontFamily: 'Lufga-Medium',
        fontSize: 28,
        lineHeight: 28,
    },
    questionCurrency: {
        color: 'rgba(0, 219, 191, 0.8)',
        fontFamily: 'Lufga-Regular',
        fontSize: 24,
        lineHeight: 28,
        letterSpacing: -0.24,
    },

    // ── Cards
    cardsRow: {
        flexDirection: 'row',
        gap: Metrics.gap12,
        alignSelf: 'stretch',
        marginBottom: 32, // gap de 32px al contenedor de Requisitos
    },

    // ── Requisitos
    requisitosSection: {
        alignSelf: 'stretch',
        gap: 16,
        marginBottom: 20, // Maintain former visual gap for subsequent elements
    },
    requisitosContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        alignSelf: 'stretch',
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    gradientBg: {
        position: 'absolute',
        left: 0,
        top: -75,
        width: '100%',
        height: 393.909,
        zIndex: 0,
    },
    gradientLine: {
        width: '100%',
        height: 0.4,
    },
    orText: {
        color: Colors.white,
        fontFamily: 'Lufga-Medium',
        fontSize: 18,
    },

    // ── Warning Message Container ───────────────────────
    warningMessageContainer: {
        alignSelf: 'stretch',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: 'hidden',
        marginTop: 12, // espacio desde requisitos
    },
    warningBox: {
        backgroundColor: 'rgba(255, 98, 83, 0.15)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        position: 'relative',
        justifyContent: 'center',
        // Optional minHeight to match 63 closely
        minHeight: 63,
    },
    cornerCut: {
        position: 'absolute',
        top: -16, // using half of the width to exactly center the cut at the corner
        left: -16,
        width: 32,
        height: 32,
        backgroundColor: Colors.backgroundDefault,
        transform: [{ rotate: '45deg' }],
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
    },
    warningIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FF6253',
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningIconText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Lufga-Medium',
        marginTop: 2, // Optical fix for text alignment
    },
    warningTitle: {
        color: '#FF6253',
        fontSize: 14,
        fontFamily: 'Lufga-Medium', // Using Medium instead of SemiBold since user only has Medium loaded
    },
    warningDesc: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'Lufga-Regular',
        marginLeft: 32, // to align with the text above
    },
    promoBox: {
        height: 98,
        padding: 16,
        justifyContent: 'flex-end', // match Figma justify-end
        overflow: 'hidden', // in case the image overflows
    },
    promoImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // Equivalente a "Fill" en Figma
    },
    promoTitle: {
        color: '#3EF7D1',
        fontSize: 15,
        fontFamily: 'Lufga-Medium',
        lineHeight: 18,
    },
    promoDesc: {
        color: '#DBFEF7',
        fontSize: 12,
        fontFamily: 'Lufga-Regular',
        marginTop: 4,
    },
});
