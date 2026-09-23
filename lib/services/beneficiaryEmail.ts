import type { SupabaseClient } from "@supabase/supabase-js"
import { escapeHtml, getResend } from "./email"
import { APP_URL } from "@/lib/constants/site"
import { whatsappLink } from "@/lib/constants/whatsapp"
import { MOMENT_LABEL } from "@/lib/utils/moment"
import { formatApproxHour } from "@/lib/utils/formatApproxHour"
import { isValidEmail } from "@/lib/utils/isValidEmail"
import { fetchExperiencesFromSheet } from "@/lib/data/fetchExperiences"

// Emails transactionnels envoyés au BÉNÉFICIAIRE (celui qui active le code et
// réserve — pas l'acheteur, voir buyerEmail.ts côté site vitrine). Envoyés
// depuis le sous-domaine déjà vérifié dans Resend (notify.vivabox.com.co,
// voir docs/02_security.md de vivabox-operativo) : le domaine racine
// vivabox.com.co ne l'est pas encore (403 "domain is not verified" — même
// constat que src/services/buyerEmail.ts du site vitrine), d'où le Reply-To
// vers contact@ (Google Workspace) plutôt qu'un envoi direct depuis là.
const FROM = process.env.BENEFICIARY_EMAIL_FROM || "Vivabox <reservas@notify.vivabox.com.co>"
const REPLY_TO = "contact@vivabox.com.co"

// Même logo que buyerEmail.ts (site vitrine) : URL absolue obligatoire pour
// un client mail, hébergée là-bas mais réutilisable depuis n'importe quel
// repo. Voir le commentaire original pour le pourquoi de la pastille crème
// (mode sombre Gmail).
const LOGO_URL = "https://www.vivabox.com.co/images/email/vivabox-logo-full.png"

type Content = {
  subject: string
  title: string
  paragraphs: string[]
  rows: [label: string, value: string][]
  cta: { label: string; url: string } | null
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || ""
}

function formatDateEs(dateStr: string | null): string {
  if (!dateStr) return ""
  const d = new Date(`${dateStr}T00:00:00`)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  })
}

// Le créneau est replié dans `message` (pas de colonne dédiée — voir
// POST /api/booking) sous la forme "Horario: <label> (~HH:MM)". Même
// reformulation qu'app/api/booking/[bookingId]/route.ts (GET) : l'heure
// saisie par l'équipe n'est jamais exacte, donc "alrededor de las" + heure
// arrondie plutôt que montrée telle quelle.
function extractHorario(message: string | null): string {
  const timeMatch = message?.match(/Horario:\s*([^·]+)/)
  const rawTime = timeMatch ? timeMatch[1].trim() : ""
  const rawHourMatch = rawTime.match(/\(~(\d{1,2}:\d{2})\)/)
  if (!rawHourMatch) return rawTime
  const approx = formatApproxHour(rawHourMatch[1])
  const label = rawTime.replace(/\s*\(~\d{1,2}:\d{2}\)/, "").trim()
  return approx ? `${label} · alrededor de las ${approx}` : label
}

