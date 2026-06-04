import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Req,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async getSessions(@CurrentUser() user: any) {
    return this.sessionsService.findByUserId(user.sub);
  }

  @Delete(':id')
  async revokeSession(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].sub;

    const session = await this.sessionsService.findById(id);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException();
    }

    await this.sessionsService.revoke(id);

    return {
      message: 'Session revoked',
    };
  }
}
