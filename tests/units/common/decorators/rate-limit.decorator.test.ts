import './mocks/rate-limit.decorator.mock';

import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { describe, expect, it } from 'vitest';

import {
  ApiRateLimit,
  AuthRateLimit,
  BurstProtection,
  CustomRateLimit,
  LenientRateLimit,
  ModerateRateLimit,
  SkipThrottleDecorator,
  StrictRateLimit,
} from '@/common/decorators/rate-limit.decorator';
import { API_RATE_LIMITS } from '@/constants/api';

describe('Rate Limit Decorators', () => {
  describe('StrictRateLimit', () => {
    it('should create Throttle decorator with STRICT rate limit', () => {
      const result = StrictRateLimit();

      expect(Throttle).toHaveBeenCalledWith({
        default: API_RATE_LIMITS.STRICT,
      });
      expect(result).toEqual({ default: API_RATE_LIMITS.STRICT });
    });

    it('should return throttle configuration', () => {
      const result = StrictRateLimit();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('default');
    });
  });

  describe('ModerateRateLimit', () => {
    it('should create Throttle decorator with MODERATE rate limit', () => {
      const result = ModerateRateLimit();

      expect(Throttle).toHaveBeenCalledWith({
        default: API_RATE_LIMITS.MODERATE,
      });
      expect(result).toEqual({ default: API_RATE_LIMITS.MODERATE });
    });
  });

  describe('LenientRateLimit', () => {
    it('should create Throttle decorator with LENIENT rate limit', () => {
      const result = LenientRateLimit();

      expect(Throttle).toHaveBeenCalledWith({
        default: API_RATE_LIMITS.LENIENT,
      });
      expect(result).toEqual({ default: API_RATE_LIMITS.LENIENT });
    });
  });

  describe('BurstProtection', () => {
    it('should create Throttle decorator with BURST rate limit', () => {
      const result = BurstProtection();

      expect(Throttle).toHaveBeenCalledWith({
        default: API_RATE_LIMITS.BURST,
      });
      expect(result).toEqual({ default: API_RATE_LIMITS.BURST });
    });
  });

  describe('CustomRateLimit', () => {
    it('should create Throttle decorator with custom ttl and limit', () => {
      const ttl = 30000;
      const limit = 50;
      const result = CustomRateLimit(ttl, limit);

      expect(Throttle).toHaveBeenCalledWith({ default: { ttl, limit } });
      expect(result).toEqual({ default: { ttl, limit } });
    });

    it('should handle different custom values', () => {
      const ttl = 60000;
      const limit = 100;
      const result = CustomRateLimit(ttl, limit);

      expect(result).toEqual({ default: { ttl, limit } });
    });

    it('should handle zero values', () => {
      const ttl = 0;
      const limit = 0;
      const result = CustomRateLimit(ttl, limit);

      expect(result).toEqual({ default: { ttl, limit } });
    });
  });

  describe('SkipThrottleDecorator', () => {
    it('should call SkipThrottle', () => {
      const result = SkipThrottleDecorator();

      expect(SkipThrottle).toHaveBeenCalled();
      expect(result).toBe('SkipThrottle');
    });
  });

  describe('ApiRateLimit', () => {
    it('should create Throttle decorator with burst and moderate limits', () => {
      const result = ApiRateLimit();

      expect(Throttle).toHaveBeenCalledWith({
        burst: API_RATE_LIMITS.BURST,
        moderate: API_RATE_LIMITS.MODERATE,
      });
      expect(result).toEqual({
        burst: API_RATE_LIMITS.BURST,
        moderate: API_RATE_LIMITS.MODERATE,
      });
    });
  });

  describe('AuthRateLimit', () => {
    it('should create Throttle decorator with strict limit', () => {
      const result = AuthRateLimit();

      expect(Throttle).toHaveBeenCalledWith({
        strict: API_RATE_LIMITS.STRICT,
      });
      expect(result).toEqual({
        strict: API_RATE_LIMITS.STRICT,
      });
    });
  });

  describe('real-world usage', () => {
    it('should provide different rate limits for different scenarios', () => {
      const strict = StrictRateLimit();
      const moderate = ModerateRateLimit();
      const lenient = LenientRateLimit();

      expect(strict).not.toEqual(moderate);
      expect(moderate).not.toEqual(lenient);
      expect(strict).not.toEqual(lenient);
    });

    it('should allow custom rate limits for specific endpoints', () => {
      const custom = CustomRateLimit(10000, 25);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((custom as any).default).toEqual({ ttl: 10000, limit: 25 });
    });

    it('should support skipping throttle for certain routes', () => {
      const skip = SkipThrottleDecorator();

      expect(skip).toBeDefined();
      expect(SkipThrottle).toHaveBeenCalled();
    });
  });
});
