import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Public } from 'src/decorators/public.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { UsersService } from 'src/users/users.service';

@Controller('roles')
export class RolesController {
  constructor(
    private rolesService: RolesService,

    private userService: UsersService,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  @Public()
  @Post()
  create(@Body('name') name: string) {
    return this.rolesService.create(name);
  }

  @Public()
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Public()
  @Post(':userId/roles/:roleId')
  async assignRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    const user = await this.userService.findById(userId);

    const role = await this.roleRepo.findOneBy({
      id: roleId,
    });

    user.roleEntities = [role];

    return this.userService.saveUser(user);
  }
  @Public()
  @Post(':roleId/permissions/:permissionId')
  assignPermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.assignPermission(roleId, permissionId);
  }
}
