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

  const getField = (...keys: string[]) =>
    keys.map((key) => fields[key]).find((value) => value !== undefined && value !== null && value !== "")

  const getUploadUrl = (value: any) => {
    if (Array.isArray(value)) return value[0]?.url ?? null
    return value?.url ?? value ?? null
  }

  const isYes = (value: unknown) =>
    typeof value === "string" && value.trim().toLowerCase() === "si"

  const { error } = await supabase.from("solicitudes").insert({
    nombre_completo:            getField("Mi nombre completo es", "nombre_completo", "Nombre completo") ?? null,
    cedula:                     getField("Mi número de cédula es", "cedula", "Cédula") ?? null,
    celular:                    getField("Mi celular es", "celular", "Celular") ?? null,
    email:                      getField("Mi E-mail es", "email", "Email") ?? null,
    fecha_nacimiento:           getField("Mi cumpleaño es el", "fecha_nacimiento", "Fecha de nacimiento") ?? null,
    ruc:                        getField("Mi RUC es", "ruc", "RUC") ?? null,
    doc_identidad_extranjera:   getField("Mi Documento de identidad extranjera es", "doc_identidad_extranjera") ?? null,
    cert_residencia_permanente: getUploadUrl(getField("Certificado de resiedencia permanente", "Certificado de residencia permanente")) ?? null,
    metodo_cobro:               getField("¿Dónde quieres recibir el dinero?", "metodo_cobro") ?? null,
    tipo_alias:                 getField("Por favor, elija tipo de alias👇", "tipo_alias") ?? null,
    banco:                      getField("Ingrese su cuenta bancaria")?.first_name ?? null,
    numero_cuenta:              getField("Ingrese su cuenta bancaria")?.last_name ?? null,
    inforconf_limpio:           isYes(getField("¿Tenés Inforconf limpio?", "inforconf_limpio")),
    antiguedad_laboral_6meses:  isYes(getField("¿Tenés más de 6 meses de antigüedad laboral?", "antiguedad_laboral_6meses")),
    ingresos_mensuales:         parseFloat(getField("Ingresos aproximados por mes", "ingresos_mensuales")) || null,
    perfil_laboral:             getField("Perfil laboral actual", "perfil_laboral") ?? null,
    liquidaciones_ips:          getUploadUrl(getField("Subí tus liquidaciones de IPS (opcional)", "liquidaciones_ips")) ?? null,
    formularios_iva:            getUploadUrl(getField("Subí tus formularios 120 de IVA (opcional)", "formularios_iva")) ?? null,
    selfie_cedula:              getUploadUrl(getField("Por favor subí una foto con su cedula", "selfie_cedula")) ?? null,
    raw_data:                   body,
    session_id:                 body.hidden?.session_id ?? body.hidden_fields?.session_id ?? body.variables?.session_id ?? getField("session_id") ?? body.session_id ?? null,
  })

  if (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})
