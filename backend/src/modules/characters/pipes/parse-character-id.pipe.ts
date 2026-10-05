import { BadRequestException, ParseIntPipe } from '@nestjs/common';
import { ErrorCode } from '../../../common/constants/error-codes.constants.js';

export class ParseCharacterIdPipe extends ParseIntPipe {
  constructor() {
    super({
      exceptionFactory: () =>
        new BadRequestException('Character id must be an integer', {
          description: ErrorCode.InvalidId,
        }),
    });
  }
}
