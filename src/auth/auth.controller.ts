import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() body) {
    return this.authService.register(body.username, body.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.login(signInDto.username, signInDto.password);
  }

  @Get()
  findAll() {
    return ['This done but empty'];
  }

  @Post('refresh')
  @Public()
  refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refresh(body.refresh_token);
  }

  @Post('logout')
  logout(@CurrentUser() user: any) {
    return this.authService.logout(user);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body('username') username: string) {
    return this.authService.forgotPassword(username);
  }

  @Public()
  @Post('reset-password')
  resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}
