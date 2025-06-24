import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { logger } from './utils/logger';
import { join } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Cookie parser middleware
  app.use(cookieParser());

  // Static file serving for frontend assets
  const frontendDistPath = join(__dirname, '..', '..', '..', 'apps', 'frontend', 'dist');
  if (existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    logger.info(`Serving static files from: ${frontendDistPath}`);
  } else {
    logger.warn(`Frontend dist path not found: ${frontendDistPath}`);
  }

  // CORS configuration
  app.enableCors({
    origin: 'http://localhost:3010', // React dev server
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // API prefix - exclude root and frontend routes
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: '*', method: RequestMethod.GET },
    ],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('RFXCOM2MQTT API')
    .setDescription('RFXCOM to MQTT bridge API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Get port from configuration
  const port = configService.get<number>('frontend.port', 8080);
  const host = configService.get<string>('frontend.host', '0.0.0.0');

  await app.listen(port, host);

  logger.info(`Application is running on: http://${host}:${port}`);
  logger.info(`Swagger documentation available at: http://${host}:${port}/api/docs`);
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error(`Uncaught exception: ${error.message}`);
  logger.error(error.stack || 'No stack trace available');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled promise rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

bootstrap().catch(error => {
  logger.error(`Failed to start application: ${error.message}`);
  process.exit(1);
});
