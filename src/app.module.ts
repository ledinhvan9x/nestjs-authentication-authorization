import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RandomModule } from './random/random.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './guards/roles.guard';
import { SessionsModule } from './sessions/sessions.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { Role } from './roles/entities/role.entity';
import { Permission } from './permissions/entities/permission.entity';
import { SeedService } from './seeds/seed.service';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Role, Permission]),
    AuthModule,
    UsersModule,
    RandomModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'mac',
      password: '',
      database: 'nest_auth',
      autoLoadEntities: true,
      synchronize: true,
    }),
    SessionsModule,
    RolesModule,
    PermissionsModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
