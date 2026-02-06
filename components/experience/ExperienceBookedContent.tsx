import { Experience } from "@/lib/data/types"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

type Props = {
  exp: Experience
  date: string
  time: string
  reserved?: boolean
}

export default function ExperienceBookedContent({
  exp,
  date,
  time,
  reserved,
}: Props) {
  return (
    <div>
      <div style={{ position: "relative" }}>
        <img
          src={exp.image}
          alt={exp.title}
          style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 16 }}
        />

        {reserved && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "6px 12px",
              borderRadius: 999,
              background: "#E6F6EA",
              color: "#1E7A3B",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Reservado
          </div>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <h2>{exp.title}</h2>

        <div style={{
          marginTop: 10,
          padding: "6px 12px",
          borderRadius: 999,
          background: "#F3EFEA",
          display: "inline-flex",
          gap: 8,
          alignItems: "center",
        }}>
          <Calendar size={14} />
          {date}
          <Clock size={14} />
          {time}
        </div>

        <div style={{ marginTop: 14 }}>
          <Info icon={MapPin} text={exp.zone} />
          <Info icon={Clock} text={exp.duration} />
          <Info icon={Users} text={exp.format} />
        </div>
      </div>
    </div>
  )
}

function Info({ icon: Icon, text }: any) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <Icon size={16} />
      <span>{text}</span>
    </div>
  )
}
