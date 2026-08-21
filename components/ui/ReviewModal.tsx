"use client"

import { useState } from "react"
import { Star, X } from "lucide-react"

type Props = {
  bookingId: string
  onClose: () => void
  onSuccess: (data: { rating: number; comment: string | null }) => void
}

export default function ReviewModal({ bookingId, onClose, onSuccess }: Props) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (rating === 0) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/booking/${bookingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      })
      const data = await res.json()

      if (data.success) {
        onSuccess({ rating: data.data.rating, comment: data.data.comment })
        onClose()
      } else if (data.error === "ALREADY_REVIEWED") {
        setError("Ya nos dejaste tu opinión, ¡gracias!")
      } else {
        setError("No pudimos enviar tu opinión. Intenta de nuevo.")
      }
    } catch (err) {
      console.error("Error submitting review:", err)
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h3 style={{ margin: 0, fontSize: 18 }}>¿Cómo te fue?</h3>
          <button onClick={onClose} style={closeBtn}>
            <X size={18} />
          </button>
        </div>

        <p style={hint}>Tu opinión ayuda a otros a descubrir experiencias que valen la pena.</p>

        <div style={starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              style={starBtn}
              aria-label={`${n} estrellas`}
            >
              <Star
                size={30}
                fill={n <= (hoverRating || rating) ? "#F5A623" : "none"}
                color={n <= (hoverRating || rating) ? "#F5A623" : "#D8D3CA"}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos más (opcional)"
          style={textarea}
          rows={3}
          maxLength={1000}
        />

        {error && <p style={errorText}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          style={{ ...submitBtn, opacity: rating === 0 || submitting ? 0.4 : 1 }}
        >
          {submitting ? "Enviando..." : "Enviar opinión"}
        </button>
      </div>
    </div>
  )
}

/* ---------- STYLES ---------- */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 2000,
}

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 500,
  background: "#fff",
  borderRadius: "28px 28px 0 0",
  padding: "24px 20px 32px",
}

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}

const closeBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "#F3F3F3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}

const hint: React.CSSProperties = { fontSize: 13, color: "#777", marginTop: 10, marginBottom: 18, lineHeight: 1.4 }

const starsRow: React.CSSProperties = { display: "flex", justifyContent: "center", gap: 6, marginBottom: 18 }

const starBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 4,
  cursor: "pointer",
  display: "flex",
}

const textarea: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  border: "1px solid #E5E2DB",
  background: "#F7F5F2",
  fontSize: 14,
  fontFamily: "inherit",
  resize: "none",
  boxSizing: "border-box",
}

const errorText: React.CSSProperties = { color: "#B42318", fontSize: 13, marginTop: 14 }

const submitBtn: React.CSSProperties = {
  marginTop: 20,
  width: "100%",
  padding: 16,
  borderRadius: 14,
  background: "#152F40",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
}
