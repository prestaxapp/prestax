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
import { CrossFadeSlideTransition } from '../animations/CrossFadeSlideTransition';
import { sendLeadMetadata } from '../../services/GoogleSheetsService';
import { getDeviceInfo } from '../../utils/deviceInfo';
import {
    calculateLoan, CALCULATOR_CONFIG, formatCurrency,
    getTranche,
} from '../../utils/calculatorLogic';
import { Metrics } from '../../theme/Metrics';
import { Colors } from '../../theme/Colors';

export const LoanCalculator = () => {
    const [amount, setAmount] = useState(1_000_000);
    const [months, setMonths] = useState(3);
    const [visualMonthsIdx, setVisualMonthsIdx] = useState(0);
    const [loading, setLoading] = useState(false);
    // 3 states: 'calculator' | 'confirm' | 'youform'
    const [screen, setScreen] = useState<'calculator' | 'confirm' | 'youform'>('calculator');
    
    // Tap-to-edit amount
    const [editingAmount, setEditingAmount] = useState(false);
    const [rawInput, setRawInput] = useState('');

    const tranche = useMemo(() => getTranche(amount), [amount]);

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
        () => calculateLoan(amount, effectiveMonths),
        [amount, effectiveMonths],
    );

    const handleAmountChange = useCallback((val: number) => {
        const clamped = Math.min(Math.max(val, CALCULATOR_CONFIG.MIN_AMOUNT), CALCULATOR_CONFIG.MAX_AMOUNT);
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
        setScreen('confirm');
    }, [loanDetails.isValid]);

    const handleConfirm = useCallback(async () => {
        // 1. Capturar info del dispositivo
        const { deviceModel, deviceOS } = getDeviceInfo();
        const timestamp = new Date().toISOString();

        // 2. Enviar metadata al Google Sheet (non-blocking — no detiene la UI)
        sendLeadMetadata({
            monto: amount,
            cuotas: effectiveMonths,
            deviceModel,
            deviceOS,
            timestamp,
        }).catch(err => console.warn('Lead metadata send failed silently:', err));

        // 3. Transicionar a YouForm inmediatamente, sin esperar la respuesta del server
        setScreen('youform');
    }, [amount, effectiveMonths]);

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
                            minLabel={`${formatCurrency(CALCULATOR_CONFIG.MIN_AMOUNT)} Gs`}
                            maxLabel={`${formatCurrency(CALCULATOR_CONFIG.MAX_AMOUNT)} Gs`}
                            value={amount}
                            minimumValue={CALCULATOR_CONFIG.MIN_AMOUNT}
                            maximumValue={CALCULATOR_CONFIG.MAX_AMOUNT}
                            step={CALCULATOR_CONFIG.AMOUNT_STEP}
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
                            minLabel={tranche.allowedMonths[0] === 1 ? 'Pago único' : `${tranche.allowedMonths[0]} cuotas`}
                            maxLabel={`${tranche.allowedMonths[tranche.allowedMonths.length - 1]} cuotas`}
                            value={visualMonthsIdx}
                            minimumValue={0}
                            maximumValue={tranche.allowedMonths.length - 1}
                            step={amount === 500_000 ? 0 : 1}
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
            onConfirm={handleConfirm}
            loading={loading}
        />
    );

    const renderYouForm = (
        <YouFormScreen
            amount={amount}
            months={effectiveMonths}
        />
    );

    // Encadenamos dos CrossFadeSlideTransition:
    // calculator → confirm (showSecond = screen !== 'calculator')
    // confirm → youform   (showSecond = screen === 'youform', dentro del secondaryScreen)
    return (
        <CrossFadeSlideTransition
            showSecond={screen !== 'calculator'}
            primaryScreen={renderCalculatorContent}
            secondaryScreen={
                <CrossFadeSlideTransition
                    showSecond={screen === 'youform'}
                    primaryScreen={renderConfirmScreen}
                    secondaryScreen={renderYouForm}
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
