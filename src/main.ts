import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
config();

const port = process.env.PORT;
const allowedOrigins = process.env.allowedOrigins.split(',');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const isDev = true

  app.enableCors({
    origin: isDev ? 'http://localhost:3000' : 'https://apps.rk-env.ru',
    // origin: 'https://apps.rk-env.ru',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  const config = new DocumentBuilder()
    .setTitle('NestJS ToDo App')
    .setDescription('NestJS todo app that helps a user to manage their tasks')
    .setVersion('1.0')
    .addTag('Authentication', 'Routes for authentication')
    .addTag('Tasks management', 'Tasks management routes')
    .addBearerAuth({ bearerFormat: 'jwt', type: 'http', name: 'bearer' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(port, () => console.log(`🛜   http://localhost:${port}`));
}
bootstrap();
