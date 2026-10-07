import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service.js';
import { HealthDao } from './dao/health.dao.js';
import { vi } from 'vitest';

describe('HealthService', () => {
  let service: HealthService;

  const healthDaoMock = {
    getApplicationName: vi.fn().mockReturnValue('NestJS DevOps'),
    getApplicationVersion: vi.fn().mockReturnValue('1.0.0'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: HealthDao,
          useValue: healthDaoMock,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});