// defined in: src/lib/error-handler.ts
export enum ErrorCode {
  // Common errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Authentication and authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',

  // Business logic errors
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',

  // Email service errors
  SMTP_CONNECTION_ERROR = 'SMTP_CONNECTION_ERROR',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  QUEUE_ERROR = 'QUEUE_ERROR',

  // File processing errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  CSV_PARSE_ERROR = 'CSV_PARSE_ERROR',
}

// application-specific error class
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, details);
  }
}

// Authentication error
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

// Authorization error
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, ErrorCode.FORBIDDEN, 403);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, ErrorCode.RECORD_NOT_FOUND, 404);
  }
}

// Duplicate record error
export class DuplicateError extends AppError {
  constructor(message: string = 'Record already exists') {
    super(message, ErrorCode.DUPLICATE_RECORD, 409);
  }
}

// Database error
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.DATABASE_ERROR, 500, true, details);
  }
}

// Email service errors
export class EmailServiceError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.EMAIL_SEND_FAILED, details?: any) {
    super(message, code, 500, true, details);
  }
}

// File processing errors
export class FileProcessingError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.INVALID_FILE_FORMAT, details?: any) {
    super(message, code, 400, true, details);
  }
}

// Error handling utility functions
export class ErrorHandler {
  /**
   * Handle Prisma errors
   */
  static handlePrismaError(error: any): AppError {
    if (error.code === 'P2002') {
      // Unique constraint violation
      const target = error.meta?.target || 'field';
      return new DuplicateError(`Duplicate ${target} value`);
    }
    
    if (error.code === 'P2025') {
      // Not found
      return new NotFoundError('Record not found');
    }
    
    if (error.code === 'P2003') {
      // Foreign key constraint violation
      return new ValidationError('Invalid reference to related record');
    }
    
    return new DatabaseError(error.message, { code: error.code });
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(errors: Record<string, string[]>): ValidationError {
    const messages = Object.entries(errors)
      .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
      .join('; ');
    
    return new ValidationError(`Validation failed: ${messages}`, errors);
  }

  /**
   * Handle email sending errors
   */
  static handleEmailError(error: any): EmailServiceError {
    if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
      return new EmailServiceError(
        'Failed to connect to email server',
        ErrorCode.SMTP_CONNECTION_ERROR,
        error
      );
    }
    
    if (error.responseCode >= 500) {
      return new EmailServiceError(
        'Email server error',
        ErrorCode.EMAIL_SEND_FAILED,
        error
      );
    }
    
    return new EmailServiceError(error.message, ErrorCode.EMAIL_SEND_FAILED, error);
  }

  /**
   * Handle file errors
   */
  static handleFileError(error: any, maxSize?: number): FileProcessingError {
    if (error.code === 'LIMIT_FILE_SIZE' || (maxSize && error.size > maxSize)) {
      return new FileProcessingError(
        `File too large. Maximum size is ${maxSize ? Math.round(maxSize / 1024 / 1024) : 100}MB`,
        ErrorCode.FILE_TOO_LARGE
      );
    }
    
    if (error.code === 'INVALID_FILE_TYPE') {
      return new FileProcessingError(
        'Invalid file format',
        ErrorCode.INVALID_FILE_FORMAT
      );
    }
    
    return new FileProcessingError(error.message);
  }

  /**
   * Format error response
   */
  static formatErrorResponse(error: AppError | Error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }

    // For non-App errors, do not expose details
    return {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: ErrorCode.UNKNOWN_ERROR,
      },
    };
  }

  /**
   * Log errors for monitoring
   */
  static logError(error: Error, context?: Record<string, any>) {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error instanceof AppError) {
      errorInfo['code'] = error.code;
      errorInfo['statusCode'] = error.statusCode;
      errorInfo['isOperational'] = error.isOperational;
      errorInfo['details'] = error.details;
    }

    console.error('Application Error:', errorInfo);

    // In production, this should be sent to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service, e.g., Sentry, DataDog, etc.
      // sendToMonitoringService(errorInfo);
    }
  }
}

// Async error handling decorator
export function handleAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.logError(error as Error, { args });
      throw error;
    }
  };
}

// Retry mechanism
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError ?? new Error('Unknown error');
      }

      // Exponential backoff delay
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  throw new Error('Unknown error');
}

// Timeout handling
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}