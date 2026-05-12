import React, { useState, useMemo, useCallback } from 'react';
import {
    View, StyleSheet, Platform, Alert,
    Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LabeledSlider } from '../molecules/LabeledSlider';
import { ListDetails } from '../molecules/ListDetails';
import { Button } from '../atoms/Button';
import { ConfirmScreen } from '../../screens/ConfirmScreen';
import { YouFormScreen } from '../../screens/YouFormScreen';
import { TerminosScreen } from '../../screens/TerminosScreen';
import { CrossFadeSlideTransition } from '../animations/CrossFadeSlideTransition';
import { sendLeadMetadata } from '../../services/GoogleSheetsService';
import { generateSessionId, createPreSolicitud, logConsent } from '../../services/SupabaseService';
import { getDeviceInfo } from '../../utils/deviceInfo';
import {
    calculateLoanV2, CALCULATOR_CONFIG_V2, formatCurrency,
    getTrancheV2,
} from '../../utils/calculatorLogicV2';
import { Metrics } from '../../theme/Metrics';
import { Colors } from '../../theme/Colors';

/**
 * LoanCalculator — versión vigente
 *
 * Rango: 1.000.000 → 5.000.000 Gs | Cuotas: 3 · 6 · 12
 * Lógica de cálculo idéntica a la versión original (French, TAE, TIN, gastos, IVA).
 *
 * Versión anterior archivada en: src/archives/LoanCalculator.original.tsx.bak
 */
