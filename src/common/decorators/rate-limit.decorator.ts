import { Throttle, SkipThrottle } from '@nestjs/throttler';

import { API_RATE_LIMITS } from '@/constants/api';

export const StrictRateLimit = () =>
  Throttle({ default: API_RATE_LIMITS.STRICT });

export const ModerateRateLimit = () =>
  Throttle({ default: API_RATE_LIMITS.MODERATE });

export const LenientRateLimit = () =>
  Throttle({ default: API_RATE_LIMITS.LENIENT });

export const BurstProtection = () =>
  Throttle({ default: API_RATE_LIMITS.BURST });

export const CustomRateLimit = (ttl: number, limit: number) =>
  Throttle({ default: { ttl, limit } });

export const SkipThrottleDecorator = () => SkipThrottle();

export const ApiRateLimit = () =>
  Throttle({
    burst: API_RATE_LIMITS.BURST,
    moderate: API_RATE_LIMITS.MODERATE,
  });

export const AuthRateLimit = () =>
  Throttle({
    strict: API_RATE_LIMITS.STRICT,
  });
