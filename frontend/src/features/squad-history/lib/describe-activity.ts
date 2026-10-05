import { type SquadActivityEvent } from '../../../entities/squad/model/squad.types'

export function describeActivity(event: SquadActivityEvent): string {
  const character = event.character?.name ?? 'a character'
  switch (event.type) {
    case 'created':
      return `Created "${event.squadName}"`
    case 'updated':
      return `Updated "${event.squadName}"`
    case 'deleted':
      return `Deleted "${event.squadName}"`
    case 'member-added':
      return `Added ${character}`
    case 'member-removed':
      return `Removed ${character}`
  }
}

export function formatActivityTime(occurredAt: string, now: Date = new Date()): string {
  const date = new Date(occurredAt)
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay
    ? date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
}
