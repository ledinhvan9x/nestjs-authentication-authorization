import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthGuard } from '@nestjs/passport';

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
  signIn(@Req() req: any, @Body() signInDto: Record<string, any>) {
    return this.authService.login(req, signInDto.username, signInDto.password);
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

  @Patch('change-password')
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, dto);
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

  @Post('logout-all')
  logoutAll(@CurrentUser() user: any) {
    return this.authService.logoutAll(user);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirect to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req) {
    return this.authService.googleLogin(req.user, req);
  }
}
