import { ErrorCode, AppError } from '@/types';

export class AppBaseError extends Error implements AppError {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: ErrorCode, status: number, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RateLimitError extends AppBaseError {
  resetTime: Date;
  remaining: number;
  total: number;

  constructor(
    service: string,
    resetTime: Date,
    remaining: number,
    total: number
  ) {
    super(
      `Rate limit exceeded for ${service}. Reset at ${resetTime.toISOString()}`,
      ErrorCode.RATE_LIMIT,
      429,
      { service, resetTime, remaining, total }
    );
    this.resetTime = resetTime;
    this.remaining = remaining;
    this.total = total;
  }
}

export class InvalidInputError extends AppBaseError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.INVALID_INPUT, 400, details);
  }
}

export class ApiError extends AppBaseError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.API_ERROR, 500, details);
  }
}

export class CacheError extends AppBaseError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.CACHE_ERROR, 500, details);
  }
}
