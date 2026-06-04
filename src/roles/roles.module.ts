import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), UsersModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
