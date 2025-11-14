export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class PermissionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 403
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}