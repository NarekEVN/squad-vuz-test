export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function formatAverage(value: number | null): string {
  return value === null ? '-' : String(Math.round(value * 100) / 100)
}
