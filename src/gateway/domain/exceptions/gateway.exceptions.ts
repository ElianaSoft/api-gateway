// src/gateway/domain/exceptions/gateway.exceptions.ts

export class GatewayException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'GATEWAY_ERROR',
  ) {
    super(message);
    this.name = 'GatewayException';
  }
}

export class ServiceUnavailableException extends GatewayException {
  constructor(serviceName: string) {
    super(
      `Service ${serviceName} is currently unavailable`,
      503,
      'SERVICE_UNAVAILABLE',
    );
    this.name = 'ServiceUnavailableException';
  }
}

export class UnauthorizedException extends GatewayException {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends GatewayException {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenException';
  }
}

export class ServiceTimeoutException extends GatewayException {
  constructor(serviceName: string) {
    super(
      `Request to ${serviceName} timed out`,
      504,
      'SERVICE_TIMEOUT',
    );
    this.name = 'ServiceTimeoutException';
  }
}