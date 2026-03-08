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

interface UserRequest extends Request {
  user?: { id: number; email: string; role: string };
}

@Controller('production')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductionProxyController {
  constructor(
    @Inject(GATEWAY_USE_CASES)
    private readonly gatewayUseCases: IGatewayUseCases,
  ) {}

  @All('*')
  @Roles('admin')
  async proxy(@Req() req: UserRequest, @Res() res: Response) {
    const path = req.url;
    const response = await this.gatewayUseCases.proxyToProduction({
      method: req.method,
      path: `/api${path}`,
      body: req.body,
      headers: this.extractHeaders(req),
      query: req.query as Record<string, string>,
    });

    res.status(response.status).json(response.data);
  }

  private extractHeaders(req: UserRequest): Record<string, string> {
    const headers: Record<string, string> = {};
    const allowedHeaders = ['content-type', 'accept', 'authorization'];

    allowedHeaders.forEach((header) => {
      const value = req.get(header);
      if (value) {
        headers[header] = value;
      }
    });

    if (req.user) {
      headers['x-user-id'] = String(req.user.id);
      headers['x-user-email'] = req.user.email;
      headers['x-user-role'] = req.user.role;
    }

    return headers;
  }
}