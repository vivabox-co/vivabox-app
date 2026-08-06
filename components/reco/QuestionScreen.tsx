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
  Sparkles,
  Eye,
  Hammer,
} from 'lucide-react'

type Engagement = 'relajado' | 'activo' | 'sacudido'

type Props = {
  index: 0 | 1 | 2
  engagement?: Engagement
  onAnswer: (answer: string) => void
}

/* ================= STYLES ================= */

const screenStyle: React.CSSProperties = {
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

/* --- Options --- */

const optionsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  width: '100%',
  maxWidth: 360,
}

/**
 * Option noire Vivabox
 * = CTA calme
 * = décision sans pression
 */
const optionCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '18px',
  borderRadius: 16,

  background: '#111',
  color: '#FFF',
  border: 'none',

  cursor: 'pointer',
  textAlign: 'left',

  transition: 'background 0.15s ease, transform 0.1s ease',
}

const optionCardHover: React.CSSProperties = {
  background: '#000',
}

/**
 * Container icône
 * = même matière que la Card principale
 * = zone de sécurité visuelle
 */
const iconWrapStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,

  background: '#F4F4F4',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.08)',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

/* Icône = noire, lisible, non décorative */
const iconStyle: React.CSSProperties = {
  color: '#111',
}

const labelStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  lineHeight: 1.35,
  color: '#FFF',
}

/* ================= HELPER ================= */

function OptionCard({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      style={optionCardStyle}
      onMouseEnter={e => {
  e.currentTarget.style.background = '#000'
}}
onMouseLeave={e => {
  e.currentTarget.style.background = '#111'
}}
      onMouseDown={e => {
        e.currentTarget.style.transform = 'scale(0.985)'
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {children}
    </div>
  )
}

/* ================= COMPONENT ================= */

export default function QuestionScreen({
  index,
  engagement,
  onAnswer,
}: Props) {
  return (
    <div style={screenStyle}>

      {/* ================= Q1 ================= */}
      {index === 0 && (
        <div style={wrapperStyle}>
          <div style={questionStyleQ1}>
            ¿Cómo te gusta que un momento te haga sentir?
          </div>

          <div style={optionsStyle}>
            <OptionCard onClick={() => onAnswer('relajado')}>
              <div style={iconWrapStyle}><Leaf size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Relajado, sin esfuerzo</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('activo')}>
              <div style={iconWrapStyle}><Activity size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Activo, participando</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('sacudido')}>
              <div style={iconWrapStyle}><Zap size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Sacudido, fuera de lo habitual</div>
            </OptionCard>
          </div>
        </div>
      )}

      {/* ================= Q2 ================= */}
      {index === 1 && engagement === 'relajado' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>¿Qué tipo de calma buscas?</div>

          <div style={optionsStyle}>
            <OptionCard onClick={() => onAnswer('corporal')}>
              <div style={iconWrapStyle}><Heart size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Corporal, relajante</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('ambiental')}>
              <div style={iconWrapStyle}><Globe size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Ambiental, acogedora</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('interior')}>
              <div style={iconWrapStyle}><Infinity size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Interior, silenciosa</div>
            </OptionCard>
          </div>
        </div>
      )}

      {index === 1 && engagement === 'activo' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            Cuando participas, prefieres algo…
          </div>

          <div style={optionsStyle}>
            <OptionCard onClick={() => onAnswer('mental')}>
              <div style={iconWrapStyle}><Brain size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Mental, aprendiendo</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('manual')}>
              <div style={iconWrapStyle}><Hand size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Manual, haciendo</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('tecnico')}>
              <div style={iconWrapStyle}><Settings size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Técnico, concentrado</div>
            </OptionCard>
          </div>
        </div>
      )}

      {index === 1 && engagement === 'sacudido' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            Lo fuera de lo habitual te atrae si es…
          </div>

          <div style={optionsStyle}>
            <OptionCard onClick={() => onAnswer('mental')}>
              <div style={iconWrapStyle}><Brain size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Mental, desafiante</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('sensorial')}>
              <div style={iconWrapStyle}><Sparkles size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Sensorial, sorprendente</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('emocional')}>
              <div style={iconWrapStyle}><Heart size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Emocional, intenso</div>
            </OptionCard>
          </div>
        </div>
      )}

      {/* ================= Q3 ================= */}
      {index === 2 && engagement === 'relajado' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            Esa calma la prefieres…
          </div>

          <div style={optionsStyle}>
            <OptionCard onClick={() => onAnswer('cuerpo')}>
              <div style={iconWrapStyle}><Activity size={20} style={iconStyle} /></div>
              <div style={labelStyle}>En el cuerpo, soltando</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('entorno')}>
              <div style={iconWrapStyle}><Globe size={20} style={iconStyle} /></div>
              <div style={labelStyle}>En el entorno, estando</div>
            </OptionCard>
          </div>
        </div>
      )}

      {index === 2 && engagement === 'activo' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            En ese tipo de experiencia, disfrutas más…
          </div>

          <div style={optionsStyle}>
            <OptionCard onClick={() => onAnswer('crear')}>
              <div style={iconWrapStyle}><Hammer size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Creando, haciendo</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('comprender')}>
              <div style={iconWrapStyle}><Eye size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Comprendiendo, observando</div>
            </OptionCard>
          </div>
        </div>
      )}

      {index === 2 && engagement === 'sacudido' && (
        <div style={wrapperStyle}>
          <div style={questionStyle}>
            Ese impacto lo prefieres…
          </div>

          <div style={optionsStyle}>
            <OptionCard onClick={() => onAnswer('inmediato')}>
              <div style={iconWrapStyle}><Zap size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Inmediato, en el momento</div>
            </OptionCard>

            <OptionCard onClick={() => onAnswer('duradero')}>
              <div style={iconWrapStyle}><Infinity size={20} style={iconStyle} /></div>
              <div style={labelStyle}>Duradero, que deja huella</div>
            </OptionCard>
          </div>
        </div>
      )}
    </div>
  )
}
