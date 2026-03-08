import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Services
import { GatewayService } from './application/services/gateway.service';
import { AuthService } from './application/services/auth.service';

// Controllers
import { AuthController } from './infrastructure/adapters/inbound/http/auth.controller';
import { HealthController } from './infrastructure/adapters/inbound/http/health.controller';
import { UsersProxyController } from './infrastructure/adapters/inbound/http/users-proxy.controller';
import { OrdersProxyController } from './infrastructure/adapters/inbound/http/orders-proxy.controller';
import { ProductionProxyController } from './infrastructure/adapters/inbound/http/production-proxy.controller';

// Adapters
import { HttpProxyAdapter } from './infrastructure/adapters/outbound/http/http-proxy.adapter';

// Strategies
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Ports
import { GATEWAY_USE_CASES } from './domain/ports/inbound/gateway.use-cases';
import { HTTP_PROXY_PORT } from './domain/ports/outbound/http-proxy.port';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret') || 'default-secret',
        signOptions: {
          expiresIn: 86400,
        },
      }),
    }),
  ],
  controllers: [
    AuthController,
    HealthController,
    UsersProxyController,
    OrdersProxyController,
    ProductionProxyController,
  ],
  providers: [
    // Strategies
    JwtStrategy,

    // Outbound adapters
    {
      provide: HTTP_PROXY_PORT,
      useClass: HttpProxyAdapter,
    },

    // Application services
    {
      provide: GATEWAY_USE_CASES,
      useClass: GatewayService,
    },
    AuthService,
  ],
  exports: [AuthService],
})
export class GatewayModule {}