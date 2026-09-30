import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthModule } from './health/health.module.js';
import { HealthService } from './health/health.service.js';
import { HealthDao } from './health/dao/health.dao.js';
import { BirdModule } from './bird/bird.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    
    ObserveModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        appKey: configService.getOrThrow<string>('OBSERVE_APP_KEY'),
        appSecret: configService.getOrThrow<string>('OBSERVE_APP_SECRET'),
        serviceId: configService.getOrThrow<string>('OBSERVE_APP_NAME'),
      }),
    }),
    HealthModule,
    BirdModule,
  ],
  controllers: [AppController],
  providers: [AppService, HealthService, HealthDao],
})
export class AppModule {}
