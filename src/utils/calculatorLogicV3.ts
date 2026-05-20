/**
 * calculatorLogicV3.ts
 *
 * V3 – Cuota Estimada basada en promedio de cuoteros (Tking + Solar) / 2.
 *
 * Rango: 1.000.000 → 30.000.000 Gs
 * Cuotas disponibles: 6 · 8 · 10 · 12 · 15 · 18 · 24
 *
 * Estrategia de cálculo:
 *   1. Lookup table con valores de cuota promediados de ambos cuoteros.
 *   2. Interpolación lineal para montos intermedios no presentes en la tabla.
 *   3. Para 8 cuotas (no presente en cuoteros originales): interpolación
 *      lineal entre las cuotas de 6 y 10.
 *   4. Variación (spread Tking↔Solar) se expone como ±VARIATION_PERCENT
 *      del valor estimado, para el tooltip informativo.
 *
 * ⚠️  La lógica financiera French (TAE, TIN, gastos, IVA) se mantiene
 *     idéntica a V1/V2 para el cálculo de Total a Devolver y costes.
 */

import { formatCurrency } from './calculatorLogic';

// ── V3 Config ────────────────────────────────────────────────
export const CALCULATOR_CONFIG_V3 = {
    MIN_AMOUNT: 1_000_000,
    MAX_AMOUNT: 30_000_000,
    AMOUNT_STEP: 500_000,
    ALLOWED_MONTHS: [6, 8, 10, 12, 15, 18, 24] as const,
    /**
     * Porcentaje de variación entre el cuotero más caro (Tking)
     * y el más barato (Solar). La cuota estimada es el promedio;
     * el valor real puede variar ±VARIATION_PERCENT.
     */
    VARIATION_PERCENT: 5,
    // Financial constants (identical to V1/V2)
    TIN: 0.24,
    GASTOS_RATE: 0.0714,
    FEE_BASE: 0.045,
    FEE_EXTRA_PER_MONTH: 0.02,
    MIN_FEE: 22_500,
};

// ── Cuota Reference Table (Promedio Tking + Solar) ───────────
// Columnas disponibles en los cuoteros originales: 6, 10, 12, 15, 18, 24
// (8 se interpola entre 6 y 10)
type CuotaEntry = Partial<Record<number, number>>;

const CUOTA_TABLE: { amount: number; cuotas: CuotaEntry }[] = [
    { amount: 1000000, cuotas: { 6: 227438, 8: 181467, 10: 145496, 12: 124859, 15: 112171, 18: 99787, 24: 90000 } },
    { amount: 1500000, cuotas: { 6: 354756, 8: 282774, 10: 226167, 12: 195205, 15: 168007, 18: 149430, 24: 133500 } },
    { amount: 2000000, cuotas: { 6: 472174, 8: 376032, 10: 300640, 12: 260273, 15: 223842, 18: 199073, 24: 177000 } },
    { amount: 3000000, cuotas: { 6: 682961, 8: 547557, 10: 437154, 12: 379752, 15: 327123, 18: 291643, 24: 249963 } },
    { amount: 4000000, cuotas: { 6: 885558, 8: 708455, 10: 566853, 12: 496695, 15: 427897, 18: 381556, 24: 327388 } },
    { amount: 5000000, cuotas: { 6: 1105653, 8: 879353, 10: 699052, 12: 613139, 15: 528171, 18: 471970, 24: 405311 } },
    { amount: 10000000, cuotas: { 6: 2068133, 8: 1654342, 10: 1334050, 12: 1169357, 15: 1001540, 18: 892537, 24: 760931 } },
    { amount: 15000000, cuotas: { 6: 3075114, 8: 2460331, 10: 1985048, 12: 1740076, 15: 1490410, 18: 1329604, 24: 1133051 } },
    { amount: 20000000, cuotas: { 6: 4008593, 8: 3205819, 10: 2586545, 12: 2266794, 15: 1982779, 18: 1766171, 24: 1505670 } },
    { amount: 25000000, cuotas: { 6: 4904074, 8: 3940808, 10: 3178543, 12: 2785012, 15: 2471648, 18: 2201238, 24: 1877290 } },
    { amount: 30000000, cuotas: { 6: 5873553, 8: 4720297, 10: 3807041, 12: 3335731, 15: 2961018, 18: 2637305, 24: 2248410 } },
];

// ── Tranche definitions (which cuotas are available per amount range) ──
export const AMOUNT_TRANCHES_V3 = [
    { min: 1_000_000, max: 2_999_999, allowedMonths: [6, 8, 10, 12, 15, 18] },
    { min: 3_000_000, max: 30_000_000, allowedMonths: [6, 8, 10, 12, 15, 18, 24] },
];

