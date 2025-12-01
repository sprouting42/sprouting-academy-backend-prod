import { vi } from 'vitest';

// Mock @nestjs/swagger
vi.mock('@nestjs/swagger', () => ({
  ApiBadRequestResponse: vi.fn(() => 'ApiBadRequestResponse'),
  ApiInternalServerErrorResponse: vi.fn(() => 'ApiInternalServerErrorResponse'),
}));
