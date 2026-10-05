export function readStorage<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? undefined : (JSON.parse(raw) as T)
  } catch {
    return undefined
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    if (value === undefined || value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch {
    return
  }
}