export const getTrancheV3 = (amount: number) => {
    const tranche = AMOUNT_TRANCHES_V3.find(
        (t) => amount >= t.min && amount <= t.max,
    );
    if (tranche) return tranche;
    // Fallback – nearest boundary
    if (amount < AMOUNT_TRANCHES_V3[0].min) return AMOUNT_TRANCHES_V3[0];
    return AMOUNT_TRANCHES_V3[AMOUNT_TRANCHES_V3.length - 1];
};

// ── Interpolation helpers ────────────────────────────────────

/**
 * Interpola linealmente un valor entre dos puntos.
 */
const lerp = (x: number, x0: number, y0: number, x1: number, y1: number): number => {
    if (x1 === x0) return y0;
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
};

/**
 * Busca la cuota para un monto y plazo dados, interpolando
 * linealmente si el monto no está en la tabla de referencia.
 *
 * Para cuota 8 (no presente en cuoteros), se interpola entre 6 y 10.
 */
const lookupCuota = (amount: number, months: number): number | null => {
    // Si es 8 cuotas, interpolar entre 6 y 10 cuotas
    if (months === 8) {
        const cuota6 = lookupCuota(amount, 6);
        const cuota10 = lookupCuota(amount, 10);
        if (cuota6 === null || cuota10 === null) return null;
        return Math.round(lerp(8, 6, cuota6, 10, cuota10));
    }

    // Buscar puntos de referencia inferior y superior en la tabla
    let lower: { amount: number; cuota: number } | null = null;
    let upper: { amount: number; cuota: number } | null = null;

    for (const entry of CUOTA_TABLE) {
        const val = entry.cuotas[months];
        if (val === undefined) continue;

        if (entry.amount <= amount) {
            lower = { amount: entry.amount, cuota: val };
        }
        if (entry.amount >= amount && upper === null) {
            upper = { amount: entry.amount, cuota: val };
        }
    }

    // Monto exacto encontrado
    if (lower && lower.amount === amount) return lower.cuota;
    if (upper && upper.amount === amount) return upper.cuota;

    // Interpolar entre lower y upper
    if (lower && upper) {
        return Math.round(lerp(amount, lower.amount, lower.cuota, upper.amount, upper.cuota));
    }

    // Solo uno disponible (edge cases)
    if (lower) return lower.cuota;
    if (upper) return upper.cuota;

    return null;
};

// ── Loan Details interface ───────────────────────────────────
export interface LoanDetailsV3 {
    /** Cuota mensual estimada (promedio entre cuoteros) */
    monthlyQuota: number;
    /** Total a devolver (cuota × meses) */
    totalToReturn: number;
    /** Costo total del préstamo (total - capital) */
    totalLoanCost: number;
    /** TAE formateado como string, ej: "85.23%" */
    tae: string;
    /** TIN formateado como string, ej: "24.00%" */
    tin: string;
    /** Si la combinación monto/plazo es válida */
    isValid: boolean;
    /** Variación absoluta en Gs (±) respecto al promedio */
    variationGs: number;
    /** Porcentaje de variación */
    variationPercent: number;
}

// ── TAE – Bisection Method (identical to V1/V2) ─────────────
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

// ── Main calculation ─────────────────────────────────────────
export const calculateLoanV3 = (
    requestedAmount: number,
    months: number,
): LoanDetailsV3 => {
    const CFG = CALCULATOR_CONFIG_V3;

    // Validate tranche
    const validTranche = AMOUNT_TRANCHES_V3.find(
        (t) => requestedAmount >= t.min && requestedAmount <= t.max,
    );
    const isValid = !!validTranche && validTranche.allowedMonths.includes(months);

    // Cuota estimada desde la lookup table + interpolación
    const cuotaFromTable = lookupCuota(requestedAmount, months);

    if (cuotaFromTable === null || !isValid) {
        return {
            monthlyQuota: 0,
            totalToReturn: 0,
            totalLoanCost: 0,
            tae: '---',
            tin: `${(CFG.TIN * 100).toFixed(2)}%`,
            isValid: false,
            variationGs: 0,
            variationPercent: 0,
        };
    }

    const monthlyQuota = cuotaFromTable;
    const totalToReturn = monthlyQuota * months;
    const totalLoanCost = totalToReturn - requestedAmount;

    // Variación ± basada en el spread entre cuoteros
    const variationPercent = CFG.VARIATION_PERCENT;
    const variationGs = Math.round(monthlyQuota * (variationPercent / 100));

    return {
        monthlyQuota,
        totalToReturn,
        totalLoanCost,
        tae: `${calculateTAE(requestedAmount, monthlyQuota, months).toFixed(2)}%`,
        tin: `${(CFG.TIN * 100).toFixed(2)}%`,
        isValid,
        variationGs,
        variationPercent,
    };
};

export { formatCurrency };
