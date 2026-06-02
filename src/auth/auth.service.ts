import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { randomBytes } from 'crypto';
import { TokenUtil } from './utils/token.util';
import { PasswordUtil } from './utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenUtil: TokenUtil,
  ) {}

  async register(username: string, password: string) {
    const exist = await this.usersService.findOne(username);
    if (exist) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await PasswordUtil.hash(password);

    return this.usersService.create({
      username,
      password: hashedPassword,
      roles: ['admin'],
    });
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await PasswordUtil.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
    };

    const accessToken = await this.tokenUtil.generateAccessToken(payload);

    const refreshToken = await this.tokenUtil.generateRefreshToken(payload);

    const hashedRefreshToken = await PasswordUtil.hash(refreshToken);

    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.tokenUtil.verifyAsyncToken(refreshToken);

      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException();
      }

      const isValid = await PasswordUtil.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isValid) {
        throw new UnauthorizedException();
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        roles: user.roles,
      };

      const accessToken = await this.tokenUtil.generateAccessToken(newPayload);

      const newRefreshToken =
        await this.tokenUtil.generateRefreshToken(newPayload);

      const hashed = await PasswordUtil.hash(refreshToken);

      await this.usersService.updateRefreshToken(user.id, hashed);

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);

    return {
      message: 'Logged out',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);

    if (
      !user ||
      user.resetToken !== token ||
      user.resetTokenExpires < new Date()
    ) {
      throw new UnauthorizedException();
    }

    const hashedPassword = await PasswordUtil.hash(newPassword);

    await this.usersService.updatePasswordAndClearReset(
      user.id,
      hashedPassword,
    );

    return { message: 'Password updated' };
  }

  async forgotPassword(username: string) {
    const user = await this.usersService.findOne(username);

    if (!user) {
      return { message: 'If user exists, reset link sent' };
    }

    const token = randomBytes(32).toString('hex');

    await this.usersService.updateResetToken(
      user.id,
      token,
      new Date(Date.now() + 15 * 60 * 1000),
    );

    return { reset_token: token };
  }
}
