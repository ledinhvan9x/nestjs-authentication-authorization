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
import { SessionsService } from 'src/sessions/sessions.service';
import { RolesService } from 'src/roles/roles.service';
import { RedisService } from 'src/redis/redis.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenUtil: TokenUtil,
    private readonly sessionsService: SessionsService,
    private rolesService: RolesService,
    private redisService: RedisService,
  ) {}

  async register(username: string, password: string) {
    const exist = await this.usersService.findOne(username);
    if (exist) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await PasswordUtil.hash(password);
    const role = await this.rolesService.findByName('admin');

    const user = await this.usersService.create({
      username,
      password: hashedPassword,
    });

    user.roleEntities = [role];

    await this.usersService.saveUser(user);

    return user;
  }

  async login(req: any, username: string, password: string) {
    const user = await this.usersService.findOne(username);
    const permissions = user.roleEntities.flatMap((role) =>
      role.permissions.map((p) => p.name),
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await PasswordUtil.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // 1. CREATE SESSION FIRST
    const session = await this.sessionsService.create({
      userId: user.id,
      ip,
      userAgent,
    });
    await this.redisService.set(
      `session:${session.id}`,
      {
        userId: session.userId,
        revokedAt: null,
      },
      60 * 60 * 24 * 7,
    );
    const roles = user.roleEntities.map((role) => role.name);
    // 2. BUILD PAYLOAD WITH sessionId
    const payload = {
      sub: user.id,
      sessionId: session.id,
      username: user.username,
      roles,
      permissions,
    };

    // 3. GENERATE TOKENS
    const accessToken = await this.tokenUtil.generateAccessToken(payload);
    const refreshToken = await this.tokenUtil.generateRefreshToken(payload);

    // 4. HASH + STORE REFRESH TOKEN
    const hashedRefreshToken = await PasswordUtil.hash(refreshToken);

    await this.sessionsService.updateRefreshToken(
      session.id,
      hashedRefreshToken,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.tokenUtil.verifyAsyncToken(refreshToken);

      const session = await this.sessionsService.findById(payload.sessionId);

      if (!session || session.revokedAt) {
        throw new UnauthorizedException();
      }

      const isValid = await PasswordUtil.compare(
        refreshToken,
        session.refreshTokenHash,
      );

      if (!isValid) {
        await this.sessionsService.revoke(session.id);
        throw new UnauthorizedException();
      }

      const newPayload = {
        sub: payload.sub,
        sessionId: session.id,
        username: payload.username,
        roles: payload.roles,
      };

      const accessToken = await this.tokenUtil.generateAccessToken(newPayload);

      const newRefreshToken =
        await this.tokenUtil.generateRefreshToken(newPayload);

      const hashed = await PasswordUtil.hash(newRefreshToken);

      await this.sessionsService.updateRefreshToken(session.id, hashed);

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    user.password = passwordHash;

    await this.usersService.saveUser(user);

    await this.sessionsService.revokeAllByUserId(userId);

    return {
      message: 'Password changed successfully',
    };
  }

  async logout(user: any) {
    await this.sessionsService.revoke(user.sessionId);
    await this.redisService.del(`session:${user.sessionId}`);

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

  async logoutAll(user: any) {
    // 1. revoke DB
    const sessions = await this.sessionsService.findByUserId(user.sub);

    await this.sessionsService.revokeAllByUserId(user.sub);

    // 2. clear Redis cache
    for (const session of sessions) {
      await this.redisService.del(`session:${session.id}`);
    }

    return {
      message: 'Logged out all devices',
    };
  }
}
