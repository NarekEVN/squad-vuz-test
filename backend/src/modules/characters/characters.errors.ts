import { NotFoundException } from '@nestjs/common';
import { ErrorCode } from '../../common/constants/error-codes.constants.js';

export function characterNotFound(id: number): NotFoundException {
  return new NotFoundException(`Character ${id} does not exist`, {
    description: ErrorCode.CharacterNotFound,
  });
}
