import { Experience } from "@/lib/data/types"

export function buildAmbianceFilters(experiences: Experience[]): string[] {
  const set = new Set<string>()
  experiences.forEach(exp => exp.ambiance?.forEach(a => set.add(a)))
  return Array.from(set).sort()
}
