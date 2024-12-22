import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3000,
        retryAttempts: 3,
        retryDelay: 1000,
        // Todo - add tlsOptions for secure connection
      },
    },
  );

  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
}
bootstrap();
