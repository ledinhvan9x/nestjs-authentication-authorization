import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    private permissionService: PermissionsService,
  ) {}

  findByName(name: string) {
    return this.roleRepo.findOne({
      where: { name },
    });
  }

  create(name: string) {
    const role = this.roleRepo.create({ name });
    return this.roleRepo.save(role);
  }

  findAll() {
    return this.roleRepo.find();
  }

  async assignPermission(roleId: string, permissionId: string) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: {
        permissions: true,
      },
    });

    const permission = await this.permissionService.findOne(permissionId);

    role.permissions.push(permission);

    return this.roleRepo.save(role);
  }
}
