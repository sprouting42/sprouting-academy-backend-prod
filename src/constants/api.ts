import { HTTP_HEADER } from '@/constants/http';

export const API_CONFIG = {
  VERSION: 'v1',
  PREFIX: 'api',
  HEALTH_PATH: '_health',
  DOCS_PATH: 'docs',
} as const;

export const API_RATE_LIMITS = {
  STRICT: { ttl: 60000, limit: 3 },
  MODERATE: { ttl: 60000, limit: 30 },
  LENIENT: { ttl: 60000, limit: 100 },
  BURST: { ttl: 1000, limit: 10 },
} as const;

export const ApiHeader = {
  LANGUAGE: {
    name: HTTP_HEADER.LANGUAGE,
    description: 'Language preference for the request',
    required: false,
  },
};

export const THROTTLERS_CONFIG = Object.keys(API_RATE_LIMITS).map(key => ({
  key: key.toLowerCase(),
  ...API_RATE_LIMITS[key as keyof typeof API_RATE_LIMITS],
}));
