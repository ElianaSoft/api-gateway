import type { ProxyRequest, ProxyResponse } from '../outbound/http-proxy.port';

export const GATEWAY_USE_CASES = Symbol('GATEWAY_USE_CASES');

export interface IGatewayUseCases {
  // Proxy requests to microservices
  proxyToUsers(request: ProxyRequest): Promise<ProxyResponse>;
  proxyToOrders(request: ProxyRequest): Promise<ProxyResponse>;
  proxyToProduction(request: ProxyRequest): Promise<ProxyResponse>;

  // Health checks
  checkServicesHealth(): Promise<Record<string, boolean>>;
}