export class NetworkError extends Error {}

export class AuthError extends Error {}

export class ApiError extends Error {
  constructor(message, body) {
    super(message);
    this.body = body;
  }
}