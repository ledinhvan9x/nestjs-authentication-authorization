import { Module } from '@nestjs/common';
import { RandomService } from './random.service';
import { RandomController } from './random.controller';

@Module({
  controllers: [RandomController],
  providers: [RandomService],
})
export class RandomModule {}
