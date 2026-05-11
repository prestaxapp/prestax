// supabase/functions/log-consent/index.ts
//
// Edge Function para registrar consentimiento legal en consent_log.
// Tabla WRITE-ONLY — sin SELECT/UPDATE/DELETE via API.
//
// Captura IP y user-agent del request (server-side)
// para que sea un instrumento legal robusto.
//
// Deploy:
//   supabase functions deploy log-consent
//
// Requiere env vars (ya configuradas por defecto en Supabase):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const { session_id, consent_type, consent_version, terms_hash } = body

        // Validación mínima
        if (!session_id) {
            return new Response(
                JSON.stringify({ error: 'session_id is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Capturar IP del request — la IP REAL vista por el servidor
        const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || req.headers.get('cf-connecting-ip') // Cloudflare
            || null

        const user_agent = req.headers.get('user-agent') || null

        // Usar service_role para bypass de RLS y escribir en tabla write-only
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const { data, error } = await supabase.from('consent_log').insert({
            session_id,
            consent_type: consent_type || 'terminos_y_condiciones',
            consent_version: consent_version || 'v1.0',
            ip_address,
            user_agent,
            terms_hash: terms_hash || null,
        }).select('id').single()

        if (error) {
            console.error('Consent insert error:', error)
            throw error
        }

        console.log(`✅ Consent logged for session ${session_id} from IP ${ip_address}`)

        return new Response(
            JSON.stringify({ success: true, id: data?.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        console.error('Consent function error:', err)
        return new Response(
            JSON.stringify({ error: err.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
