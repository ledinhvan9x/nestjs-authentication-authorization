import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { PermissionsGuard } from 'src/guards/permission.guard';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/enums/permission.enum';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.USER_READ)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(PermissionsGuard)
  @Permissions(PermissionsEnum.USER_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
