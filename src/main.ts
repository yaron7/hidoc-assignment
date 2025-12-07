import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // --- 1. Security & Network Configuration ---
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  // --- 2. Input Sanitization ---

  // Middleware patch to ensure req.query is writable for mongoSanitize
  // (Fixes compatibility issues with Express 5 / newer Node versions)
  const patchQueryMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.query && !Object.getOwnPropertyDescriptor(req, 'query')?.writable) {
      Object.defineProperty(req, 'query', {
        value: req.query,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
    next();
  };

  app.use(patchQueryMiddleware);
  app.use(mongoSanitize());

  // --- 3. NestJS Global Pipes & Interceptors ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // --- 4. Application Setup ---
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
