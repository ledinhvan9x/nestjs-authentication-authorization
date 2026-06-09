import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepo: Repository<Permission>,
  ) {}

  async seed() {
    const permissions = [
      'user:read',
      'user:create',
      'user:update',
      'user:delete',
      'role:read',
      'role:create',
      'role:update',
      'role:delete',
    ];

    const permissionEntities = [];

    for (const name of permissions) {
      let perm = await this.permissionsRepo.findOne({
        where: { name },
      });

      if (!perm) {
        perm = await this.permissionsRepo.save({ name });
      }

      permissionEntities.push(perm);
    }

    let adminRole = await this.rolesRepo.findOne({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      adminRole = await this.rolesRepo.save({ name: 'admin' });
    }

    let userRole = await this.rolesRepo.findOne({
      where: { name: 'user' },
    });

    if (!userRole) {
      userRole = await this.rolesRepo.save({ name: 'user' });
    }

    adminRole.permissions = permissionEntities;
    await this.rolesRepo.save(adminRole);

    const userRead = permissionEntities.find((p) => p.name === 'user:read');

    userRole.permissions = userRead ? [userRead] : [];
    await this.rolesRepo.save(userRole);
  }
}
