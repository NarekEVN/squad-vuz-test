import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import {
  type AuthenticatedRequest,
  type AuthUser,
} from '../types/request.types.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
