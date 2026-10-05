import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ErrorCode } from '../../../common/constants/error-codes.constants.js';
import { SQUAD_MAX_MEMBERS } from '../../../database/database.constants.js';
import { MAX_SQUADS_PER_USER } from '../squads.constants.js';

export function squadNotFound(): NotFoundException {
  return new NotFoundException('Squad not found', {
    description: ErrorCode.SquadNotFound,
  });
}

export function squadFull(): UnprocessableEntityException {
  return new UnprocessableEntityException(
    `A squad cannot have more than ${SQUAD_MAX_MEMBERS} characters`,
    { description: ErrorCode.SquadFull },
  );
}

export function characterAlreadyInSquad(
  characterId: number,
): ConflictException {
  return new ConflictException(
    `Character ${characterId} is already in this squad`,
    { description: ErrorCode.CharacterAlreadyInSquad },
  );
}

export function characterNotInSquad(characterId: number): NotFoundException {
  return new NotFoundException(
    `Character ${characterId} is not in this squad`,
    {
      description: ErrorCode.CharacterNotInSquad,
    },
  );
}

export function unknownCharacters(
  characterIds: number[],
): UnprocessableEntityException {
  return new UnprocessableEntityException({
    error: ErrorCode.UnknownCharacters,
    message: `These character ids do not exist: ${characterIds.join(', ')}`,
    details: { characterIds },
  });
}

export function squadNameTaken(): ConflictException {
  return new ConflictException('You already have a squad with this name', {
    description: ErrorCode.SquadNameTaken,
  });
}

export function squadLimitReached(): UnprocessableEntityException {
  return new UnprocessableEntityException(
    `You can have at most ${MAX_SQUADS_PER_USER} squads`,
    { description: ErrorCode.SquadLimitReached },
  );
}
