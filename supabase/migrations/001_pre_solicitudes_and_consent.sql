-- ═══════════════════════════════════════════════════════════════
-- Prestax — Supabase Migration
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. PRE_SOLICITUDES ──────────────────────────────────────
-- Datos de la calculadora (monto, cuotas, dispositivo, IP)
-- Se crea cuando el usuario pasa de Calculator → ConfirmScreen
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pre_solicitudes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    monto BIGINT NOT NULL,
    cuotas INT NOT NULL,
    cuota_mensual BIGINT,
    device_model TEXT,
    device_os TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para búsquedas por session_id
CREATE INDEX IF NOT EXISTS idx_pre_solicitudes_session_id
    ON pre_solicitudes(session_id);

-- RLS: Solo INSERT desde anon (la app)
ALTER TABLE pre_solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_pre_solicitudes"
    ON pre_solicitudes FOR INSERT
    TO anon
    WITH CHECK (true);

-- ─── 2. CONSENT_LOG (WRITE-ONLY — instrumento legal) ────────
-- Se escribe cuando el usuario toca "Acepto" en TerminosScreen
-- NADIE puede SELECT, UPDATE o DELETE via API
-- Solo accesible via Dashboard de Supabase (service_role)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS consent_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    consent_type TEXT NOT NULL DEFAULT 'terminos_y_condiciones',
    consent_version TEXT NOT NULL DEFAULT 'v1.0',
    ip_address INET,
    user_agent TEXT,
    accepted_at TIMESTAMPTZ DEFAULT now(),

    -- SHA256 del texto de términos mostrado (para saber exactamente qué aceptó)
    terms_hash TEXT
);

-- Índice para auditorías
CREATE INDEX IF NOT EXISTS idx_consent_log_session_id
    ON consent_log(session_id);

CREATE INDEX IF NOT EXISTS idx_consent_log_accepted_at
    ON consent_log(accepted_at);

-- RLS: SOLO INSERT — nadie puede leer, modificar o borrar via API
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_consent_log"
    ON consent_log FOR INSERT
    TO anon
    WITH CHECK (true);

-- NO crear policies de SELECT/UPDATE/DELETE
-- → La tabla es write-only para el cliente
-- → Solo accesible via service_role (Dashboard/Edge Functions)


-- ─── 3. AGREGAR session_id A SOLICITUDES (tabla existente) ──
-- YouForm enviará este campo en su webhook para correlacionar
-- ─────────────────────────────────────────────────────────────

ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_solicitudes_session_id
    ON solicitudes(session_id);


-- ═══════════════════════════════════════════════════════════════
-- QUERY DE VERIFICACIÓN — Toda la info junta
-- ═══════════════════════════════════════════════════════════════
-- Descomenta para probar después de que un usuario complete el flujo:
--
-- SELECT
--     ps.session_id,
--     ps.monto, ps.cuotas, ps.cuota_mensual,
--     ps.device_model, ps.device_os,
--     ps.ip_address AS calculator_ip,
--     ps.created_at AS calculator_timestamp,
--     cl.accepted_at AS consent_timestamp,
--     cl.ip_address AS consent_ip,
--     cl.consent_version,
--     s.nombre_completo, s.cedula, s.celular, s.email,
--     s.status
-- FROM pre_solicitudes ps
-- LEFT JOIN consent_log cl ON cl.session_id = ps.session_id
-- LEFT JOIN solicitudes s ON s.session_id = ps.session_id
-- ORDER BY ps.created_at DESC
-- LIMIT 20;
