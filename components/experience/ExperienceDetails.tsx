import { Experience } from "@/lib/data/types"
import { MapPin, Clock, Users, CheckCircle } from "lucide-react"

type Props = { exp: Experience }

export default function ExperienceDetails({ exp }: Props) {
  return (
    <div style={{ paddingBottom: 24 }}>

      <div style={{ padding: "16px", lineHeight: 1.6 }}>
        <InfoRow icon={MapPin} value={exp.zone} />
        <InfoRow icon={Clock} value={exp.duration} />
        <InfoRow icon={Users} value={exp.format} />
      </div>

      <Section title="Antes de ir">
        <Bullet>Te recomendamos llegar 10 minutos antes.</Bullet>
        <Bullet>Lleva ropa cómoda.</Bullet>
        <Bullet>Ten tu confirmación a mano.</Bullet>
      </Section>

      <Section title="Recomendación Vivabox">
        <p style={{ margin: 0, color: "#555" }}>{exp.vivanote}</p>
      </Section>
    </div>
  )
}

function InfoRow({ icon: Icon, value }: any) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
      <Icon size={16} />
      <span>{value}</span>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div style={{ padding: "0 16px", marginTop: 18 }}>
      <h4>{title}</h4>
      {children}
    </div>
  )
}

function Bullet({ children }: any) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <CheckCircle size={16} />
      <span>{children}</span>
    </div>
  )
}