export const LoanCalculator = () => {
    const [amount, setAmount] = useState(1_000_000);
    const [months, setMonths] = useState(3);
    const [visualMonthsIdx, setVisualMonthsIdx] = useState(0);
    const [loading, setLoading] = useState(false);
    // 4 states: 'calculator' | 'confirm' | 'terminos' | 'youform'
    const [screen, setScreen] = useState<'calculator' | 'confirm' | 'terminos' | 'youform'>('calculator');
    const [sessionId, setSessionId] = useState('');

    // Tap-to-edit amount
    const [editingAmount, setEditingAmount] = useState(false);
    const [rawInput, setRawInput] = useState('');

    const tranche = useMemo(() => getTrancheV2(amount), [amount]);

    const effectiveMonths = useMemo(() => {
        if (tranche.allowedMonths.includes(months)) return months;
        return tranche.allowedMonths.reduce((prev, curr) =>
            Math.abs(curr - months) < Math.abs(prev - months) ? curr : prev,
        );
    }, [months, tranche.allowedMonths]);

    React.useEffect(() => {
        setVisualMonthsIdx(tranche.allowedMonths.indexOf(effectiveMonths));
    }, [effectiveMonths, tranche.allowedMonths]);

    const loanDetails = useMemo(
        () => calculateLoanV2(amount, effectiveMonths),
        [amount, effectiveMonths],
    );

    const handleAmountChange = useCallback((val: number) => {
        const clamped = Math.min(Math.max(val, CALCULATOR_CONFIG_V2.MIN_AMOUNT), CALCULATOR_CONFIG_V2.MAX_AMOUNT);
        setAmount(clamped);
    }, []);

    const handleMonthsChange = useCallback((val: number) => {
        setMonths(val);
    }, []);

    const commitAmountInput = useCallback(() => {
        const parsed = parseInt(rawInput.replace(/\D/g, ''), 10);
        if (!isNaN(parsed)) handleAmountChange(parsed);
        setEditingAmount(false);
        Keyboard.dismiss();
    }, [rawInput, handleAmountChange]);

    const handleSubmit = useCallback(() => {
        if (!loanDetails.isValid) {
            Alert.alert('Monto no permitido', 'Por favor selecciona un monto válido según los plazos disponibles.');
            return;
        }

        // Generar session_id único para correlacionar todo el flujo
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);

        // Crear pre_solicitud en Supabase (non-blocking — no detiene la UI)
        const { deviceModel, deviceOS } = getDeviceInfo();
        createPreSolicitud({
            session_id: newSessionId,
            monto: amount,
            cuotas: effectiveMonths,
            cuota_mensual: loanDetails.monthlyQuota,
            device_model: deviceModel,
            device_os: deviceOS,
        }).catch(err => console.warn('Pre-solicitud send failed silently:', err));

        setScreen('confirm');
    }, [loanDetails.isValid, amount, effectiveMonths, loanDetails.monthlyQuota]);

    // ConfirmScreen → TerminosScreen
    const handleConfirmContinue = useCallback(() => {
        setScreen('terminos');
    }, []);

    const handleConfirm = useCallback(async () => {
        // 1. Registrar consentimiento legal en Supabase (non-blocking)
        logConsent({
            session_id: sessionId,
            consent_type: 'terminos_y_condiciones',
            consent_version: 'v1.0',
        }).catch(err => console.warn('Consent log failed silently:', err));

        // 2. Capturar info del dispositivo para Google Sheet
        const { deviceModel, deviceOS } = getDeviceInfo();
        const timestamp = new Date().toISOString();

        // 3. Enviar metadata al Google Sheet (mantener Excel existente)
        sendLeadMetadata({
            monto: amount,
            cuotas: effectiveMonths,
            deviceModel,
            deviceOS,
            timestamp,
        }).catch(err => console.warn('Lead metadata send failed silently:', err));

        // 4. Transicionar a YouForm inmediatamente, sin esperar respuestas
        setScreen('youform');
    }, [amount, effectiveMonths, sessionId]);

    const monthsLabel = effectiveMonths === 1 ? 'cuota' : 'cuotas';

    const renderCalculatorContent = (
        <View style={styles.webContainer}>
            <LinearGradient
                colors={Colors.gradientCard as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View testID="calculator-scroll" style={styles.scrollContent}>
                    <View testID="slider-section" style={styles.sliderSection}>
                        <LabeledSlider
                            title="¿Cuánto necesitás?"
                            amount={formatCurrency(amount)}
                            currencyOrUnit="Gs"
                            minLabel={`${formatCurrency(CALCULATOR_CONFIG_V2.MIN_AMOUNT)} Gs`}
                            maxLabel={`${formatCurrency(CALCULATOR_CONFIG_V2.MAX_AMOUNT)} Gs`}
                            value={amount}
                            minimumValue={CALCULATOR_CONFIG_V2.MIN_AMOUNT}
                            maximumValue={CALCULATOR_CONFIG_V2.MAX_AMOUNT}
                            step={CALCULATOR_CONFIG_V2.AMOUNT_STEP}
                            onValueChange={handleAmountChange}
                            onAmountPress={() => {
                                setRawInput(amount.toString());
                                setEditingAmount(true);
                            }}
                            editingAmount={editingAmount}
                            rawInput={rawInput}
                            onRawInputChange={setRawInput}
                            onRawInputSubmit={commitAmountInput}
                        />

                        <LabeledSlider
                            title="¿En cuántas cuotas?"
                            amount={effectiveMonths.toString()}
                            currencyOrUnit={monthsLabel}
                            minLabel={`${tranche.allowedMonths[0]} cuotas`}
                            maxLabel={`${tranche.allowedMonths[tranche.allowedMonths.length - 1]} cuotas`}
                            value={visualMonthsIdx}
                            minimumValue={0}
                            maximumValue={tranche.allowedMonths.length - 1}
                            step={1}
                            disableAmountHover={true}
                            onValueChange={(val) => {
                                setVisualMonthsIdx(val);
                                const snapper = Math.round(val);
                                if (snapper !== tranche.allowedMonths.indexOf(effectiveMonths)) {
                                    handleMonthsChange(tranche.allowedMonths[snapper]);
                                }
                            }}
                        />
                    </View>

                    <View testID="summary-section" style={styles.summarySection}>
                        <ListDetails
                            iconName="today"
                            label="Cuota Mensual"
                            value={loanDetails.isValid ? `${formatCurrency(loanDetails.monthlyQuota)} Gs` : '---'}
                            isPrimary
                            style={styles.primaryRow}
                        />

                        <View testID="detail-card" style={styles.secondaryCard}>
                            <ListDetails
                                iconName="equal"
                                label="Total a devolver"
                                value={`${formatCurrency(loanDetails.totalToReturn)} Gs`}
                                style={styles.secondaryRow}
                            />
                            <ListDetails
                                iconName="payment_arrow_down"
                                label="Coste total del préstamo"
                                value={`${formatCurrency(loanDetails.totalLoanCost)} Gs`}
                                style={styles.secondaryRow}
                            />
                            <ListDetails
                                iconName="percent_discount"
                                label="TAE"
                                value={loanDetails.tae}
                                style={styles.secondaryRow}
                            />
                            <ListDetails
                                iconName="heap_snapshot"
                                label="TIN"
                                value={loanDetails.tin}
                                style={styles.secondaryRow}
                            />
                            <View style={styles.buttonWrapper}>
                                <Button
                                    title={loanDetails.isValid ? "Continuar con la solicitud" : "Monto no disponible"}
                                    onPress={handleSubmit}
                                    loading={loading}
                                    disabled={!loanDetails.isValid}
                                    variant="primary"
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const renderConfirmScreen = (
        <ConfirmScreen
            amount={amount}
            months={effectiveMonths}
            monthlyQuota={loanDetails.monthlyQuota}
            onBack={() => setScreen('calculator')}
            onConfirm={handleConfirmContinue}
            loading={loading}
        />
    );

    const renderTerminosScreen = (
        <TerminosScreen
            onBack={() => setScreen('confirm')}
            onAccept={handleConfirm}
        />
    );

    const renderYouForm = (
        <YouFormScreen
            amount={amount}
            months={effectiveMonths}
            sessionId={sessionId}
        />
    );

    // Encadenamos tres CrossFadeSlideTransition:
    // calculator → confirm → terminos → youform
    return (
        <CrossFadeSlideTransition
            showSecond={screen !== 'calculator'}
            primaryScreen={renderCalculatorContent}
            secondaryScreen={
                <CrossFadeSlideTransition
                    showSecond={screen !== 'calculator' && screen !== 'confirm'}
                    primaryScreen={renderConfirmScreen}
                    secondaryScreen={
                        <CrossFadeSlideTransition
                            showSecond={screen === 'youform'}
                            primaryScreen={renderTerminosScreen}
                            secondaryScreen={renderYouForm}
                        />
                    }
                />
            }
        />
    );
};

const styles = StyleSheet.create({
    webContainer: {
        width: '100%',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        maxWidth: Metrics.maxWidth450,
        borderRadius: Metrics.borderRadius28,
        borderColor: '#195850',
        borderWidth: 1,
    },
    scrollContent: {
        paddingTop: Metrics.padding24,
        paddingBottom: Metrics.padding8,
        gap: Metrics.gap32,
    },
    sliderSection: {
        paddingHorizontal: Metrics.padding24,
        gap: Metrics.gap32,
    },
    summarySection: {
        paddingHorizontal: Metrics.padding8,
        gap: Metrics.gap8,
    },
    primaryRow: {
        borderRadius: Metrics.borderRadius100,
        paddingLeft: Metrics.padding16,
    },
    secondaryCard: {
        backgroundColor: Colors.secondary20,
        borderRadius: Metrics.borderRadius24,
        paddingTop: Metrics.padding16,
        paddingBottom: Metrics.padding8,
        paddingHorizontal: Metrics.padding0,
        gap: Metrics.gap4,
    },
    buttonWrapper: {
        paddingHorizontal: Metrics.padding8,
    },
    secondaryRow: {
        height: Metrics.height32,
        paddingLeft: Metrics.padding16,
        paddingRight: Metrics.padding16,
    },
});
