import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/decorators/permissions.decorator';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const userPermissions = request.user.permissions ?? [];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
