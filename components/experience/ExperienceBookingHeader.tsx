import { Experience } from "@/lib/data/types"

export default function ExperienceBookingHeader({
  exp,
  date,
  time,
}: {
  exp: Experience
  date: string
  time: string
}) {
  return (
    <div style={{ position: "relative" }}>
      <img src={exp.image} style={{ width: "100%", height: 220, objectFit: "cover" }} />

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "#E6F6EA",
          color: "#1E7A3B",
          padding: "6px 12px",
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        Reservado
      </div>

      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 4 }}>{exp.title}</h2>
        <p style={{ opacity: 0.6 }}>{exp.zone}</p>
        <div style={{ marginTop: 8, fontWeight: 500 }}>{date} · {time}</div>
      </div>
    </div>
  )
}
