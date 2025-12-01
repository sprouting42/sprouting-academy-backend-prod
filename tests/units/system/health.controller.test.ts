import { HttpStatus } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { HealthResponse } from '@/domains/system/health/controller/contracts/health.response';
import { HealthController } from '@/domains/system/health/controller/health.controller';
import { NodeEnv } from '@/enums/node-env.enum';

// Mock the decorator
vi.mock('@/domains/system/health/controller/docs/health-get.doc', () => ({
  ApiDocHealthGet: () => vi.fn(),
}));

describe('Health Controller (Unit-Test)', () => {
  let healthController: HealthController;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    healthController = moduleFixture.get<HealthController>(HealthController);
  });

  afterEach(async () => {
    await moduleFixture.close();
    vi.restoreAllMocks();
  });

  describe('HealthResponse DTO', () => {
    it('should create HealthResponse instance correctly', () => {
      const healthData = {
        status: HttpStatus.OK.toString(),
        timestamp: new Date().toISOString(),
        uptime: 123,
        version: '1.0.0',
        environment: NodeEnv.DEVELOPMENT,
        memory: { used: 50, total: 100 },
      };

      const healthResponse = HealthResponse.create(healthData);

      expect(healthResponse.status).toBe(healthData.status);
      expect(healthResponse.timestamp).toBe(healthData.timestamp);
      expect(healthResponse.uptime).toBe(healthData.uptime);
      expect(healthResponse.version).toBe(healthData.version);
      expect(healthResponse.environment).toBe(healthData.environment);
      expect(healthResponse.memory).toEqual(healthData.memory);
    });

    it('should handle partial data in HealthResponse.create', () => {
      const partialData = {
        status: HttpStatus.OK.toString(),
        timestamp: new Date().toISOString(),
        uptime: 123,
      };

      const healthResponse = HealthResponse.create(partialData);

      expect(healthResponse.status).toBe(partialData.status);
      expect(healthResponse.timestamp).toBe(partialData.timestamp);
      expect(healthResponse.uptime).toBe(partialData.uptime);
      expect(healthResponse.version).toBeUndefined();
      expect(healthResponse.environment).toBeUndefined();
      expect(healthResponse.memory).toBeUndefined();
    });
  });

  describe('Controller Methods', () => {
    it('should call getHealth method directly', () => {
      const result = healthController.getHealth();

      expect(result).toBeInstanceOf(HealthResponse);
      expect(result.status).toBe(HttpStatus.OK.toString());
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.memory).toBe('object');
    });

    it('should return different timestamps on subsequent calls', async () => {
      const result1 = healthController.getHealth();

      await new Promise(resolve => setTimeout(resolve, 3));

      const result2 = healthController.getHealth();

      expect(result1.timestamp).not.toBe(result2.timestamp);
      expect(new Date(result1.timestamp).getTime()).toBeLessThan(
        new Date(result2.timestamp).getTime(),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle process.uptime() errors gracefully', () => {
      const originalUptime = process.uptime.bind(process);
      process.uptime = vi.fn(() => {
        throw new Error('Process uptime error');
      });

      expect(() => {
        healthController.getHealth();
      }).toThrow('Process uptime error');

      process.uptime = originalUptime;
    });

    it('should handle process.memoryUsage() errors gracefully', () => {
      const originalMemoryUsage = process.memoryUsage.bind(process);
      process.memoryUsage = vi.fn(() => {
        throw new Error('Memory usage error');
      }) as never;

      expect(() => {
        healthController.getHealth();
      }).toThrow('Memory usage error');

      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('Edge Cases', () => {
    it('should handle environment variables correctly', () => {
      const originalNodeEnv = process.env.NODE_ENV;

      delete process.env.NODE_ENV;
      const result1 = healthController.getHealth();
      expect(result1.environment).toBe(NodeEnv.DEVELOPMENT);

      process.env.NODE_ENV = NodeEnv.PRODUCTION;
      const result2 = healthController.getHealth();
      expect(result2.environment).toBe(NodeEnv.PRODUCTION);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle zero memory usage scenario', () => {
      const originalMemoryUsage = process.memoryUsage.bind(process);
      process.memoryUsage = vi.fn(() => ({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0,
      })) as never;

      const result = healthController.getHealth();

      expect(result.memory?.used).toBe(0);
      expect(result.memory?.total).toBe(0);

      process.memoryUsage = originalMemoryUsage;
    });
  });
});
