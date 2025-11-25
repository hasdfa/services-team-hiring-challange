/**
 * Custom error class for API responses
 */
export class ResponseError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ResponseError';
  }

  toJSON() {
    return {
      ok: false,
      message: this.message,
      statusCode: this.statusCode,
      data: this.data,
    };
  }
}
