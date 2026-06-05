import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { SessionsService } from 'src/sessions/sessions.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    private sessionService: SessionsService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);

      const key = `session:${payload.sessionId}`;

      let session = await this.redisService.get<{
        userId: string;
        revokedAt: Date;
      }>(key);

      // 🧠 fallback nếu Redis miss
      if (!session) {
        session = await this.sessionService.findById(payload.sessionId);

        if (!session) {
          throw new UnauthorizedException();
        }

        // refill cache
        await this.redisService.set(key, session, 60 * 60 * 24 * 7);
      }

      // check revoke
      if (session.revokedAt) {
        throw new UnauthorizedException();
      }

      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
