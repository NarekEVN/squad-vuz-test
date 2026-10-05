import { capitalize, formatAverage } from './format'

describe('formatAverage', () => {
  it.each([
    [null, '-'],
    [7, '7'],
    [6.333333, '6.33'],
    [5.8, '5.8'],
  ])('formats %p as %p', (value, expected) => {
    expect(formatAverage(value)).toBe(expected)
  })
})

describe('capitalize', () => {
  it('upper-cases the first letter only', () => {
    expect(capitalize('grapple')).toBe('Grapple')
    expect(capitalize('My Team')).toBe('My Team')
  })
})
