import { type SquadActivityEvent } from '../../../entities/squad/model/squad.types'
import { describeActivity } from './describe-activity'

function event(overrides: Partial<SquadActivityEvent>): SquadActivityEvent {
  return {
    id: '1',
    type: 'created',
    squadId: 'squad',
    squadName: 'Alpha',
    character: null,
    occurredAt: '2026-10-05T10:00:00.000Z',
    ...overrides,
  }
}

describe('describeActivity', () => {
  it.each([
    [event({ type: 'created' }), 'Created "Alpha"'],
    [event({ type: 'updated', squadName: 'Beta' }), 'Updated "Beta"'],
    [event({ type: 'deleted' }), 'Deleted "Alpha"'],
    [
      event({ type: 'member-added', character: { id: 1, name: 'Ryu', thumbnail: '' } }),
      'Added Ryu',
    ],
    [
      event({ type: 'member-removed', character: { id: 1, name: 'Ken', thumbnail: '' } }),
      'Removed Ken',
    ],
  ])('describes %#', (input, expected) => {
    expect(describeActivity(input)).toBe(expected)
  })
})
