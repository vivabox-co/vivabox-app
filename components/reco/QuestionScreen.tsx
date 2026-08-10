'use client'

import {
  Leaf,
  Activity,
  Zap,
  Heart,
  Globe,
  Infinity,
  Brain,
  Hand,
  Settings,
  Palette,
  Eye,
  Hammer,
  ArrowLeft,
  LucideIcon,
} from 'lucide-react'

type Engagement = 'relajado' | 'activo' | 'sacudido'

type Props = {
  index: 0 | 1 | 2
  engagement?: Engagement
  onAnswer: (answer: string) => void
  onBack?: () => void
  disabled?: boolean
}

/* ================= THEMES ================= */
/* Palette reprise de categoryColors.ts pour rester cohérent avec les pins de la carte */

const THEMES = {
  green: { bg: '#DAF5E3', icon: '#22C55E', title: '#14532D', subtitle: '#16A34A' },
  amber: { bg: '#FDECC8', icon: '#F59E0B', title: '#92400E', subtitle: '#D97706' },
  red: { bg: '#FCDEDE', icon: '#EF4444', title: '#991B1B', subtitle: '#DC2626' },
  blue: { bg: '#DCE9FE', icon: '#3B82F6', title: '#1E3A8A', subtitle: '#2563EB' },
  violet: { bg: '#EDE4FE', icon: '#8B5CF6', title: '#4C1D95', subtitle: '#7C3AED' },
} as const

type ThemeName = keyof typeof THEMES

/* ================= STYLES ================= */

const screenStyle: React.CSSProperties = {
  position: 'relative',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '24px',
}

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 18,
  textAlign: 'center',
}

/* --- Question --- */

const questionStyleQ1: React.CSSProperties = {
  fontSize: 21,
  fontWeight: 600,
  lineHeight: 1.4,
  maxWidth: 320,
  color: '#111',
}

const questionStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.4,
  maxWidth: 320,
  color: '#111',
}

/* --- Options grid --- */

const optionsGrid3: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 8,
  width: '100%',
  maxWidth: 360,
}

const optionsGrid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 10,
  width: '100%',
  maxWidth: 280,
}

/* ================= HELPER ================= */

function OptionCard({
  icon: Icon,
  theme,
  title,
  subtitle,
  onClick,
  disabled,
}: {
  icon: LucideIcon
  theme: ThemeName
  title: string
  subtitle: string
  onClick: () => void
  disabled?: boolean
}) {
  const t = THEMES[theme]

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '14px 6px',
        borderRadius: 16,
        background: t.bg,
        border: 'none',
        font: 'inherit',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.1s ease',
      }}
      onMouseDown={e => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'
      }}
      onMouseUp={e => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <Icon size={28} color={t.icon} strokeWidth={1.75} />
      <span style={{ fontSize: 13, fontWeight: 600, color: t.title, lineHeight: 1.25 }}>
        {title}
      </span>
      <span style={{ fontSize: 11, color: t.subtitle, lineHeight: 1.2 }}>
        {subtitle}
      </span>
    </button>
  )
}

/* ================= COMPONENT ================= */

