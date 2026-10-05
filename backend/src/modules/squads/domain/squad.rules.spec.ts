import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  assertCanAddMember,
  assertValidMemberList,
  firstFreePosition,
  slotsInOrder,
} from './squad.rules.js';

function errorCode(work: () => unknown): unknown {
  try {
    work();
  } catch (error) {
    return (error as { getResponse(): { error: string } }).getResponse().error;
  }
  return undefined;
}

describe('assertCanAddMember', () => {
  it('allows a new character while there is room', () => {
    expect(() => assertCanAddMember([1, 2, 3, 4, 5], 6)).not.toThrow();
  });

  it('rejects a seventh member with SQUAD_FULL', () => {
    expect(() => assertCanAddMember([1, 2, 3, 4, 5, 6], 7)).toThrow(
      UnprocessableEntityException,
    );
    expect(errorCode(() => assertCanAddMember([1, 2, 3, 4, 5, 6], 7))).toBe(
      'SQUAD_FULL',
    );
  });

  it('rejects a character already in the squad', () => {
    expect(() => assertCanAddMember([1, 2], 2)).toThrow(ConflictException);
    expect(errorCode(() => assertCanAddMember([1, 2], 2))).toBe(
      'CHARACTER_ALREADY_IN_SQUAD',
    );
  });

  it('reports a duplicate before a full squad', () => {
    expect(errorCode(() => assertCanAddMember([1, 2, 3, 4, 5, 6], 3))).toBe(
      'CHARACTER_ALREADY_IN_SQUAD',
    );
  });
});

describe('assertValidMemberList', () => {
  it.each([[[]], [[1]], [[1, 2, 3, 4, 5, 6]]])('accepts %j', (ids) => {
    expect(() => assertValidMemberList(ids)).not.toThrow();
  });

  it('rejects more than six characters', () => {
    expect(errorCode(() => assertValidMemberList([1, 2, 3, 4, 5, 6, 7]))).toBe(
      'SQUAD_FULL',
    );
  });

  it('rejects a repeated character', () => {
    expect(errorCode(() => assertValidMemberList([1, 2, 1]))).toBe(
      'CHARACTER_ALREADY_IN_SQUAD',
    );
  });
});

describe('firstFreePosition', () => {
  it.each([
    [[], 1],
    [[1, 2, 3], 4],
    [[1, 3, 4], 2],
    [[2, 3, 4, 5, 6], 1],
  ])('with %j taken returns %i', (taken, expected) => {
    expect(firstFreePosition(taken)).toBe(expected);
  });

  it('throws SQUAD_FULL when every slot is taken', () => {
    expect(errorCode(() => firstFreePosition([1, 2, 3, 4, 5, 6]))).toBe(
      'SQUAD_FULL',
    );
  });
});

describe('slotsInOrder', () => {
  it('assigns positions in the given order', () => {
    expect(slotsInOrder([42, 7, 9])).toEqual([
      { characterId: 42, position: 1 },
      { characterId: 7, position: 2 },
      { characterId: 9, position: 3 },
    ]);
  });
});
