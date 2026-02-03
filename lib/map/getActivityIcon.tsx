const iconBasePath = "/icons"

export const defaultActivityIcon = `${iconBasePath}/dining.svg`

export function getActivityIcon(activityKey: string): string {
  if (!activityKey) return defaultActivityIcon

  const key = activityKey.toLowerCase().trim()

  return `${iconBasePath}/${key}.svg`
}
