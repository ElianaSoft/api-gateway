import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  HTTP_PROXY_PORT,
  type IHttpProxyPort,
} from '../../domain/ports/outbound/http-proxy.port';
import { UnauthorizedException } from '../../domain/exceptions/gateway.exceptions';
import type { LoginDto, TokenResponseDto } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(HTTP_PROXY_PORT)
    private readonly httpProxy: IHttpProxyPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const response = await this.httpProxy.forward('users', {
      method: 'POST',
      path: '/api/auth/validate',
      body: dto,
    });

    if (response.status !== 200) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const user = response.data as {
      id: number;
      email: string;
      nombre: string;
      rol: string;
    };

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.rol,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>('config.jwt.expiresIn') || '24h';

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user,
    };
  }

  async validateToken(token: string): Promise<{ id: number; email: string; role: string }> {
    try {
      const payload = this.jwtService.verify(token);
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}