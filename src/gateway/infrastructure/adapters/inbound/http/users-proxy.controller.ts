import {
  Controller,
  All,
  Req,
  Res,
  Inject,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  GATEWAY_USE_CASES,
  type IGatewayUseCases,
} from '../../../../domain/ports/inbound/gateway.use-cases';
import { JwtAuthGuard } from '../../../../../shared/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../shared/infrastructure/guards/roles.guard';
import { Roles } from '../../../../../shared/infrastructure/guards/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersProxyController {
  constructor(
    @Inject(GATEWAY_USE_CASES)
    private readonly gatewayUseCases: IGatewayUseCases,
  ) {}

  @All('*')
  @Roles('admin')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url;
    const response = await this.gatewayUseCases.proxyToUsers({
      method: req.method,
      path: `/api${path}`,
      body: req.body,
      headers: this.extractHeaders(req),
      query: req.query as Record<string, string>,
    });

    res.status(response.status).json(response.data);
  }

  private extractHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {};
    const allowedHeaders = ['content-type', 'accept', 'authorization'];

    allowedHeaders.forEach((header) => {
      const value = req.get(header);
      if (value) {
        headers[header] = value;
      }
    });

    return headers;
  }
}