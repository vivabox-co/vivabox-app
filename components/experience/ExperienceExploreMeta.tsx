"use client"

import { Experience } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import {
  MapPin,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Info,
  ShieldCheck,
} from "lucide-react"

type Props = {
  exp: Experience
  onChoose: () => void
}

export default function ExperienceExploreMeta({ exp, onChoose }: Props) {
  if (!exp) return null

  const color = categoryColors[exp.category] || "#ddd"

  return (
    <div style={{ paddingBottom: 140 }}>
      {/* HERO IMAGE */}
      <div style={{ position: "relative" }}>
        <img
          src={exp.image || "/images/placeholder.jpg"}
          alt={exp.title}
          style={{ width: "100%", height: 220, objectFit: "cover" }}
        />

        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 999,
            background: color,
            color: "white",
          }}
        >
          {exp.category}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* TITRE */}
        <h2 style={{ margin: 0 }}>{exp.title}</h2>

        {/* PROJECTION */}
        {exp.shortDescription && (
          <p style={{ marginTop: 8, color: "#444", lineHeight: 1.5 }}>
            {exp.shortDescription}
          </p>
        )}

        {/* META EXPRESS */}
        <div style={{ marginTop: 14 }}>
          <InfoRow icon={MapPin} value={exp.zone} />
          <InfoRow icon={Clock} value={exp.duration} />
          <InfoRow icon={Users} value={exp.format} />
        </div>

        {/* QUÉ VAS A VIVIR */}
        {exp.vivanote && (
          <Section icon={Sparkles} title="Qué vas a vivir">
            <p style={{ margin: 0 }}>{exp.vivanote}</p>
          </Section>
        )}

        {/* QUÉ INCLUYE */}
        {exp.includes?.length ? (
          <Section icon={CheckCircle2} title="Qué incluye">
            {exp.includes.map((item, i) => (
              <Bullet key={i} text={item} />
            ))}
          </Section>
        ) : null}

        {/* IDEAL PARA */}
        {exp.idealFor?.length ? (
          <Section icon={UserCheck} title="Ideal para">
            {exp.idealFor.map((item, i) => (
              <Bullet key={i} text={item} />
            ))}
          </Section>
        ) : null}

        {/* IMPORTANTE SABER */}
        {exp.importantToKnow?.length ? (
          <Section icon={Info} title="A tener en cuenta">
            {exp.importantToKnow.map((item, i) => (
              <Bullet key={i} text={item} />
            ))}
          </Section>
        ) : null}

        {/* CÓMO FUNCIONA */}
        <Section icon={ShieldCheck} title="Cómo funciona con Vivabox">
          <p style={{ margin: 0 }}>
            Tú eliges fecha, confirmamos con el lugar y te avisamos cuando todo esté listo.
          </p>
        </Section>
      </div>

      {/* CTA FIXE */}
      <div className="sheet-footer">
        <button className="cta-button" onClick={onChoose}>
          Elegir esta experiencia
        </button>
      </div>
    </div>
  )
}

/* ---------- UI PARTS ---------- */

function InfoRow({
  icon: Icon,
  value,
}: {
  icon: any
  value?: string
}) {
  if (!value) return null
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <Icon size={16} />
      <span>{value}</span>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginTop: 22 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        <Icon size={16} />
        {title}
      </div>
      {children}
    </div>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <div>•</div>
      <div>{text}</div>
    </div>
  )
}
