import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const exist = await this.usersService.findOne(username);
    if (exist) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const user = await this.usersService.findById(payload.sub);
      console.log(user, !user);
      if (!user) {
        throw new UnauthorizedException();
      }

      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException();
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        roles: user.roles,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '7d',
      });

      user.refreshToken = newRefreshToken;

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

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
