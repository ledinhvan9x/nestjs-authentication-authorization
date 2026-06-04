import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  create(name: string) {
    const role = this.roleRepo.create({ name });
    return this.roleRepo.save(role);
  }

  findAll() {
    return this.roleRepo.find();
  }
}
