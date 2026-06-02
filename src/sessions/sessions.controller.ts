import { Controller, Get } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async getSessions(@CurrentUser() user: any) {
    return this.sessionsService.findByUserId(user.sub);
  }
}
