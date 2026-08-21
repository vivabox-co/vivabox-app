'use client'

import { useRouter } from 'next/navigation'
import { useUI } from '@/components/ui/UIContext'
import { categoryColors } from '@/lib/map/categoryColors'
import { categoryLabel } from '@/lib/map/categoryLabels'
import { formatLabel } from '@/lib/map/formatLabels'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Heart,
} from 'lucide-react'
import PhotoGallery from '@/components/ui/PhotoGallery'
import { RecoExperience } from './recoTypes'

type Props = {
  experience: RecoExperience
  onBack: () => void
}

export default function DetailScreen({ experience, onBack }: Props) {
  const router = useRouter()
  const { isFavorite, toggleFavorite, setSelectedExperience, beginRouteTransition } = useUI()

  if (!experience) return null

  const fav = isFavorite(experience.id)
  const categoryColor =
    categoryColors[experience.category] || '#333'

  // TEMP: le champ gallery n'est pas encore rempli côté données, donc on
  // complète avec 2 visuels de démo pour visualiser le scroll horizontal,
  // comme dans ExperienceExploreMeta.tsx. À retirer une fois que
  // experience.gallery contient de vraies photos.
  const photos = [
    experience.image,
    ...(experience.gallery || []),
    '/image/image_activado1.jpg',
    '/image/image_welcome.webp',
  ].filter((src, i, arr) => !!src && arr.indexOf(src) === i)

  return (
    <div
      style={{
        maxHeight: '85vh',
        overflowY: 'auto', // ✅ UN SEUL SCROLL
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
      }}
    >
      {/* ===== HEADER IMAGE ===== */}
      <div
        style={{
          position: 'relative',
          height: 230,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <PhotoGallery photos={photos} alt={experience.title}>
          {/* ← BACK */}
          <button
            onClick={onBack}
            style={iconLeft}
          >
            <ArrowLeft size={18} />
          </button>

          {/* CATEGORY */}
          <div
            style={{
              ...categoryBadge,
              background: categoryColor,
            }}
          >
            {categoryLabel(experience.category)}
          </div>

          {/* FAVORITE */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(experience.id)
            }}
            style={iconRight}
          >
            <Heart
              size={18}
              color={fav ? '#E11D48' : '#333'}
              fill={fav ? '#E11D48' : 'transparent'}
            />
          </button>
        </PhotoGallery>
      </div>

      {/* ===== CONTENT ===== */}
      <div style={{ padding: '20px 18px' }}>
        <h2 style={{ margin: 0 }}>{experience.title}</h2>

        {/* META */}
        <div style={{ marginTop: 12 }}>
          <MetaRow icon={MapPin} text={experience.zone} />
          <MetaRow icon={Clock} text={experience.duration} />
          <MetaRow icon={Users} text={formatLabel(experience.format)} />
        </div>

        <Section title="Qué vas a vivir" text={experience.vivanote} />
        <ListSection title="Qué incluye" items={experience.includes} />
        <ListSection title="Ideal para" items={experience.idealFor} />
        <ListSection title="A tener en cuenta" items={experience.importantToKnow} />

        <Section
          title="Cómo funciona con Vivabox"
          text="Tú eliges fecha, confirmamos con el lugar y te avisamos cuando todo esté listo."
        />

        {/* CTA */}
        <button
          onClick={() => {
            setSelectedExperience(experience)
            beginRouteTransition()
            router.push('/reservar/fechas')
          }}
          style={cta}
        >
          Elegir esta experiencia
        </button>
      </div>
    </div>
  )
}

/* ================= UI ================= */

const iconBase = {
  position: 'absolute' as const,
  top: 14,
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.85)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

const iconLeft = {
  ...iconBase,
  left: 14,
}

const iconRight = {
  ...iconBase,
  right: 14,
}

const categoryBadge = {
  position: 'absolute' as const,
  top: 16,
  left: 64,
  padding: '6px 12px',
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 600,
  color: 'white',
}

const cta = {
  width: '100%',
  marginTop: 28,
  padding: '16px 18px',
  borderRadius: 14,
  background: '#152F40',
  color: 'white',
  border: 'none',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
}

/* ================= SUB ================= */

function MetaRow({ icon: Icon, text }: any) {
  if (!text) return null
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 6, color: '#444' }}>
      <Icon size={16} />
      <span>{text}</span>
    </div>
  )
}

function Section({ title, text }: any) {
  if (!text) return null
  return (
    <div style={{ marginTop: 24 }}>
      <strong>{title}</strong>
      <p style={{ margin: '6px 0 0', color: '#444' }}>{text}</p>
    </div>
  )
}

function ListSection({ title, items }: any) {
  if (!items?.length) return null
  return (
    <div style={{ marginTop: 24 }}>
      <strong>{title}</strong>
      {items.map((item: string, i: number) => (
        <div key={i} style={{ color: '#444' }}>• {item}</div>
      ))}
    </div>
  )
}
