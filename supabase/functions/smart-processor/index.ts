import { createClient } from "jsr:@supabase/supabase-js@2"

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const body = await req.json()

  // Convertir el array de fields en un objeto clave->valor
  const fields: Record<string, any> = {}
  for (const field of body.fields ?? []) {
    fields[field.question] = field.answer
  }

  console.log("FIELDS:", JSON.stringify(fields, null, 2))

  const { error } = await supabase.from("solicitudes").insert({
    nombre_completo:            fields["Mi nombre completo es"] ?? null,
    cedula:                     fields["Mi número de cédula es"] ?? null,
    celular:                    fields["Mi celular es"] ?? null,
    email:                      fields["Mi E-mail es"] ?? null,
    fecha_nacimiento:           fields["Mi cumpleaño es el"] ?? null,
    ruc:                        fields["Mi RUC es"] ?? null,
    doc_identidad_extranjera:   fields["Mi Documento de identidad extranjera es"] ?? null,
    cert_residencia_permanente: fields["Certificado de resiedencia permanente"] ?? null,
    metodo_cobro:               fields["¿Dónde quieres recibir el dinero?"] ?? null,
    tipo_alias:                 fields["Por favor, elija tipo de alias👇"] ?? null,
    banco:                      fields["Ingrese su cuenta bancaria"]?.first_name ?? null,
    numero_cuenta:              fields["Ingrese su cuenta bancaria"]?.last_name ?? null,
    inforconf_limpio:           fields["¿Tenés Inforconf limpio?"] === "Si",
    antiguedad_laboral_6meses:  fields["¿Tenés más de 6 meses de antigüedad laboral?"] === "Si",
    ingresos_mensuales:         parseFloat(fields["Ingresos aproximados por mes"]) || null,
    perfil_laboral:             fields["Perfil laboral actual"] ?? null,
    liquidaciones_ips:          fields["Subí tus liquidaciones de IPS (opcional)"] ?? null,
    formularios_iva:            fields["Subí tus formularios 120 de IVA (opcional)"] ?? null,
    selfie_cedula:              fields["Por favor subí una foto con su cedula"]?.[0]?.url ?? null,
    raw_data:                   body,
    session_id:                 body.hidden?.session_id ?? body.hidden_fields?.session_id ?? body.variables?.session_id ?? fields["session_id"] ?? body.session_id ?? null,
  })

  if (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})