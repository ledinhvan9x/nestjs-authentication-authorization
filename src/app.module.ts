import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RandomModule } from './random/random.module';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [AuthModule, UsersModule, RandomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