function renderHtml(greeting: string, content: Content) {
  const paragraphs = content.paragraphs
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1C1C1C">${escapeHtml(p)}</p>`)
    .join("")

  const rows = content.rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6B6B6B">${escapeHtml(label)}</td>
        <td style="padding:6px 0;font-size:14px;color:#18140F;text-align:right"><strong>${escapeHtml(value)}</strong></td>
      </tr>`)
    .join("")

  const button = content.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 20px">
        <tr><td style="border-radius:12px;background:#FF8406">
          <a href="${content.cta.url}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:600;color:#18140F;text-decoration:none">${escapeHtml(content.cta.label)}</a>
        </td></tr>
      </table>`
    : ""

  const help = whatsappLink("Hola, tengo una pregunta sobre mi reserva en Vivabox.")

  return `
    <div style="background:#FAF7F2;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
      <div style="max-width:520px;margin:0 auto;background:#FFFCF9;border-radius:20px;padding:32px 28px">
        <img src="${LOGO_URL}" alt="Vivabox" width="219" style="display:block;border:0;width:219px;max-width:100%;height:auto;margin:0 0 20px -13px;font-size:20px;font-weight:700;color:#FF8406">
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#18140F">${escapeHtml(content.title)}</h1>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1C1C1C">${escapeHtml(greeting)}</p>
        ${paragraphs}
        ${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;padding:8px 16px;background:#FFF4EC;border-radius:14px">${rows}</table>` : ""}
        ${button}
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6B6B6B">
          ¿Dudas? Responde este correo o <a href="${help}" style="color:#E67705">escríbenos por WhatsApp</a>.
        </p>
      </div>
    </div>
  `
}

function renderText(greeting: string, content: Content) {
  return [
    content.title,
    "",
    greeting,
    "",
    ...content.paragraphs.flatMap((p) => [p, ""]),
    ...content.rows.map(([label, value]) => `${label}: ${value}`),
    ...(content.cta ? ["", `${content.cta.label}: ${content.cta.url}`] : []),
    "",
    "¿Dudas? Responde este correo o escríbenos por WhatsApp.",
  ].join("\n")
}

// ===================== Email 1 : bienvenida (activación) =====================

type WelcomeParams = { name: string; email: string; code: string }

// Appelé en ligne depuis POST /api/activate_code (les données sont déjà en
// main, pas besoin de relire la base) — best-effort, ne doit jamais faire
// échouer l'activation elle-même.
export async function sendWelcomeEmail({ name, email, code }: WelcomeParams): Promise<boolean> {
  const to = email.trim()
  if (!isValidEmail(to)) return false

  const content: Content = {
    subject: "¡Tu Vivabox está activada!",
    title: "¡Tu Vivabox ya está activada!",
    paragraphs: [
      "Tu código quedó activado y ya puedes elegir la experiencia que quieres vivir.",
      "Explora el mapa o la lista de experiencias disponibles y solicita hasta 3 fechas de tu preferencia — confirmamos disponibilidad con el lugar en cuanto puedas.",
    ],
    rows: [["Código", code]],
    cta: { label: "Ver experiencias", url: `${APP_URL}/mapa` },
  }

  const greeting = firstName(name) ? `Hola ${firstName(name)},` : "Hola,"

  try {
    const { error } = await getResend().emails.send(
      {
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: content.subject,
        html: renderHtml(greeting, content),
        text: renderText(greeting, content),
      },
      { idempotencyKey: `welcome-${code}` }
    )

    if (error) {
      console.error("WELCOME EMAIL SEND ERROR:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("WELCOME EMAIL ERROR:", error)
    return false
  }
}

// ============ Emails 2 à 5 : cycle de vie de la réservation ============

export type BookingEmailKind = "booking_received" | "confirmed" | "alternative_proposed" | "dates_unavailable"

type BookingRow = {
  id: string
  activation_code_id: string
  experience_code: string
  requested_date: string | null
  requested_dates: string[] | null
  message: string | null
  status: string
  proposed_date: string | null
  proposed_moment: string | null
  proposed_hour: string | null
  extra_people: number | null
  extra_payment_status: string | null
}

// L'état réel de la réservation décide, jamais l'appelant : si quelqu'un se
// trompe de `kind` (ou qu'un appel arrive en retard après un nouveau
// changement de statut), on ne part pas sur un email qui raconterait autre
// chose que ce que la base dit maintenant. Même principe que matchesKind()
// dans buyerEmail.ts (site vitrine).
function matchesKind(kind: BookingEmailKind, status: string): boolean {
  if (kind === "confirmed") return status === "confirmed"
  if (kind === "alternative_proposed") return status === "alternative_proposed"
  if (kind === "dates_unavailable") return status === "cancelled" || status === "cancelled_seen"
  return true // booking_received : n'importe quel statut juste après création
}

function buildContent(kind: BookingEmailKind, booking: BookingRow, experienceTitle: string, providerName: string): Content {
  const trackingUrl = `${APP_URL}/reservar/seguimiento/${booking.id}`

  if (kind === "booking_received") {
    const dates = (booking.requested_dates?.length ? booking.requested_dates : booking.requested_date ? [booking.requested_date] : [])
      .map(formatDateEs)

    return {
      subject: `Recibimos tu solicitud — ${experienceTitle}`,
      title: "¡Recibimos tu solicitud!",
      paragraphs: [
        `Estamos confirmando disponibilidad con ${providerName || "el lugar"} para "${experienceTitle}".`,
        "Te avisamos por aquí en cuanto tengamos una respuesta.",
      ],
      rows: [
        ["Experiencia", experienceTitle],
        ...(dates.length ? ([["Fechas propuestas", dates.join(" · ")]] as [string, string][]) : []),
        ...(booking.extra_people ? ([["Personas extra", String(booking.extra_people)]] as [string, string][]) : []),
      ],
      cta: { label: "Ver seguimiento", url: trackingUrl },
    }
  }

  if (kind === "confirmed") {
    const horario = extractHorario(booking.message)
    const rows: [string, string][] = [
      ["Experiencia", experienceTitle],
      ["Fecha", formatDateEs(booking.requested_date)],
      ...(horario ? ([["Horario", horario]] as [string, string][]) : []),
      ...(providerName ? ([["Lugar", providerName]] as [string, string][]) : []),
    ]

    const needsExtraPayment = (booking.extra_people ?? 0) > 0 && booking.extra_payment_status === "pending"

    return {
      subject: `¡Reserva confirmada! — ${experienceTitle}`,
      title: "¡Tu reserva fue confirmada!",
      paragraphs: [
        `${providerName || "El lugar"} confirmó tu reserva para "${experienceTitle}".`,
        needsExtraPayment
          ? "Como agregaste personas extra al cupo incluido, falta completar el pago del complemento para dejar todo listo."
          : "No tienes que hacer nada más — solo preséntate en la fecha confirmada.",
      ],
      rows,
      cta: { label: needsExtraPayment ? "Completar pago" : "Ver detalles", url: trackingUrl },
    }
  }

  if (kind === "alternative_proposed") {
    const momentLabel = booking.proposed_moment ? (MOMENT_LABEL[booking.proposed_moment] ?? booking.proposed_moment) : ""
    const approxHour = booking.proposed_hour ? formatApproxHour(booking.proposed_hour) : null
    const horario = approxHour ? `${momentLabel} · alrededor de las ${approxHour}` : momentLabel

    return {
      subject: `Te proponemos otra fecha — ${experienceTitle}`,
      title: "El lugar propuso otra fecha",
      paragraphs: [
        `${providerName || "El lugar"} no tenía disponibilidad en tus fechas preferidas para "${experienceTitle}", pero propuso una alternativa.`,
        "Entra a la app para aceptarla, pedir que sigamos buscando otra opción, o cancelar esta reserva.",
      ],
      rows: [
        ["Experiencia", experienceTitle],
        ["Fecha propuesta", formatDateEs(booking.proposed_date)],
        ...(horario ? ([["Horario", horario]] as [string, string][]) : []),
      ],
      cta: { label: "Responder ahora", url: trackingUrl },
    }
  }

  // dates_unavailable
  return {
    subject: `No conseguimos disponibilidad — ${experienceTitle}`,
    title: "No encontramos disponibilidad",
    paragraphs: [
      `No logramos confirmar "${experienceTitle}" con ${providerName || "el lugar"} en ninguna fecha disponible.`,
      "Tu código sigue activo: puedes elegir otra experiencia cuando quieras, sin costo adicional.",
    ],
    rows: [["Experiencia", experienceTitle]],
    cta: { label: "Elegir otra experiencia", url: `${APP_URL}/mapa` },
  }
}

// Appelé (a) en ligne depuis POST /api/booking pour "booking_received", et
// (b) depuis POST /api/internal/booking-notify (appelé par
// vivabox-operativo server-à-serveur) pour "confirmed"/"alternative_proposed"
// /"dates_unavailable", puisque ces trois transitions ont lieu dans cet
// autre repo. Relit toujours la réservation depuis la base plutôt que de
// faire confiance aux données de l'appelant — même logique que
// sendBuyerEmail() côté site vitrine.
//
// Best-effort : un échec est loggé et ne doit jamais faire remonter une
// erreur à l'appelant (booking déjà créé/confirmé de toute façon).
export async function sendBeneficiaryBookingEmail(
  supabase: SupabaseClient,
  bookingId: string,
  kind: BookingEmailKind
): Promise<boolean> {
  try {
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        "id, activation_code_id, experience_code, requested_date, requested_dates, message, status, proposed_date, proposed_moment, proposed_hour, extra_people, extra_payment_status"
      )
      .eq("id", bookingId)
      .maybeSingle<BookingRow>()

    if (bookingError || !booking) {
      console.error("BENEFICIARY EMAIL BOOKING LOOKUP ERROR:", bookingError ?? `booking ${bookingId} not found`)
      return false
    }

    if (!matchesKind(kind, booking.status)) {
      console.warn(`BENEFICIARY EMAIL SKIPPED: booking=${bookingId} kind=${kind} status=${booking.status}`)
      return false
    }

    const { data: activationCode, error: codeError } = await supabase
      .from("activation_codes")
      .select("beneficiary_name, beneficiary_email")
      .eq("id", booking.activation_code_id)
      .maybeSingle<{ beneficiary_name: string | null; beneficiary_email: string | null }>()

    if (codeError || !activationCode) {
      console.error("BENEFICIARY EMAIL CODE LOOKUP ERROR:", codeError ?? `activation code for booking ${bookingId} not found`)
      return false
    }

    const to = (activationCode.beneficiary_email || "").trim()
    if (!isValidEmail(to)) {
      console.warn(`BENEFICIARY EMAIL SKIPPED: invalid beneficiary_email on booking=${bookingId}`)
      return false
    }

    // Le catalogue vit sur le sheet publié (voir /api/experiencias) : on
    // l'interroge directement via la même fonction plutôt que de refaire un
    // aller-retour HTTP interne vers notre propre déploiement.
    let experienceTitle = booking.experience_code
    let providerName = ""
    try {
      const experiences = await fetchExperiencesFromSheet()
      const match = experiences.find((e) => e.id === booking.experience_code)
      if (match) {
        experienceTitle = match.title
        providerName = match.providerName
      }
    } catch (snapshotError) {
      console.error("BENEFICIARY EMAIL EXPERIENCE SNAPSHOT ERROR:", snapshotError)
    }

    const content = buildContent(kind, booking, experienceTitle, providerName)
    const greeting = firstName(activationCode.beneficiary_name || "") ? `Hola ${firstName(activationCode.beneficiary_name || "")},` : "Hola,"

    // Clé d'idempotence Resend (ignore un second envoi identique pendant
    // 24h — voir sendBuyerEmail côté site vitrine) : pour
    // "alternative_proposed", elle inclut la date/l'heure proposées, pour
    // qu'une correction de l'équipe (mêmes statut, nouvelle proposition)
    // déclenche bien un nouvel email plutôt que d'être avalée comme doublon.
    const idempotencyKey =
      kind === "alternative_proposed"
        ? `alt-proposed-${bookingId}-${booking.proposed_date}-${booking.proposed_hour ?? "na"}`
        : `${kind}-${bookingId}`

    const { error: sendError } = await getResend().emails.send(
      {
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: content.subject,
        html: renderHtml(greeting, content),
        text: renderText(greeting, content),
      },
      { idempotencyKey }
    )

    if (sendError) {
      console.error("BENEFICIARY EMAIL SEND ERROR:", sendError)
      return false
    }

    return true
  } catch (error) {
    console.error("BENEFICIARY EMAIL ERROR:", error)
    return false
  }
}
