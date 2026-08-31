"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { LEGAL_VERSION, LEGAL_CONTACT_EMAIL } from "@/lib/constants/legal"
import { getWhatsAppLink } from "@/lib/constants/contact"
import { useUI } from "@/components/ui/UIContext"

export default function PrivacidadPage() {
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
        <h1 style={h1}>Política de Tratamiento de Datos</h1>
      </div>

      <p style={updated}>Última actualización: {LEGAL_VERSION}</p>

      <div style={card} className="vb-legal">
        <Section title="1. Responsable del tratamiento">
          <p>
            El responsable del tratamiento de tus datos personales es{" "}
            <strong>Vivabox Colombia SAS</strong>, identificada con{" "}
            <strong>NIT 902.043.916-8</strong>, domiciliada en Bogotá, Colombia, de
            conformidad con la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás
            normas colombianas sobre protección de datos personales (Habeas Data).
            Puedes contactarnos en{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} style={link}>{LEGAL_CONTACT_EMAIL}</a>.
          </p>
          <p>
            Esta política complementa, sin reemplazar, la{" "}
            <a href="https://vivabox.com.co/politica-de-datos" target="_blank" rel="noreferrer" style={link}>
              Política de tratamiento de datos personales
            </a>{" "}
            general de Vivabox, que cubre además la compra y el envío de la caja
            física.
          </p>
        </Section>

        <Section title="2. Datos que recolectamos">
          <p>
            Al activar tu código recolectamos: nombre, apellido y correo
            electrónico. Durante el uso de la App podemos recolectar además: tu
            ubicación aproximada o precisa (cuando usas funciones de mapa o
            solicitas ayuda para llegar a un lugar), tus experiencias favoritas y
            reservas, y datos técnicos básicos (dirección IP, tipo de dispositivo)
            con fines de seguridad y prevención de fraude.
          </p>
        </Section>

        <Section title="3. Finalidad del tratamiento">
          <p>
            Usamos tus datos para: activar y validar tu código Vivabox, permitirte
            explorar y reservar experiencias, comunicarnos contigo sobre el estado
            de tus solicitudes, brindarte soporte y asistencia (incluida la
            ubicación para orientarte hacia un lugar), y mejorar el funcionamiento
            de la App. No usamos tus datos con fines publicitarios de terceros.
          </p>
        </Section>

        <Section title="4. Ubicación (geolocalización)">
          <p>
            El uso de tu ubicación es opcional y depende del permiso que otorgues a
            través de tu navegador o dispositivo. Puedes revocar este permiso en
            cualquier momento desde la configuración de tu navegador o sistema
            operativo, sin que eso impida el uso general de la App.
          </p>
        </Section>

        <Section title="5. Notificaciones">
          <p>
            Si instalas la App y aceptas recibir notificaciones, podremos enviarte
            avisos relacionados con el estado de tus reservas. Puedes desactivarlas
            en cualquier momento desde la configuración de tu dispositivo.
          </p>
        </Section>

        <Section title="6. Con quién compartimos tus datos">
          <p>
            Compartimos únicamente los datos necesarios con el lugar prestador de la
            experiencia que reserves (por ejemplo, tu nombre y fecha solicitada),
            con el fin de gestionar dicha reserva. No vendemos ni cedemos tus datos
            personales a terceros con fines comerciales.
          </p>
        </Section>

        <Section title="7. Conservación de los datos">
          <p>
            Conservamos tus datos mientras tu código Vivabox esté vigente y durante
            el tiempo adicional necesario para atender obligaciones legales,
            contables o para resolver eventuales reclamaciones.
          </p>
        </Section>

        <Section title="8. Tus derechos como titular">
          <p>Como titular de tus datos personales, tienes derecho a:</p>
          <ul>
            <li>Conocer, actualizar y rectificar tus datos personales.</li>
            <li>Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.</li>
            <li>Ser informado sobre el uso que se le ha dado a tus datos.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley de protección de datos.</li>
            <li>Revocar la autorización o solicitar la supresión de tus datos, cuando no exista un deber legal o contractual que nos obligue a conservarlos.</li>
            <li>Acceder de forma gratuita a tus datos personales tratados por Vivabox.</li>
          </ul>
          <p>
            Puedes ejercer cualquiera de estos derechos escribiéndonos a{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} style={link}>{LEGAL_CONTACT_EMAIL}</a>.
            Las consultas se responden en máximo diez (10) días hábiles (prorrogables
            cinco días más si es necesario) y los reclamos en máximo quince (15) días
            hábiles, conforme a la Ley 1581 de 2012.
          </p>
        </Section>

        <Section title="9. Seguridad">
          <p>
            Adoptamos medidas técnicas y organizativas razonables para proteger tus
            datos personales frente a acceso no autorizado, pérdida o alteración.
          </p>
        </Section>

        <Section title="10. Cambios a esta política">
          <p>
            Podemos actualizar esta política para reflejar cambios en la App o en la
            normativa aplicable. La fecha de "última actualización" indicada arriba
            refleja la versión vigente.
          </p>
        </Section>

        <Section title="11. Contacto">
          <p>
            Para consultas sobre el tratamiento de tus datos personales, escríbenos a{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} style={link}>{LEGAL_CONTACT_EMAIL}</a>{" "}
            o por{" "}
            <a href={getWhatsAppLink("Hola, tengo una pregunta sobre el tratamiento de mis datos personales.")} target="_blank" rel="noreferrer" style={link}>
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
        .vb-legal p + p,
        .vb-legal ul + p {
          margin-top: 8px;
        }
        .vb-legal ul {
          margin: 6px 0 0;
          padding-left: 20px;
        }
        .vb-legal li {
          font-size: 14.5px;
          line-height: 1.6;
          color: #444;
          margin-bottom: 4px;
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
