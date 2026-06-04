import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
  ) {}
  create(createPermissionDto: CreatePermissionDto) {
    const result = this.permissionRepo.create({
      name: createPermissionDto.name,
    });
    return this.permissionRepo.save(result);
  }

  findAll() {
    return `This action returns all permissions`;
  }

  findOne(id: string) {
    return this.permissionRepo.findOne({
      where: { id },
    });
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    console.log(updatePermissionDto);
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
