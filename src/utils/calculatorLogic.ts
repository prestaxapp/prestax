export const AMOUNT_TRANCHES: { min: number; max: number; allowedMonths: number[] }[] = [
    { min: 500_000, max: 500_000, allowedMonths: [1, 2] }, // Tier 1
    { min: 600_000, max: 900_000, allowedMonths: [1, 2, 3] }, // Tier 2
    { min: 1_000_000, max: 2_500_000, allowedMonths: [1, 2, 3, 4] }, // Tier 3
    { min: 2_600_000, max: 5_000_000, allowedMonths: [1, 2, 3, 4, 6] }, // Tier 4
    { min: 5_500_000, max: 6_900_000, allowedMonths: [1, 2, 3, 4, 6, 9] }, // Tier 5
    { min: 7_000_000, max: 10_500_000, allowedMonths: [1, 2, 3, 4, 6, 9, 10, 12] }, // Tier 6
    { min: 11_000_000, max: 15_000_000, allowedMonths: [1, 2, 3, 4, 6, 9, 10, 12] }, // Tier 7
    { min: 15_500_000, max: 30_000_000, allowedMonths: [1, 2, 3, 4, 6, 9, 10, 12, 15] }, // Tier 8
    { min: 35_000_000, max: 50_000_000, allowedMonths: [1, 2, 3, 4, 6, 10, 12, 18, 24] }, // Tier 9
];

export const getTranche = (amount: number) => {
    const tranche = AMOUNT_TRANCHES.find(t => amount >= t.min && amount <= t.max);
    if (tranche) return tranche;

    // Find nearest valid tranche if in gap
    return AMOUNT_TRANCHES.reduce((prev, curr) => {
        const distCurr = Math.min(Math.abs(amount - curr.min), Math.abs(amount - curr.max));
        const distPrev = Math.min(Math.abs(amount - prev.min), Math.abs(amount - prev.max));
        return distCurr < distPrev ? curr : prev;
    });
};

export const CALCULATOR_CONFIG = {
    MIN_AMOUNT: 500_000,
    MAX_AMOUNT: 50_000_000,
    AMOUNT_STEP: 500_000,
    TIN: 0.24,
    GASTOS_RATE: 0.0714,
    FEE_BASE: 0.045,
    FEE_EXTRA_PER_MONTH: 0.02,
    MIN_FEE: 22_500,
};

export interface LoanDetails {
    monthlyQuota: number;
    totalToReturn: number;
    totalLoanCost: number;
    prestaxGain: number;
    tae: string;
    tin: string;
    isValid: boolean;
}

/**
 * Calculates TAE using Bisection Method (Internal Rate of Return)
 */
const calculateTAE = (requestedAmount: number, monthlyQuota: number, months: number): number => {
    let lowerBound = 0;
    let upperBound = 10.0; // Higher bound for safety
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
    return (Math.pow(1 + (lowerBound + upperBound) / 2, 12) - 1) * 100;
};

const roundTo50 = (val: number) => Math.ceil(val / 50) * 50;

export const calculateLoan = (requestedAmount: number, months: number): LoanDetails => {
    // Check if amount is in a valid range
    const validTranche = AMOUNT_TRANCHES.find(t => requestedAmount >= t.min && requestedAmount <= t.max);
    const isValid = !!validTranche && validTranche.allowedMonths.includes(months);

    // 1. Interés: French on Requested Amount ONLY
    const i = CALCULATOR_CONFIG.TIN / 12; // 0.02 monthly
    let monthlyQuotaBase = 0;
    if (months === 1) {
        monthlyQuotaBase = requestedAmount * (1 + i);
    } else {
        monthlyQuotaBase = (requestedAmount * i) / (1 - Math.pow(1 + i, -months));
    }
    const totalInterests = (monthlyQuotaBase * months) - requestedAmount;
    const firstMonthInterest = requestedAmount * i;

    // 2. Gastos & Dynamic Fee
    const gastosAdmin = requestedAmount * CALCULATOR_CONFIG.GASTOS_RATE;
    let feeRate = CALCULATOR_CONFIG.FEE_BASE;
    if (months > 1) {
        feeRate += CALCULATOR_CONFIG.FEE_EXTRA_PER_MONTH * (months - 1);
    }
    let fee = requestedAmount * feeRate;
    if (months === 1) fee = Math.max(fee, CALCULATOR_CONFIG.MIN_FEE);

    // 3. IVA (10%) on costs and first month interest
    const iva = 0.10 * (firstMonthInterest + gastosAdmin + fee);

    // 4. Total to Return
    const totalToReturn = requestedAmount + totalInterests + gastosAdmin + fee + iva;
    const rawMonthlyQuota = totalToReturn / months;
    const finalMonthlyQuota = roundTo50(rawMonthlyQuota);

    return {
        monthlyQuota: finalMonthlyQuota,
        totalToReturn: finalMonthlyQuota * months,
        totalLoanCost: (finalMonthlyQuota * months) - requestedAmount,
        prestaxGain: Math.round(fee),
        tae: `${calculateTAE(requestedAmount, finalMonthlyQuota, months).toFixed(2)}%`,
        tin: `${(CALCULATOR_CONFIG.TIN * 100).toFixed(2)}%`,
        isValid,
    };
};

export const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-PY').format(val);
