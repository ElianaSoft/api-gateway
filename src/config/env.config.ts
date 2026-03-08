import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  services: {
    users: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
    orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:3002',
    production: process.env.PRODUCTION_SERVICE_URL || 'http://localhost:3003',
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
}));