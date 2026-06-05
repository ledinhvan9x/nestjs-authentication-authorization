import { Injectable } from '@nestjs/common';
import { Session } from './entity/session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
    private redisService: RedisService,
  ) {}

  async findById(id: string) {
    return this.sessionRepo.findOne({
      where: { id },
    });
  }

  async revoke(sessionId: string) {
    // DB
    await this.sessionRepo.update(sessionId, {
      revokedAt: new Date(),
    });

    // Redis
    await this.redisService.del(`session:${sessionId}`);
  }

  async create(data: { userId: string; ip: string; userAgent: string }) {
    return this.sessionRepo.save(data);
  }

  async updateRefreshToken(sessionId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);

    await this.sessionRepo.update(sessionId, {
      refreshTokenHash: hash,
    });
  }

  async findByUserId(userId: string) {
    return this.sessionRepo.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
      select: {
        id: true,
        createdAt: true,
        userId: true,
        revokedAt: true,
      },
    });
  }

  async revokeAllByUserId(userId: string) {
    await this.sessionRepo.update({ userId }, { revokedAt: new Date() });
  }
}
