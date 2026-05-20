/**
 * GoogleSheetsService
 *
 * Handles sending loan lead metadata to Google Sheets via a Google Apps Script Web App.
 *
 * SETUP:
 *  1. The Google Apps Script is deployed at APPS_SCRIPT_URL below.
 *  2. It writes to columns P-T of the connected Google Sheet.
 *  3. Columns A-M are written by YouForm natively.
 *
 * CORRELACIÓN:
 *  Usar `session_id` como identificador primario. `timestamp` queda como respaldo.
 */

import { ENV, isConfigured } from '../config/env';

export interface LeadMetadata {
    session_id: string;
    monto: number;
    cuotas: number;
    deviceModel: string;
    deviceOS: string;
    timestamp: string;
}

/**
 * Envía metadata del lead (monto, cuotas, dispositivo) al Google Sheet
 * a través del Apps Script. No bloquea el flujo de la UI.
 *
 * @returns true si el envío fue exitoso, false si hubo error
 */
export const sendLeadMetadata = async (data: LeadMetadata): Promise<boolean> => {
    if (!isConfigured(ENV.APPS_SCRIPT_URL)) {
        console.warn('[GoogleSheets] Missing EXPO_PUBLIC_APPS_SCRIPT_URL. Skipping metadata sync.');
        return false;
    }

    try {
        const response = await fetch(ENV.APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain', // Apps Script requiere text/plain para evitar CORS preflight
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return true;
        } else {
            console.error('[GoogleSheets] Apps Script reported error:', result.error);
            return false;
        }
    } catch (error) {
        // Non-blocking: errores de red no deben interrumpir el flujo del usuario
        console.error('[GoogleSheets] Failed to send lead metadata:', error);
        return false;
    }
};

// ─── Legacy support (mantener compatibilidad con código anterior) ─────────────

export const config = {
    ZAPIER_WEBHOOK_URL: '',
};

export interface LeadData {
    amount: number;
    months: number;
    monthlyQuota: number;
    totalToReturn: number;
    prestaxGain: number;
    timestamp: string;
}

export const submitLeadToCRM = async (leadData: LeadData): Promise<boolean> => {
    if (!config.ZAPIER_WEBHOOK_URL) {
        console.warn('[Legacy] No Webhook URL configured. Skipping CRM submission.');
        return true;
    }
    try {
        const response = await fetch(config.ZAPIER_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData),
        });
        return response.ok;
    } catch (error) {
        console.error('[Legacy] CRM submission failed:', error);
        return false;
    }
};
