import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../../../../application/services/auth.service';
import type { LoginDto } from '../../../../application/dtos/auth.dto';
import { Public } from '../../../../../shared/infrastructure/guards/public.decorator';
import { JwtAuthGuard } from '../../../../../shared/infrastructure/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../../../domain/entities/authenticated-user.entity';

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: RequestWithUser) {
    return {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    };
  }
}