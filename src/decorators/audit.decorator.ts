export const AUDIT_ACTION_KEY = 'audit_action';

import { SetMetadata } from '@nestjs/common';
import { AuditAction } from 'src/enums/audit-action.enum';

export const Audit = (action: AuditAction) =>
  SetMetadata(AUDIT_ACTION_KEY, action);
