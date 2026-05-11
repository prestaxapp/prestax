/**
 * SupabaseService.ts
 *
 * Servicio para comunicación con Supabase Edge Functions.
 * Maneja:
 *   1. Creación de pre_solicitudes (datos de calculadora + device info)
 *   2. Registro de consent_log (consentimiento legal, write-only)
 *
 * La IP del usuario se captura SERVER-SIDE en las Edge Functions,
 * no se envía desde el cliente (más seguro y confiable legalmente).
 *
 * CORRELACIÓN CON YOUFORM:
 *   Se genera un `session_id` (UUID) en React Native que viaja por todo
 *   el flujo y se inyecta como query param en el iframe de YouForm.
 *   El webhook de YouForm envía ese session_id a la tabla `solicitudes`,
 *   permitiendo hacer JOIN entre las 3 tablas.
 */

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://czehdflereoajjrlbpzj.supabase.co';

// Edge Function endpoints
const CREATE_PRE_SOLICITUD_FN = `${SUPABASE_URL}/functions/v1/create-pre-solicitud`;
const LOG_CONSENT_FN = `${SUPABASE_URL}/functions/v1/log-consent`;
// ─────────────────────────────────────────────────────────────────────────────

// ─── SESSION ID ──────────────────────────────────────────────────────────────

/**
 * Genera un UUID v4 simple sin dependencias externas.
 * Se usa como `session_id` para correlacionar datos del flujo de solicitud
 * entre pre_solicitudes, consent_log y solicitudes (YouForm).
 */
export const generateSessionId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// ─── PRE-SOLICITUD ──────────────────────────────────────────────────────────

export interface PreSolicitudPayload {
    session_id: string;
    monto: number;
    cuotas: number;
    cuota_mensual: number;
    device_model: string;
    device_os: string;
}

/**
 * Crea una pre_solicitud en Supabase via Edge Function.
 * La Edge Function captura la IP y user-agent server-side.
 *
 * Se llama cuando el usuario pasa de Calculator → ConfirmScreen.
 * Es non-blocking: no detiene la UI si falla.
 *
 * @returns true si se creó exitosamente
 */
export const createPreSolicitud = async (data: PreSolicitudPayload): Promise<boolean> => {
    console.log('📊 [Supabase] Creating pre_solicitud:', data.session_id);

    try {
        const response = await fetch(CREATE_PRE_SOLICITUD_FN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ [Supabase] Pre-solicitud created:', data.session_id);
            return true;
        } else {
            console.error('❌ [Supabase] Pre-solicitud error:', result.error);
            return false;
        }
    } catch (error) {
        // Non-blocking: errores de red no interrumpen el flujo del usuario
        console.error('❌ [Supabase] Failed to create pre-solicitud:', error);
        return false;
    }
};

// ─── CONSENT LOG ────────────────────────────────────────────────────────────

export interface ConsentPayload {
    session_id: string;
    consent_type?: string;     // default: 'terminos_y_condiciones'
    consent_version?: string;  // default: 'v1.0'
    terms_hash?: string;       // SHA256 del texto de términos mostrado
}

/**
 * Registra el consentimiento legal del usuario via Edge Function.
 * La Edge Function captura la IP del servidor para robustez legal.
 *
 * Se llama cuando el usuario toca "Acepto" en TerminosScreen.
 * La tabla consent_log es WRITE-ONLY (sin SELECT/UPDATE/DELETE vía API).
 *
 * @returns true si se registró exitosamente
 */
export const logConsent = async (data: ConsentPayload): Promise<boolean> => {
    console.log('📋 [Supabase] Logging consent for session:', data.session_id);

    try {
        const response = await fetch(LOG_CONSENT_FN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: data.session_id,
                consent_type: data.consent_type ?? 'terminos_y_condiciones',
                consent_version: data.consent_version ?? 'v1.0',
                terms_hash: data.terms_hash ?? null,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ [Supabase] Consent logged:', data.session_id);
            return true;
        } else {
            console.error('❌ [Supabase] Consent log error:', result.error);
            return false;
        }
    } catch (error) {
        // Non-blocking: no interrumpir el flujo aunque falle
        console.error('❌ [Supabase] Failed to log consent:', error);
        return false;
    }
};
