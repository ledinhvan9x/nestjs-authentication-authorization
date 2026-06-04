import { Injectable } from '@nestjs/common';
import { Session } from './entity/session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
  ) {}

  async findById(id: string) {
    return this.sessionRepo.findOne({
      where: { id },
    });
  }

  async revoke(sessionId: string) {
    return this.sessionRepo.update(sessionId, {
      revokedAt: new Date(),
    });
  }

  async create(data: { userId: string }) {
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
}
