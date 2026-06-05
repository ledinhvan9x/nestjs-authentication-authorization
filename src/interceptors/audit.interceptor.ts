import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

import { AuditAction } from '../enums/audit-action.enum';
import { AUDIT_ACTION_KEY } from '../decorators/audit.decorator';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private auditService: AuditLogsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<AuditAction>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );
    if (!action) {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap(async () => {
        await this.auditService.log(request.user.sub, action);
      }),
    );
  }
}
