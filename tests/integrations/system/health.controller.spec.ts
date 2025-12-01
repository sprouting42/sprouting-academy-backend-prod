import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock API_CONTROLLER_CONFIG to prevent undefined error in decorators
vi.mock('@/constants/api-controller', () => ({
  API_CONTROLLER_CONFIG: {
    HEALTH: {
      PREFIX: '_health',
      TAG: 'System',
      ROUTE: {
        GET_HEALTH: '',
      },
    },
  },
}));

// Mock API_RATE_LIMITS to prevent undefined error in decorators
vi.mock('@/constants/api', () => ({
  API_RATE_LIMITS: {
    STRICT: { ttl: 60000, limit: 10 },
    MODERATE: { ttl: 60000, limit: 100 },
    LENIENT: { ttl: 60000, limit: 1000 },
    BURST: { ttl: 1000, limit: 10 },
  },
}));

import { API_CONTROLLER_CONFIG } from '@/constants/api-controller';
import type { HealthResponse } from '@/domains/system/health/controller/contracts/health.response';
import { HealthModule } from '@/domains/system/health/health.module';
import { NodeEnv } from '@/enums/node-env.enum';

describe('Health Controller', () => {
  const API_PATH = `/${API_CONTROLLER_CONFIG.HEALTH.PREFIX}`;
  let app: INestApplication<never>;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    if (app !== undefined) {
      await app.close();
    }
    vi.restoreAllMocks();
  });

  describe(`GET ${API_PATH}`, () => {
    it('should return health status with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      const body = response.body as HealthResponse;

      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('memory');
      expect(body).toHaveProperty('environment');

      expect(body.status).toBe(HttpStatus.OK.toString());
      expect(typeof body.timestamp).toBe('string');
      expect(typeof body.uptime).toBe('number');
      expect(typeof body.memory).toBe('object');
      expect(typeof body.environment).toBe('string');
    });

    it('should return valid timestamp in ISO format', async () => {
      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      const body = response.body as HealthResponse;

      const timestamp = body.timestamp;
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      const date = new Date(timestamp);
      expect(date.getTime()).not.toBeNaN();
    });

    it('should return memory usage information', async () => {
      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      const body = response.body as HealthResponse;
      const { memory } = body;

      expect(memory).toHaveProperty('used');
      expect(memory).toHaveProperty('total');
      expect(typeof memory?.used).toBe('number');
      expect(typeof memory?.total).toBe('number');
      expect(memory?.used).toBeGreaterThan(0);
      expect(memory?.total).toBeGreaterThan(0);
      expect(memory?.used).toBeLessThanOrEqual(memory?.total ?? 0);
    });

    it('should return uptime as positive number', async () => {
      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      const body = response.body as HealthResponse;
      const { uptime } = body;

      expect(uptime).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(uptime)).toBe(true);
    });

    it('should return environment from NODE_ENV or default to development', async () => {
      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      const body = response.body as HealthResponse;
      const { environment } = body;

      expect([NodeEnv.DEVELOPMENT, NodeEnv.PRODUCTION, NodeEnv.TEST]).toContain(
        environment,
      );
    });

    it('should return version from package.json if available', async () => {
      const originalVersion = process.env.npm_package_version;
      process.env.npm_package_version = '1.0.0';

      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      const body = response.body as HealthResponse;
      const { version } = body;

      expect(version).toBe('1.0.0');

      process.env.npm_package_version = originalVersion;
    });

    it('should handle missing version gracefully', async () => {
      const originalVersion = process.env.npm_package_version;
      delete process.env.npm_package_version;

      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      const body = response.body as HealthResponse;
      const { version } = body;

      expect(version).toBeUndefined();

      process.env.npm_package_version = originalVersion;
    });

    it('should set correct content-type header', async () => {
      const response = await request(app.getHttpServer())
        .get(API_PATH)
        .expect(HttpStatus.OK);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should respond quickly (performance test)', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer()).get(API_PATH).expect(HttpStatus.OK);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Health check should respond within 100ms under normal conditions
      expect(responseTime).toBeLessThan(100);
    });

    it('should return consistent data structure on multiple calls', async () => {
      const responses = await Promise.all([
        request(app.getHttpServer()).get(API_PATH),
        request(app.getHttpServer()).get(API_PATH),
        request(app.getHttpServer()).get(API_PATH),
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('memory');
        expect(response.body).toHaveProperty('environment');
      });

      const uptimes = responses.map(r => (r.body as HealthResponse).uptime);
      expect(uptimes[1]).toBeGreaterThanOrEqual(uptimes?.[0] ?? 0);
      expect(uptimes[2]).toBeGreaterThanOrEqual(uptimes?.[1] ?? 0);
    });
  });
});
