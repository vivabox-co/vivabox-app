"use client"

import { useState, useRef, useEffect } from "react"

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  body: React.ReactNode
  footer?: React.ReactNode
}

export default function BottomSheet({
  open,
  onClose,
  body,
  footer,
}: BottomSheetProps) {
  const MIN_HEIGHT = 55
  const MAX_HEIGHT = 80
  const DRAG_SPEED = 0.35
  // Au relâchement, on atterrit toujours sur MIN_HEIGHT ou MAX_HEIGHT (snap binaire),
  // jamais sur une hauteur intermédiaire arbitraire.
  const SNAP_MIDPOINT = (MIN_HEIGHT + MAX_HEIGHT) / 2
  // Pull-to-close : distance (px) à tirer sous MIN_HEIGHT pour fermer le drawer.
  const CLOSE_THRESHOLD = 90
  const CLOSE_MAX_OFFSET = 160
  const CLOSE_RESISTANCE = 0.6
  // Courbe/durée des transitions "relâchées" (snap-back et fermeture animée) :
  // decel proche de celle des sheets natifs iOS/Android (Google Maps...),
  // pas un ease-out générique.
  const TRANSITION_MS = 280
  const TRANSITION_EASING = "cubic-bezier(0.32, 0.72, 0, 1)"

  // `height` reste sémantiquement "portion visible depuis le bas de l'écran"
  // (55..80vh), exactement comme avant. Ce qui change : ça ne pilote plus
  // jamais la propriété CSS `height` (layout, coûteuse à animer) — seulement
  // un translateY, calculé à partir de cette valeur. Voir applyLiveStyles().
  const [height, setHeight] = useState(MIN_HEIGHT)
  const [dragOffset, setDragOffset] = useState(0)
  // Hauteur réelle mesurée du footer (bouton + safe-area), pour réserver la
  // place correspondante en bas du body scrollable — le footer n'est plus un
  // enfant flex du sheet (voir plus bas), donc plus rien ne pousse le body
  // au-dessus de lui automatiquement.
  const [footerHeight, setFooterHeight] = useState(0)

  // Miroirs synchrones du state : un mousemove attaché sur `window` (voir
  // plus bas) garde la closure de son render de départ et ne verrait jamais
  // les setState suivants. Les refs, elles, sont toujours à jour au moment
  // où on les lit, quel que soit le chemin d'événement (touch ou souris).
  const heightRef = useRef(MIN_HEIGHT)
  const dragOffsetRef = useRef(0)

  const lastY = useRef<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  // Après un vrai drag, un click "fantôme" peut suivre le relâchement et
  // atterrir sur l'overlay (qui n'est plus sous le curseur une fois la
  // sheet redimensionnée) → fermerait le drawer juste après l'avoir
  // redimensionné. Ce flag absorbe ce click.
  const suppressNextOverlayClick = useRef(false)
  // Évite un double-appel à closeSheet() (ex: drag qui dépasse le seuil
  // puis click fantôme sur l'overlay pendant l'animation de sortie).
  const isClosingRef = useRef(false)

  const TAP_THRESHOLD = 6
  const startY = useRef<number | null>(null)

  // Pendant un drag, on écrit `transform` directement sur le DOM (refs +
  // rAF) au lieu de passer par setState à chaque pixel : un setState par
  // touchmove force un re-render React à chaque frame. On ne resynchronise
  // le state React qu'une fois, au relâchement (endDrag).
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (open) {
      setHeight(MIN_HEIGHT)
      heightRef.current = MIN_HEIGHT
      setDragOffset(0)
      dragOffsetRef.current = 0
      isClosingRef.current = false
    }
  }, [open])

  useEffect(() => {
    if (!footer) {
      setFooterHeight(0)
      return
    }
    const el = footerRef.current
    if (!el) return
    // 🔥 PAS entries[0].contentRect.height : ça exclut le padding (16px +
    // l'encoche iPhone en bas), donc ça sous-évalue la vraie hauteur occupée
    // à l'écran → contenu du body caché sous la barre CTA. getBoundingClientRect
    // donne la hauteur réellement rendue (padding + bordure inclus).
    const observer = new ResizeObserver(() => {
      setFooterHeight(el.getBoundingClientRect().height)
    })
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!footer])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (!open) return null

  /* 🔥 Empêche le drag quand on touche un élément interactif */
  function isInteractive(target: HTMLElement) {
    return !!target.closest("button, a, svg, input, textarea, [role='button']")
  }

  // Comme updateDragOffset : on calcule à partir de la ref (toujours à jour,
  // synchrone) et pas du paramètre du functional setState (qui peut être
  // traité par React de façon différée si plusieurs setHeight s'enchaînent
  // dans le même batch — la ref, elle, ne dépend jamais de ce timing).
  function updateHeight(updater: (h: number) => number) {
    const next = updater(heightRef.current)
    heightRef.current = next
    setHeight(next)
  }

  function updateDragOffset(next: number) {
    dragOffsetRef.current = next
    setDragOffset(next)
  }

  /** heightRef/dragOffsetRef → DOM, en ne touchant jamais `height` (layout) :
   *  uniquement `transform`, donc 100% compositor (aucun reflow possible). */
  function applyLiveStyles() {
    const cardEl = sheetRef.current
    if (cardEl) {
      cardEl.style.transform = `translateX(-50%) translateY(calc(${MAX_HEIGHT - heightRef.current}vh + ${dragOffsetRef.current}px))`
    }
    // Le footer ne suit que le dragOffset (fermeture), jamais le palier de
    // hauteur : il doit rester immobile, ancré au vrai bas de l'écran,
    // pendant qu'on grandit/rétrécit la card au-dessus de lui.
    const footerEl = footerRef.current
    if (footerEl) {
      footerEl.style.transform = `translateX(-50%) translateY(${dragOffsetRef.current}px)`
    }
  }

  function scheduleStyleFlush() {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      applyLiveStyles()
    })
  }

  function cancelStyleFlush() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function resetDragState() {
    cancelStyleFlush()
    lastY.current = null
    startY.current = null
    isDragging.current = false
  }

  function beginDrag(target: HTMLElement, clientY: number) {
    if (isInteractive(target)) {
      resetDragState()
      return false
    }
    startY.current = clientY
    lastY.current = clientY
    isDragging.current = false
    return true
  }

  /** Cœur partagé touch + souris. `preventDefault` doit être un no-op côté souris. */
  function processMove(currentY: number, preventDefault: () => void) {
    if (lastY.current === null || startY.current === null) return

    const deltaTotal = Math.abs(currentY - startY.current)

    // 🔥 SI PAS ASSEZ DE MOUVEMENT = TAP → NE PAS PREVENTDEFAULT
    if (deltaTotal < TAP_THRESHOLD) return

    if (!isDragging.current) {
      isDragging.current = true
      // Désactive la transition CSS tout de suite, sans attendre un
      // re-render React, pour que les écritures DOM directes qui suivent
      // ne soient jamais animées pendant qu'on tient le doigt.
      if (sheetRef.current) sheetRef.current.style.transition = "none"
      if (footerRef.current) footerRef.current.style.transition = "none"
    }

    const delta = lastY.current - currentY
    const bodyEl = bodyRef.current
    if (!bodyEl) return

    const scrollingUp = delta > 0
    const scrollingDown = delta < 0
    const atTop = bodyEl.scrollTop <= 0
    const atMaxHeight = heightRef.current >= MAX_HEIGHT
    const atMinHeight = heightRef.current <= MIN_HEIGHT

    let moved = false

    if (scrollingUp) {
      if (dragOffsetRef.current > 0) {
        preventDefault()
        dragOffsetRef.current = Math.max(0, dragOffsetRef.current - Math.abs(delta))
        moved = true
      } else if (!atMaxHeight) {
        preventDefault()
        bodyEl.scrollTop = 0
        heightRef.current = Math.min(MAX_HEIGHT, heightRef.current + Math.abs(delta) * DRAG_SPEED)
        moved = true
      }
    } else if (scrollingDown && atTop) {
      if (!atMinHeight) {
        preventDefault()
        heightRef.current = Math.max(MIN_HEIGHT, heightRef.current - Math.abs(delta) * DRAG_SPEED)
        moved = true
      } else {
        // À hauteur mini et on continue de tirer vers le bas → pull-to-close
        preventDefault()
        dragOffsetRef.current = Math.min(
          CLOSE_MAX_OFFSET,
          dragOffsetRef.current + Math.abs(delta) * CLOSE_RESISTANCE
        )
        moved = true
      }
    }

    if (moved) scheduleStyleFlush()
    lastY.current = currentY
  }

  /** Anime la sortie (translateY jusqu'à hors-écran) puis démonte réellement
   *  le sheet une fois la transition terminée — évite le "saut brutal" où
   *  le sheet disparaissait instantanément dès que le parent recevait onClose(). */
  function closeSheet() {
    if (isClosingRef.current) return
    isClosingRef.current = true
    resetDragState()

    const offscreen = (typeof window !== "undefined" ? window.innerHeight : 800) + 100
    updateDragOffset(offscreen)

    setTimeout(() => {
      onClose()
    }, TRANSITION_MS)
  }

  function endDrag() {
    cancelStyleFlush()

    if (!isDragging.current) {
      // 👉 C'était un TAP → laisser le click se produire
      resetDragState()
      return
    }

    suppressNextOverlayClick.current = true
    setTimeout(() => {
      suppressNextOverlayClick.current = false
    }, 300)

    if (dragOffsetRef.current > CLOSE_THRESHOLD) {
      closeSheet()
      return
    }

    isDragging.current = false
    updateDragOffset(0)
    updateHeight(h => (h >= SNAP_MIDPOINT ? MAX_HEIGHT : MIN_HEIGHT))

    lastY.current = null
    startY.current = null
  }

  function handleOverlayClick() {
    if (suppressNextOverlayClick.current) {
      suppressNextOverlayClick.current = false
      return
    }
    closeSheet()
  }

  /* ================= TOUCH (mobile) =================
     Handlers dédiés (pas Pointer Events) : sur mobile, preventDefault()
     dans un pointermove n'empêche pas fiablement le scroll natif — il
     faut la propriété CSS touch-action pour ça. touchmove, lui, bloque
     bien le scroll natif via preventDefault(), comme avant. */
  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    beginDrag(e.target as HTMLElement, e.touches[0].clientY)
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    processMove(e.touches[0].clientY, () => e.preventDefault())
  }

  function handleTouchEnd() {
    endDrag()
  }

  /* ================= SOURIS (desktop) =================
     mousemove/mouseup sont attachés sur `window` pendant le drag : une
     souris, contrairement au doigt, peut sortir des limites de l'élément
     sans que l'événement s'arrête pour autant. */
  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    if (!beginDrag(e.target as HTMLElement, e.clientY)) return
    window.addEventListener("mousemove", handleWindowMouseMove)
    window.addEventListener("mouseup", handleWindowMouseUp)
  }

  function handleWindowMouseMove(e: MouseEvent) {
    processMove(e.clientY, () => e.preventDefault())
  }

  function handleWindowMouseUp() {
    window.removeEventListener("mousemove", handleWindowMouseMove)
    window.removeEventListener("mouseup", handleWindowMouseUp)
    endDrag()
  }

  const liveTransition = isDragging.current
    ? "none"
    : `transform ${TRANSITION_MS}ms ${TRANSITION_EASING}`

  return (
    <>
      <div
        className="sheet-overlay"
        onClick={handleOverlayClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
      />

      {/* Hauteur DOM CONSTANTE (MAX_HEIGHT) : seul le transform bouge pour
          représenter le palier courant + le drag de fermeture. Voir la note
          dans globals.css (.bottom-sheet) pour le pourquoi. */}
      <div
        ref={sheetRef}
        className="bottom-sheet"
        style={{
          height: `${MAX_HEIGHT}vh`,
          transform: `translateX(-50%) translateY(calc(${MAX_HEIGHT - height}vh + ${dragOffset}px))`,
          transition: liveTransition,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className="sheet-handle" />

        <div
          ref={bodyRef}
          className="sheet-body"
          style={{
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: footer ? `${footerHeight}px` : undefined,
          }}
        >
          {body}
        </div>
      </div>

      {/* Barre indépendante de la card (voir .sheet-footer-bar) : reste
          immobile au vrai bas de l'écran pendant les paliers, et ne suit
          que le dragOffset lors de la fermeture. */}
      {footer && (
        <div
          ref={footerRef}
          className="sheet-footer-bar"
          style={{
            transform: `translateX(-50%) translateY(${dragOffset}px)`,
            transition: liveTransition,
          }}
        >
          {footer}
        </div>
      )}
    </>
  )
}
