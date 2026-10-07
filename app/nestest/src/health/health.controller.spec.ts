import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { vi } from 'vitest';

describe('HealthController', () => {
  let controller: HealthController;

  const healthServiceMock = {
    getHealth: vi.fn().mockReturnValue({
      status: 'ok',
      timestamp: new Date().toISOString(),
      application: 'NestJS DevOps',
      version: '1.0.0',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: healthServiceMock,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});