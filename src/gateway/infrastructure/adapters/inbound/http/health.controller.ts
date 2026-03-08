import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from '../../../../../shared/infrastructure/guards/public.decorator';
import {
  GATEWAY_USE_CASES,
  type IGatewayUseCases,
} from '../../../../domain/ports/inbound/gateway.use-cases';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(GATEWAY_USE_CASES)
    private readonly gatewayUseCases: IGatewayUseCases,
  ) {}

  @Public()
  @Get()
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
    };
  }

  @Public()
  @Get('services')
  async servicesHealth() {
    const services = await this.gatewayUseCases.checkServicesHealth();
    const allHealthy = Object.values(services).every((status) => status);

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    };
  }
}