export default function QuestionScreen({
  index,
  engagement,
  onAnswer,
  onBack,
  disabled,
}: Props) {
  return (
    <div style={screenStyle}>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.06)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} color="#111" />
        </button>
      )}

      {/* ================= Q1 ================= */}
      {index === 0 && (
        <div style={wrapperStyle}>
          <div style={questionStyleQ1}>
            ¿Cómo te gusta que un momento te haga sentir?
          </div>

          <div style={optionsGrid3}>
            <OptionCard
              icon={Leaf}
              theme="green"
              title="Relajado"
              subtitle="sin esfuerzo"
              onClick={() => onAnswer('relajado')}
            />
            <OptionCard
              icon={Activity}
              theme="amber"
              title="Activo"
              subtitle="participando"
              onClick={() => onAnswer('activo')}
            />
            <OptionCard
              icon={Zap}
              theme="red"
              title="Sacudido"
              subtitle="fuera de lo habitual"
              onClick={() => onAnswer('sacudido')}
            />
          </div>
        </div>
      )}

      {/* ================= Q2 ================= */}
      {index === 1 && engagement === 'relajado' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>¿Qué tipo de calma buscas?</div>

          <div style={optionsGrid3}>
            <OptionCard
              icon={Heart}
              theme="red"
              title="Corporal"
              subtitle="relajante"
              onClick={() => onAnswer('corporal')}
            />
            <OptionCard
              icon={Globe}
              theme="green"
              title="Ambiental"
              subtitle="acogedora"
              onClick={() => onAnswer('ambiental')}
            />
            <OptionCard
              icon={Infinity}
              theme="blue"
              title="Interior"
              subtitle="silenciosa"
              onClick={() => onAnswer('interior')}
            />
          </div>
        </div>
      )}

      {index === 1 && engagement === 'activo' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            Cuando participas, prefieres algo…
          </div>

          <div style={optionsGrid3}>
            <OptionCard
              icon={Brain}
              theme="blue"
              title="Mental"
              subtitle="aprendiendo"
              onClick={() => onAnswer('mental')}
            />
            <OptionCard
              icon={Hand}
              theme="violet"
              title="Manual"
              subtitle="haciendo"
              onClick={() => onAnswer('manual')}
            />
            <OptionCard
              icon={Settings}
              theme="amber"
              title="Técnico"
              subtitle="concentrado"
              onClick={() => onAnswer('tecnico')}
            />
          </div>
        </div>
      )}

      {index === 1 && engagement === 'sacudido' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            Lo fuera de lo habitual te atrae si es…
          </div>

          <div style={optionsGrid3}>
            <OptionCard
              icon={Brain}
              theme="blue"
              title="Mental"
              subtitle="desafiante"
              onClick={() => onAnswer('mental')}
            />
            <OptionCard
              icon={Palette}
              theme="violet"
              title="Sensorial"
              subtitle="sorprendente"
              onClick={() => onAnswer('sensorial')}
            />
            <OptionCard
              icon={Heart}
              theme="red"
              title="Emocional"
              subtitle="intenso"
              onClick={() => onAnswer('emocional')}
            />
          </div>
        </div>
      )}

      {/* ================= Q3 ================= */}
      {index === 2 && engagement === 'relajado' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            Esa calma la prefieres…
          </div>

          <div style={optionsGrid2}>
            <OptionCard
              icon={Activity}
              theme="amber"
              title="En el cuerpo"
              subtitle="soltando"
              disabled={disabled}
              onClick={() => onAnswer('cuerpo')}
            />
            <OptionCard
              icon={Globe}
              theme="green"
              title="En el entorno"
              subtitle="estando"
              disabled={disabled}
              onClick={() => onAnswer('entorno')}
            />
          </div>
        </div>
      )}

      {index === 2 && engagement === 'activo' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            En ese tipo de experiencia, disfrutas más…
          </div>

          <div style={optionsGrid2}>
            <OptionCard
              icon={Hammer}
              theme="amber"
              title="Creando"
              subtitle="haciendo"
              disabled={disabled}
              onClick={() => onAnswer('crear')}
            />
            <OptionCard
              icon={Eye}
              theme="violet"
              title="Comprendiendo"
              subtitle="observando"
              disabled={disabled}
              onClick={() => onAnswer('comprender')}
            />
          </div>
        </div>
      )}

      {index === 2 && engagement === 'sacudido' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            Ese impacto lo prefieres…
          </div>

          <div style={optionsGrid2}>
            <OptionCard
              icon={Zap}
              theme="red"
              title="Inmediato"
              subtitle="en el momento"
              disabled={disabled}
              onClick={() => onAnswer('inmediato')}
            />
            <OptionCard
              icon={Infinity}
              theme="blue"
              title="Duradero"
              subtitle="que deja huella"
              disabled={disabled}
              onClick={() => onAnswer('duradero')}
            />
          </div>
        </div>
      )}

      {index === 2 && disabled && (
        <div
          style={{
            marginTop: 16,
            textAlign: 'center',
            fontSize: 13,
            opacity: 0.6,
          }}
        >
          Cargando experiencias…
        </div>
      )}
    </div>
  )
}
