/**
 * calculatorLogicV2.ts
 *
 * V2 – Simplified calculator: 1.000.000 → 5.000.000 Gs, cuotas fijas 3 | 6 | 12.
 *
 * ⚠️  The calculation formulas are IDENTICAL to calculatorLogic.ts.
 *     Only the config boundaries and the tranche table differ.
 */

// ── V2 Config ────────────────────────────────────────────────
export const CALCULATOR_CONFIG_V2 = {
    MIN_AMOUNT: 1_000_000,
    MAX_AMOUNT: 5_000_000,
    AMOUNT_STEP: 500_000,
    ALLOWED_MONTHS: [3, 6, 12] as const,
    // Same financial constants as V1
    TIN: 0.24,
    GASTOS_RATE: 0.0714,
    FEE_BASE: 0.045,
    FEE_EXTRA_PER_MONTH: 0.02,
    MIN_FEE: 22_500,
};

// Single tranche – every amount from 1M–5M allows [3, 6, 12]
export const AMOUNT_TRANCHES_V2 = [
    { min: 1_000_000, max: 5_000_000, allowedMonths: [3, 6, 12] },
];

export const getTrancheV2 = (amount: number) => {
    const tranche = AMOUNT_TRANCHES_V2.find(
        (t) => amount >= t.min && amount <= t.max,
    );
    if (tranche) return tranche;

    // Fallback – return the single tranche
    return AMOUNT_TRANCHES_V2[0];
};

// ── Loan Details interface (same shape as V1) ────────────────
export interface LoanDetailsV2 {
    monthlyQuota: number;
    totalToReturn: number;
    totalLoanCost: number;
    prestaxGain: number;
    tae: string;
    tin: string;
    isValid: boolean;
}

// ── TAE – Bisection Method (identical to V1) ─────────────────
const calculateTAE = (
    requestedAmount: number,
    monthlyQuota: number,
    months: number,
): number => {
    let lowerBound = 0;
    let upperBound = 10.0;
    const epsilon = 0.00001;

    for (let i = 0; i < 100; i++) {
        const mid = (lowerBound + upperBound) / 2;
        let presentValue = 0;
        for (let t = 1; t <= months; t++) {
            presentValue += monthlyQuota / Math.pow(1 + mid, t);
        }

        if (Math.abs(presentValue - requestedAmount) < epsilon) {
            return (Math.pow(1 + mid, 12) - 1) * 100;
        }

        if (presentValue > requestedAmount) {
            lowerBound = mid;
        } else {
            upperBound = mid;
        }
    }
    return (
        (Math.pow(1 + (lowerBound + upperBound) / 2, 12) - 1) * 100
    );
};

const roundTo50 = (val: number) => Math.ceil(val / 50) * 50;

// ── Main calculation (identical math to V1) ──────────────────
export const calculateLoanV2 = (
    requestedAmount: number,
    months: number,
): LoanDetailsV2 => {
    const CFG = CALCULATOR_CONFIG_V2;

    // Validate against V2 tranche
    const validTranche = AMOUNT_TRANCHES_V2.find(
        (t) => requestedAmount >= t.min && requestedAmount <= t.max,
    );
    const isValid =
        !!validTranche && validTranche.allowedMonths.includes(months);

    // 1. French amortisation on Requested Amount
    const i = CFG.TIN / 12; // 0.02 monthly
    let monthlyQuotaBase = 0;
    if (months === 1) {
        monthlyQuotaBase = requestedAmount * (1 + i);
    } else {
        monthlyQuotaBase =
            (requestedAmount * i) / (1 - Math.pow(1 + i, -months));
    }
    const totalInterests = monthlyQuotaBase * months - requestedAmount;
    const firstMonthInterest = requestedAmount * i;

    // 2. Gastos & Dynamic Fee
    const gastosAdmin = requestedAmount * CFG.GASTOS_RATE;
    let feeRate = CFG.FEE_BASE;
    if (months > 1) {
        feeRate += CFG.FEE_EXTRA_PER_MONTH * (months - 1);
    }
    let fee = requestedAmount * feeRate;
    if (months === 1) fee = Math.max(fee, CFG.MIN_FEE);

    // 3. IVA (10%) on costs and first month interest
    const iva = 0.1 * (firstMonthInterest + gastosAdmin + fee);

    // 4. Total to Return
    const totalToReturn =
        requestedAmount + totalInterests + gastosAdmin + fee + iva;
    const rawMonthlyQuota = totalToReturn / months;
    const finalMonthlyQuota = roundTo50(rawMonthlyQuota);

    return {
        monthlyQuota: finalMonthlyQuota,
        totalToReturn: finalMonthlyQuota * months,
        totalLoanCost: finalMonthlyQuota * months - requestedAmount,
        prestaxGain: Math.round(fee),
        tae: `${calculateTAE(requestedAmount, finalMonthlyQuota, months).toFixed(2)}%`,
        tin: `${(CFG.TIN * 100).toFixed(2)}%`,
        isValid,
    };
};

export { formatCurrency } from './calculatorLogic';
