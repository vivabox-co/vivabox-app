"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { LEGAL_VERSION, LEGAL_CONTACT_EMAIL } from "@/lib/constants/legal"
import { getWhatsAppLink } from "@/lib/constants/contact"
import { useUI } from "@/components/ui/UIContext"

export default function TerminosPage() {
  const router = useRouter()
  const { setHideNav } = useUI()

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  return (
    <div style={page}>
      <div style={header}>
        <button onClick={() => router.back()} style={backBtn} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <h1 style={h1}>Términos y Condiciones</h1>
      </div>

      <p style={updated}>Última actualización: {LEGAL_VERSION}</p>

      <div style={card} className="vb-legal">
        <Section title="1. Quién es Vivabox">
          <p>
            Esta aplicación de activación (en adelante, "la App") es operada por{" "}
            <strong>Vivabox Colombia SAS</strong>, identificada con{" "}
            <strong>NIT 902.043.916-8</strong>, domiciliada en Bogotá, Colombia. En
            este documento nos referimos a Vivabox Colombia SAS simplemente como{" "}
            <strong>"Vivabox"</strong>.
          </p>
        </Section>

        <Section title="2. Objeto">
          <p>
            Estos Términos y Condiciones regulan el uso de la App por parte de las
            personas beneficiarias de un regalo Vivabox (en adelante, "el usuario" o
            "tú"). Al activar tu código e ingresar tus datos, aceptas estos términos
            en su totalidad. Estos términos complementan, sin reemplazar, los{" "}
            <a href="https://vivabox.com.co/terminos-y-condiciones" target="_blank" rel="noreferrer" style={link}>
              Términos y condiciones generales de compra
            </a>{" "}
            de Vivabox, que rigen la adquisición de la caja física.
          </p>
        </Section>

        <Section title="3. Descripción del servicio">
          <p>
            Vivabox permite a la persona beneficiaria de un regalo activar su código,
            explorar experiencias disponibles, elegir una y solicitar una reserva de
            fecha con el lugar correspondiente. La confirmación de la reserva depende
            de la disponibilidad del lugar prestador de la experiencia; Vivabox actúa
            como intermediario entre el usuario y dicho lugar.
          </p>
        </Section>

        <Section title="4. Activación y vigencia">
          <p>
            Cada código de activación es personal, corresponde a un único regalo y
            tiene una vigencia limitada (indicada dentro de la App) a partir de la
            fecha de compra. Una vez activado el código, el usuario podrá acceder a
            la App durante el período de vigencia para elegir y reservar su
            experiencia. Vencido ese plazo, el código deja de ser utilizable.
          </p>
        </Section>

        <Section title="5. Obligaciones del usuario">
          <p>
            El usuario se compromete a proporcionar datos veraces al activar su
            código (nombre, apellido y correo electrónico), a hacer un uso adecuado
            de la App y a respetar las condiciones particulares de cada experiencia
            (capacidad, horarios, políticas del lugar prestador). El código de
            activación es de uso personal e intransferible.
          </p>
        </Section>

        <Section title="6. Reservas, cambios y cancelaciones">
          <p>
            Las solicitudes de reserva quedan sujetas a confirmación por parte del
            lugar prestador de la experiencia. El usuario puede cambiar de
            experiencia mientras su reserva no esté confirmada, y solicitar un
            cambio de fecha según las condiciones indicadas en la App. Para
            cancelaciones o casos no contemplados, el usuario puede contactar al
            soporte de Vivabox por WhatsApp.
          </p>
          <p>
            Una vez el código de tu Vivabox ha sido activado, no aplica el derecho
            de retracto sobre la compra: consulta{" "}
            <a href="https://vivabox.com.co/cambios-y-devoluciones" target="_blank" rel="noreferrer" style={link}>
              Cambios y devoluciones
            </a>{" "}
            para más detalle sobre este derecho y sus excepciones.
          </p>
        </Section>

        <Section title="7. Responsabilidad">
          <p>
            Vivabox gestiona la intermediación entre el usuario y los lugares
            prestadores de las experiencias, pero no presta directamente dichos
            servicios ni es responsable de la ejecución, calidad o condiciones
            específicas de cada experiencia, las cuales dependen del lugar
            correspondiente. Vivabox no garantiza la disponibilidad continua o sin
            interrupciones de la App.
          </p>
        </Section>

        <Section title="8. Propiedad intelectual">
          <p>
            Los contenidos, marca, logotipos y diseño de la App son propiedad de
            Vivabox o de sus licenciantes. Queda prohibida su reproducción o uso sin
            autorización previa.
          </p>
        </Section>

        <Section title="9. Modificaciones">
          <p>
            Vivabox podrá actualizar estos Términos y Condiciones en cualquier
            momento. Los cambios relevantes se reflejarán en la fecha de "última
            actualización" indicada arriba, y podrán requerir una nueva aceptación
            por parte del usuario.
          </p>
        </Section>

        <Section title="10. Suspensión de acceso">
          <p>
            Vivabox se reserva el derecho de suspender el acceso de un usuario a la
            App en caso de uso indebido, fraude o incumplimiento de estos términos.
          </p>
        </Section>

        <Section title="11. Legislación aplicable">
          <p>
            Estos Términos se rigen por las leyes de la República de Colombia, en
            particular por la Ley 1480 de 2011 (Estatuto del Consumidor). Cualquier
            controversia que no se resuelva directamente con Vivabox podrá
            presentarse ante la Superintendencia de Industria y Comercio o ante la
            autoridad judicial competente.
          </p>
        </Section>

        <Section title="12. Contacto">
          <p>
            Para dudas sobre estos Términos, puedes escribirnos a{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} style={link}>{LEGAL_CONTACT_EMAIL}</a>{" "}
            o por{" "}
            <a href={getWhatsAppLink("Hola, tengo una pregunta sobre los Términos y Condiciones.")} target="_blank" rel="noreferrer" style={link}>
              WhatsApp
            </a>.
          </p>
        </Section>
      </div>

      <style jsx>{`
        .vb-legal p {
          margin: 0;
          font-size: 14.5px;
          line-height: 1.6;
          color: #444;
        }
        .vb-legal p + p {
          margin-top: 8px;
        }
      `}</style>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={section}>
      <h2 style={h2}>{title}</h2>
      {children}
    </div>
  )
}

/* ============================= */
/* STYLES */
/* ============================= */

const page: React.CSSProperties = {
  padding: "16px 16px 60px",
  background: "#FAF8F5",
  minHeight: "100vh",
}

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 6,
}

const backBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "none",
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#152F40",
  cursor: "pointer",
  flexShrink: 0,
}

const h1: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#152F40",
  margin: 0,
}

const updated: React.CSSProperties = {
  fontSize: 12.5,
  color: "#9a9a9a",
  margin: "0 0 18px 46px",
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 20,
  padding: "20px 20px 8px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
}

const section: React.CSSProperties = {
  marginBottom: 20,
}

const h2: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 650,
  color: "#152F40",
  marginBottom: 6,
}

const link: React.CSSProperties = {
  color: "#152F40",
  fontWeight: 600,
  textDecoration: "underline",
}
