import { HealthDao } from "./dao/health.dao";

describe('HealthDao', () => {
  let dao: HealthDao;

  beforeEach(() => {
    dao = new HealthDao();
  });

  it('should return the application name', () => {
    expect(dao.getApplicationName()).toBe('nestjs-health-api');
  });

  it('should return the application version', () => {
    expect(dao.getApplicationVersion()).toBe('6.7');
  });
});