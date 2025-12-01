/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { vi } from 'vitest';

vi.mock('@nestjs/swagger', async () => {
  const actual = await vi.importActual('@nestjs/swagger');
  return {
    ...actual,
    ApiExtraModels: vi.fn(() => 'ApiExtraModels'),
    ApiOkResponse: vi.fn(() => 'ApiOkResponse'),
    getSchemaPath: vi.fn(type => `#/components/schemas/${type.name}`),
  };
});

export class TestModel {
  id: number;
  name: string;
}
