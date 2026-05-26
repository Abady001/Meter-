import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorEnvelope {
  code: string;
  message: string;
  details?: unknown;
  correlationId: string;
}

interface HeaderBag {
  [key: string]: string | string[] | undefined;
}

export function getCorrelationId(headers: HeaderBag): string {
  const header = headers['x-correlation-id'] || headers['x-request-id'];
  if (header && typeof header === 'string') return header;
  if (Array.isArray(header) && header.length > 0) return header[0];
  return crypto.randomUUID();
}

export function toErrorEnvelope(
  exception: unknown,
  correlationId: string,
): ErrorEnvelope {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    const message =
      typeof response === 'string'
        ? response
        : typeof response === 'object' && response !== null
          ? (response as Record<string, unknown>).message ?? exception.message
          : exception.message;
    return {
      code: exception.constructor.name,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      details: typeof response === 'object' && response !== null ? response : undefined,
      correlationId,
    };
  }

  if (exception instanceof Error) {
    return {
      code: 'InternalServerError',
      message: 'An unexpected error occurred',
      correlationId,
    };
  }

  return {
    code: 'InternalServerError',
    message: 'An unexpected error occurred',
    correlationId,
  };
}

export function statusFromException(exception: unknown): number {
  if (exception instanceof HttpException) return exception.getStatus();
  return HttpStatus.INTERNAL_SERVER_ERROR;
}
