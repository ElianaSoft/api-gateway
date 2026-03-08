export const HTTP_PROXY_PORT = Symbol('HTTP_PROXY_PORT');export interface ProxyRequest {
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export interface ProxyResponse {
  status: number;
  data: unknown;
  headers?: Record<string, string>;
}

export interface IHttpProxyPort {
  forward(serviceName: string, request: ProxyRequest): Promise<ProxyResponse>;
  healthCheck(serviceName: string): Promise<boolean>;
}