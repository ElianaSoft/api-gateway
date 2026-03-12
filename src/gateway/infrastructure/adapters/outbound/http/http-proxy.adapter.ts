import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  IHttpProxyPort,
  ProxyRequest,
  ProxyResponse,
} from '../../../../domain/ports/outbound/http-proxy.port';
import {
  ServiceUnavailableException,
  ServiceTimeoutException,
} from '../../../../domain/exceptions/gateway.exceptions';

@Injectable()
export class HttpProxyAdapter implements IHttpProxyPort {
  private readonly logger = new Logger(HttpProxyAdapter.name);
  private readonly clients: Map<string, AxiosInstance> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeClients();
  }

  private initializeClients(): void {
    const services = this.configService.get<Record<string, string>>('config.services');
    const apiKey = this.configService.get<string>('config.internalApiKey');

    if (services) {
      Object.entries(services).forEach(([name, url]) => {
        this.clients.set(
          name,
          axios.create({
            baseURL: url,
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey || '',
            },
          }),
        );
        this.logger.log(`Initialized HTTP client for service: ${name} -> ${url}`);
      });
    }
  }

  async forward(serviceName: string, request: ProxyRequest): Promise<ProxyResponse> {
    const client = this.clients.get(serviceName);

    if (!client) {
      this.logger.error(`No client configured for service: ${serviceName}`);
      throw new ServiceUnavailableException(serviceName);
    }

    try {
      this.logger.debug(
        `Forwarding ${request.method} ${request.path} to ${serviceName}`,
      );

      const response = await client.request({
        method: request.method,
        url: request.path,
        data: request.body,
        headers: request.headers,
        params: request.query,
      });

      return {
        status: response.status,
        data: response.data,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      return this.handleError(serviceName, error as AxiosError);
    }
  }

  async healthCheck(serviceName: string): Promise<boolean> {
    const client = this.clients.get(serviceName);

    if (!client) {
      return false;
    }

    try {
      const response = await client.get('/api/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      this.logger.warn(`Health check failed for service: ${serviceName}`);
      return false;
    }
  }

  private handleError(serviceName: string, error: AxiosError): ProxyResponse {
    if (error.code === 'ECONNABORTED') {
      this.logger.error(`Timeout calling ${serviceName}: ${error.message}`);
      throw new ServiceTimeoutException(serviceName);
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      this.logger.error(`Cannot connect to ${serviceName}: ${error.message}`);
      throw new ServiceUnavailableException(serviceName);
    }

    if (error.response) {
      this.logger.warn(
        `Service ${serviceName} returned error: ${error.response.status}`,
      );
      return {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers as Record<string, string>,
      };
    }

    this.logger.error(`Unexpected error calling ${serviceName}: ${error.message}`);
    throw new ServiceUnavailableException(serviceName);
  }
}