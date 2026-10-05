import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode } from '../../common/constants/error-codes.constants.js';
import { BEARER_PREFIX } from '../../common/constants/http.constants.js';
import { IS_PUBLIC_KEY } from '../../common/constants/metadata.constants.js';
import { type AuthenticatedRequest } from '../../common/types/request.types.js';
import { INVALID_TOKEN_MESSAGE } from './auth.constants.js';
import { AuthService } from './auth.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const user = header?.startsWith(BEARER_PREFIX)
      ? await this.authService.verifyAccessToken(
          header.slice(BEARER_PREFIX.length),
        )
      : undefined;
    if (!user) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE, {
        description: ErrorCode.Unauthorized,
      });
    }

    request.user = user;
    return true;
  }
}
