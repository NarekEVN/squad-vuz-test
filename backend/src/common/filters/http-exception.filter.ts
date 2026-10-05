import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Response } from 'express';
import { ERROR_CODE_PATTERN } from '../constants/error-codes.constants.js';
import { type ErrorResponseDto } from '../dto/error-response.dto.js';

function codeForStatus(status: number): string {
  const name = (HttpStatus as unknown as Record<number, string | undefined>)[
    status
  ];
  return name ?? 'ERROR';
}

function errorCode(candidate: unknown, status: number): string {
  return typeof candidate === 'string' && ERROR_CODE_PATTERN.test(candidate)
    ? candidate
    : codeForStatus(status);
}

export function toErrorBody(exception: unknown): ErrorResponseDto {
  if (!(exception instanceof HttpException)) {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    };
  }

  const statusCode = exception.getStatus();
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return { statusCode, error: codeForStatus(statusCode), message: response };
  }

  const body = response as Record<string, unknown>;
  const error = errorCode(body.error, statusCode);

  if (!('message' in body)) {
    return { statusCode, error, message: exception.message, details: body };
  }
  if (Array.isArray(body.message)) {
    return {
      statusCode,
      error,
      message: exception.message,
      details: body.message,
    };
  }
  return {
    statusCode,
    error,
    message: exception.message,
    ...(body.details === undefined ? {} : { details: body.details }),
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const body = toErrorBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(body.statusCode)
      .json(body);
  }
}
