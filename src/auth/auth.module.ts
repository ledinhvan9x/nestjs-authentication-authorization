import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../guards/auth.guard';
import { TokenUtil } from './utils/token.util';
import { SessionsModule } from 'src/sessions/sessions.module';
import { RolesModule } from 'src/roles/roles.module';
import { RedisModule } from 'src/redis/redis.module';
import { GoogleStrategy } from 'src/strategies/google.strategy';

@Module({
  imports: [
    UsersModule,
    SessionsModule,
    RolesModule,
    RedisModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    GoogleStrategy,
    AuthService,
    TokenUtil,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
