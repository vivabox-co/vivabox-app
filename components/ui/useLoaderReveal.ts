"use client"

import { useEffect, useState } from "react"

// One full lap of the CSS animation (see .vb-loader-fill in globals.css) —
// enforced as a plain timer. An earlier version of this hook polled the
// fills' real computed opacity via requestAnimationFrame instead of using a
// flat delay, to make sure the reveal never landed mid-fade. In practice
// that made the reveal UNRELIABLE rather than more precise: rAF is throttled
// or fully suspended on a tab that isn't the frontmost/focused one (common
// during remote/automated testing, and plausibly for real users too —
// switching apps, a locked screen, a backgrounded browser), so the "wait for
// the colors" check could stall indefinitely with no way to tell it had
// happened. A plain timer has no such failure mode: setTimeout keeps firing
// regardless of tab focus, so the minimum lap is a genuine guarantee.
const MIN_DISPLAY_MS = 1300

// Belt-and-suspenders: if `ready` never arrives, don't leave the loader
// stuck on screen forever.
const SAFETY_TIMEOUT_MS = 5000

export function useLoaderReveal(ready: boolean) {
  const [minLapDone, setMinLapDone] = useState(false)
  const [safetyDone, setSafetyDone] = useState(false)

  // RouteLoaderOverlay can re-show this SAME Overlay instance (same
  // pathname key) via pendingTransition instead of remounting it — a
  // bottom-nav click re-reveals the current page's already-resolved overlay
  // the instant it's clicked, before the destination pathname has landed.
  // Remounting Overlay for this was tried instead (folding a transition
  // counter into its key) and reverted: it raced against the reveal and
  // caused a visible flash back to the old page (see the comment in
  // RouteLoaderOverlay). So this hook has to detect the new cycle itself —
  // `ready` going true -> false is exactly that signal — and bump `cycle`
  // to restart the timers below without needing a fresh mount.
  const [cycle, setCycle] = useState(0)
  const [prevReady, setPrevReady] = useState(ready)
  if (ready !== prevReady) {
    setPrevReady(ready)
    if (prevReady && !ready) {
      setMinLapDone(false)
      setSafetyDone(false)
      setCycle(c => c + 1)
    }
  }

  useEffect(() => {
    const minLapTimer = setTimeout(() => setMinLapDone(true), MIN_DISPLAY_MS)
    const safetyTimer = setTimeout(() => setSafetyDone(true), SAFETY_TIMEOUT_MS)
    return () => {
      clearTimeout(minLapTimer)
      clearTimeout(safetyTimer)
    }
  }, [cycle])

  return (minLapDone && ready) || safetyDone
}
