import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Physician } from './physicians/entities/physician.entity';
import { AuthModule } from './auth/auth.module';
import { PhysiciansModule } from './physicians/physicians.module';

@Module({
  imports: [
    // 1. Database Connection (Postgres)
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST || 'localhost',
    //   port: 5432,
    //   username: process.env.DB_USER || 'postgres',
    //   password: process.env.DB_PASSWORD || 'postgres',
    //   database: process.env.DB_NAME || 'clinic_db',
    //   entities: [Physician],
    //   synchronize: true,
    // }),

    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_URL || 'mongodb://localhost:27017/clinic_db',
      synchronize: false,
      entities: [Physician],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    AuthModule,
    PhysiciansModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
