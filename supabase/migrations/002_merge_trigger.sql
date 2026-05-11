-- ═══════════════════════════════════════════════════════════════
-- Automatización: Unir datos de Calculadora + YouForm en "solicitudes"
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Agregamos las columnas necesarias a tu tabla "solicitudes"
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS monto BIGINT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS cuotas INT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS cuota_mensual BIGINT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS device_model TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS device_os TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS ip_address INET;

-- 2. Creamos la función "mágica" que copiará los datos
CREATE OR REPLACE FUNCTION merge_pre_solicitud_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el webhook de YouForm envía un session_id...
    IF NEW.session_id IS NOT NULL THEN
        -- Buscar los datos en pre_solicitudes y copiarlos a la nueva fila
        SELECT monto, cuotas, cuota_mensual, device_model, device_os, ip_address
        INTO NEW.monto, NEW.cuotas, NEW.cuota_mensual, NEW.device_model, NEW.device_os, NEW.ip_address
        FROM pre_solicitudes
        WHERE session_id = NEW.session_id
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Creamos el Trigger para que esto ocurra de forma automática ANTES de insertar
DROP TRIGGER IF EXISTS trigger_merge_pre_solicitud ON solicitudes;

CREATE TRIGGER trigger_merge_pre_solicitud
BEFORE INSERT ON solicitudes
FOR EACH ROW
EXECUTE FUNCTION merge_pre_solicitud_data();
