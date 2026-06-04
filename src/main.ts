import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seeds/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seedService = app.get(SeedService);

  await seedService.seed();

  await app.listen(3000);
}
bootstrap();
