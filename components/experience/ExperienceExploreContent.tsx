import { Experience } from "@/lib/data/types"
import { MapPin, Clock, Users } from "lucide-react"

export default function ExperienceExploreContent({ exp }: { exp: Experience }) {
  return (
    <div>
      <img
        src={exp.image}
        alt={exp.title}
        style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 16 }}
      />

      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 4 }}>{exp.title}</h2>
        <p style={{ opacity: 0.6 }}>{exp.zone}</p>

        <div style={{ marginTop: 12 }}>
          <Info icon={Clock} text={exp.duration} />
          <Info icon={Users} text={exp.format} />
          <Info icon={MapPin} text={exp.zone} />
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
