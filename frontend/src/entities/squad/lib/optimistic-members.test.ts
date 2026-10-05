import { type Character } from '../../character/model/character.types'
import { type Squad } from '../model/squad.types'
import { withMemberAdded, withMemberRemoved } from './optimistic-members'

function character(id: number): Character {
  return {
    id,
    name: `Character ${id}`,
    quote: null,
    image: '',
    thumbnail: '',
    universe: 'Test',
    tags: [],
    abilities: [],
  }
}

function squad(memberSlots: [number, number][]): Squad {
  return {
    id: 'squad',
    name: 'Squad',
    members: memberSlots.map(([position, id]) => ({ position, character: character(id) })),
    stats: { memberCount: memberSlots.length, overallAverage: null, abilities: [] },
    createdAt: '',
    updatedAt: '',
  }
}

describe('withMemberAdded', () => {
  it('fills the first free slot and keeps members ordered by position', () => {
    const result = withMemberAdded(
      squad([
        [1, 10],
        [3, 30],
      ]),
      character(20),
    )

    expect(result.members.map((m) => [m.position, m.character.id])).toEqual([
      [1, 10],
      [2, 20],
      [3, 30],
    ])
  })

  it('leaves a full squad unchanged so the server error can roll back cleanly', () => {
    const full = squad([
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 6],
    ])

    expect(withMemberAdded(full, character(7))).toBe(full)
  })

  it('does not add a character twice', () => {
    const current = squad([[1, 10]])

    expect(withMemberAdded(current, character(10))).toBe(current)
  })
})

describe('withMemberRemoved', () => {
  it('removes the character and keeps the other slots', () => {
    const result = withMemberRemoved(
      squad([
        [1, 10],
        [2, 20],
        [3, 30],
      ]),
      20,
    )

    expect(result.members.map((m) => [m.position, m.character.id])).toEqual([
      [1, 10],
      [3, 30],
    ])
  })
})
