'use client'

import { useEffect, useState } from 'react'
import { RecoState } from './RecoStateMachine'
import { getTop3Experiences } from './recoEngine'
import { loadExperiences as loadRecoMeta } from './recoDataset'

/* ===== TYPES ===== */
import {
  RecoAnswers,
  Engagement,
  CalmaTipo,
  ParticipacionTipo,
  SacudidaTipo,
  Resolucion,
  RecoExperience,
} from './recoTypes'

/* ===== DATA ===== */
import { fetchExperiences } from '@/lib/data/fetchExperiences'

/* ===== UI ===== */
import QuestionScreen from './QuestionScreen'
import Top3Screen from './Top3Screen'
import DetailScreen from './DetailScreen'

type Props = {
  open: boolean
  onClose: () => void
}

type ExtendedRecoState = RecoState | 'intro'

const SESSION_KEY = 'vivabox_reco_intro_seen'

export default function RecoOverlay({ open, onClose }: Props) {
  const [state, setState] = useState<ExtendedRecoState>('idle')

  const [answers, setAnswers] = useState<RecoAnswers>({})

  const [experiences, setExperiences] = useState<RecoExperience[]>([])
  const [top3, setTop3] = useState<RecoExperience[]>([])
  const [selected, setSelected] = useState<RecoExperience | null>(null)

  /* =====================================================
     🔒 BLOQUER LE SCROLL GLOBAL
     ===================================================== */
  useEffect(() => {
    if (!open) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  /* =====================================================
     📦 LOAD & MERGE DATA
     ===================================================== */
  useEffect(() => {
    if (!open) return

    async function loadAll() {
      const [appExperiences, recoMeta] = await Promise.all([
        fetchExperiences(),
        loadRecoMeta(),
      ])

      const merged: RecoExperience[] = appExperiences.map(app => {
        const meta = recoMeta.find(
          r => r.activity_key === app.activity_key
        )

        if (!meta) {
          console.warn('Reco meta missing for', app.activity_key)
        }

        return {
          ...app,
          ...meta,
        }
      })

      setExperiences(merged)
    }

    loadAll()
  }, [open])

  /* =====================================================
     🚪 ENTRY POINT + RESET
     ===================================================== */
  useEffect(() => {
    if (!open) {
      setState('idle')
      setAnswers({})
      setTop3([])
      setSelected(null)
      return
    }

    const introSeen =
      typeof window !== 'undefined' &&
      sessionStorage.getItem(SESSION_KEY) === 'true'

    setState(introSeen ? 'q1' : 'intro')
  }, [open])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        backdropFilter: 'blur(10px) brightness(0.95)',
        WebkitBackdropFilter: 'blur(10px) brightness(0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* ================= CARD ================= */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,

          /* 🔥 RÈGLE UX CENTRALE */
          minHeight: '45vh',
          maxHeight: '85vh',

          background: 'rgba(255,255,255,0.92)',
          borderRadius: 28,
          boxShadow: '0 30px 70px rgba(0,0,0,0.12)',
          overflow: 'hidden', // 🚫 PAS DE SCROLL ICI

          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ================= FLOW ================= */}

        {state === 'intro' && (
          <div
            style={{
              padding: 24,
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              textAlign: 'center',
            }}
          >
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.3 }}>
                Encontremos tu experiencia ideal
              </h2>
              <p style={{ fontSize: 15, opacity: 0.7, margin: 0, lineHeight: 1.5 }}>
                Tres preguntas simples para sugerirte lo que mejor se ajusta a lo que buscas hoy.
              </p>
            </div>

            <button
              onClick={() => {
                sessionStorage.setItem(SESSION_KEY, 'true')
                setState('q1')
              }}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 14,
                background: '#111',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Empezar
            </button>
          </div>
        )}

        {state === 'q1' && (
          <QuestionScreen
            index={0}
            onAnswer={value => {
              setAnswers({ engagement: value as Engagement })
              setState('q2')
            }}
          />
        )}

        {state === 'q2' && (
          <QuestionScreen
            index={1}
            engagement={answers.engagement}
            onAnswer={value => {
              setAnswers(prev => ({
                engagement: prev.engagement,
                calma_tipo:
                  prev.engagement === 'relajado'
                    ? (value as CalmaTipo)
                    : undefined,
                participacion_tipo:
                  prev.engagement === 'activo'
                    ? (value as ParticipacionTipo)
                    : undefined,
                sacudida_tipo:
                  prev.engagement === 'sacudido'
                    ? (value as SacudidaTipo)
                    : undefined,
              }))
              setState('q3')
            }}
          />
        )}

        {state === 'q3' && (
          <QuestionScreen
            index={2}
            engagement={answers.engagement}
            onAnswer={value => {
              if (!experiences.length) return

              const finalAnswers = {
                ...answers,
                resolucion: value as Resolucion,
              }

              const result = getTop3Experiences(
                experiences,
                finalAnswers
              )

              setTop3(result)
              setState('top3')
            }}
          />
        )}

        {state === 'top3' && (
          <Top3Screen
            items={top3}
            onSelect={exp => {
              setSelected(exp)
              setState('detail')
            }}
          />
        )}

        {state === 'detail' && selected && (
          <DetailScreen
            experience={selected}
            onBack={() => setState('top3')}
          />
        )}
      </div>
    </div>
  )
}
