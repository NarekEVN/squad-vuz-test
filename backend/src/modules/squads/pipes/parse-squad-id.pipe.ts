import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';
import { ErrorCode } from '../../../common/constants/error-codes.constants.js';

export class ParseSquadIdPipe extends ParseUUIDPipe {
  constructor() {
    super({
      exceptionFactory: () =>
        new BadRequestException('Squad id must be a UUID', {
          description: ErrorCode.InvalidId,
        }),
    });
  }
}
