// supabase/functions/create-pre-solicitud/index.ts
//
// Edge Function para crear pre_solicitudes en Supabase.
// Captura IP y user-agent del request (server-side).
//
// Deploy:
//   supabase functions deploy create-pre-solicitud
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
        const { session_id, monto, cuotas, cuota_mensual, device_model, device_os } = body

        // Validación mínima
        if (!session_id || !monto || !cuotas) {
            return new Response(
                JSON.stringify({ error: 'session_id, monto, and cuotas are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Capturar IP del request (la IP real del usuario vista por el servidor de Supabase)
        const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || req.headers.get('cf-connecting-ip') // Cloudflare
            || null

        const user_agent = req.headers.get('user-agent') || null

        // Usar service_role para bypass de RLS
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const { data, error } = await supabase.from('pre_solicitudes').insert({
            session_id,
            monto,
            cuotas,
            cuota_mensual: cuota_mensual || null,
            device_model: device_model || null,
            device_os: device_os || null,
            ip_address,
            user_agent,
        }).select('id').single()

        if (error) {
            console.error('Insert error:', error)
            throw error
        }

        return new Response(
            JSON.stringify({ success: true, id: data?.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        console.error('Function error:', err)
        return new Response(
            JSON.stringify({ error: err.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
