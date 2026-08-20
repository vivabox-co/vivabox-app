"use client"

import { useEffect, useRef, useState } from "react"

// Waits until BOTH `ready` is true AND the loader's own CSS animation is
// actually showing all 4 brand colors at full opacity right now — checked
// against the real computed style every animation frame, not guessed from a
// fixed millisecond delay. A blind timer can't account for the small,
// variable gap between when React's effect runs and when the CSS animation
// truly starts painting, which was letting the reveal land mid-fade-in and
// cut a color short. This also naturally satisfies "wait for the next full
// lap if not ready yet" — since the check re-runs every frame, it just keeps
// missing the plateau until `ready` catches one.
//
// SAFETY_TIMEOUT_MS is a belt-and-suspenders fallback: if the opacity check
// never once passes (e.g. the DOM/CSS classes ever drift from what this
// expects), don't leave the loader stuck on screen forever once the page is
// actually ready.
const SAFETY_TIMEOUT_MS = 5000

// One full lap of the CSS animation (see .vb-loader-fill in globals.css).
// Enforced as a floor so the brand loader always plays out its whole
// build-up-to-all-4-colors cycle, even when the page turns out to be ready
// almost instantly — otherwise a fast load could reveal mid-animation.
const MIN_DISPLAY_MS = 1300

export function useLoaderReveal(ready: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  const [done, setDone] = useState(false)
  const readyRef = useRef(ready)
  readyRef.current = ready

  useEffect(() => {
    let rafId: number
    let cancelled = false
    const startedAt = performance.now()

    function allColorsFullyVisible() {
      const el = containerRef.current
      if (!el) return false
      const fills = el.querySelectorAll<HTMLElement>(".vb-loader-fill")
      if (fills.length === 0) return false
      return Array.from(fills).every(
        (fill) => parseFloat(getComputedStyle(fill).opacity) >= 0.99
      )
    }

    function tick() {
      if (cancelled) return
      const elapsed = performance.now() - startedAt
      if (!readyRef.current || elapsed < MIN_DISPLAY_MS) {
        rafId = requestAnimationFrame(tick)
        return
      }
      if (allColorsFullyVisible() || elapsed > SAFETY_TIMEOUT_MS) {
        setDone(true)
        return
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef])

  return done
}
