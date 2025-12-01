/* eslint-disable @typescript-eslint/no-unsafe-return */
import { vi } from 'vitest';

vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    SetMetadata: vi.fn((...args) => args),
    createParamDecorator: vi.fn(factory => factory),
    applyDecorators: vi.fn((...decorators) => decorators),
  };
});
