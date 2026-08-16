"use client"

import { useEffect, useState } from "react"

// Keeps returning false until both `ready` is true and `minMs` has elapsed
// since mount, so a loader already on screen never gets swapped out mid-animation.
export function useMinDisplayTime(ready: boolean, minMs: number) {
  const [minElapsed, setMinElapsed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), minMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ready && minElapsed
}
