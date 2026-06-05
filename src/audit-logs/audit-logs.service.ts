import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Repository } from 'typeorm';
import { AuditAction } from 'src/enums/audit-action.enum';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(userId: string, action: AuditAction) {
    const auditLog = this.auditRepository.create({
      userId,
      action,
    });

    await this.auditRepository.save(auditLog);
  }
}
