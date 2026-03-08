import { Injectable, Inject } from '@nestjs/common';
import type { IGatewayUseCases } from '../../domain/ports/inbound/gateway.use-cases';
import {
  HTTP_PROXY_PORT,
  type IHttpProxyPort,
  type ProxyRequest,
  type ProxyResponse,
} from '../../domain/ports/outbound/http-proxy.port';

@Injectable()
export class GatewayService implements IGatewayUseCases {
  constructor(
    @Inject(HTTP_PROXY_PORT)
    private readonly httpProxy: IHttpProxyPort,
  ) {}

  async proxyToUsers(request: ProxyRequest): Promise<ProxyResponse> {
    return this.httpProxy.forward('users', request);
  }

  async proxyToOrders(request: ProxyRequest): Promise<ProxyResponse> {
    return this.httpProxy.forward('orders', request);
  }

  async proxyToProduction(request: ProxyRequest): Promise<ProxyResponse> {
    return this.httpProxy.forward('production', request);
  }

  async checkServicesHealth(): Promise<Record<string, boolean>> {
    const services = ['users', 'orders', 'production'];
    const healthChecks = await Promise.all(
      services.map(async (service) => ({
        service,
        healthy: await this.httpProxy.healthCheck(service),
      })),
    );

    return healthChecks.reduce(
      (acc, { service, healthy }) => {
        acc[service] = healthy;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }
}