import { describe, expect, it } from 'vitest';

import {
  EXCLUDE_FIELDS_WITH_CREATED,
  EXCLUDE_FIELDS_WITH_UPDATED,
} from '@/constants/database';
import { HTTP_HEADER } from '@/constants/http';
import { DEFAULT_SCALAR } from '@/constants/meta-data';

describe('Database Constants', () => {
  describe('EXCLUDE_FIELDS_WITH_UPDATED', () => {
    it('should contain all expected fields', () => {
      expect(EXCLUDE_FIELDS_WITH_UPDATED).toEqual([
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
        'deleted_at',
        'deleted_by',
      ]);
    });

    it('should have correct length', () => {
      expect(EXCLUDE_FIELDS_WITH_UPDATED).toHaveLength(6);
    });

    it('should contain created_at field', () => {
      expect(EXCLUDE_FIELDS_WITH_UPDATED).toContain('created_at');
    });

    it('should contain created_by field', () => {
      expect(EXCLUDE_FIELDS_WITH_UPDATED).toContain('created_by');
    });

    it('should contain updated_at field', () => {
      expect(EXCLUDE_FIELDS_WITH_UPDATED).toContain('updated_at');
    });

    it('should contain updated_by field', () => {
      expect(EXCLUDE_FIELDS_WITH_UPDATED).toContain('updated_by');
    });

    it('should contain deleted_at field', () => {
      expect(EXCLUDE_FIELDS_WITH_UPDATED).toContain('deleted_at');
    });

    it('should contain deleted_by field', () => {
      expect(EXCLUDE_FIELDS_WITH_UPDATED).toContain('deleted_by');
    });
  });

  describe('EXCLUDE_FIELDS_WITH_CREATED', () => {
    it('should contain all expected fields', () => {
      expect(EXCLUDE_FIELDS_WITH_CREATED).toEqual([
        'id',
        'created_at',
        'created_by',
        'updated_at',
        'updated_by',
        'deleted_at',
        'deleted_by',
      ]);
    });

    it('should have correct length', () => {
      expect(EXCLUDE_FIELDS_WITH_CREATED).toHaveLength(7);
    });

    it('should contain id field', () => {
      expect(EXCLUDE_FIELDS_WITH_CREATED).toContain('id');
    });

    it('should contain all EXCLUDE_FIELDS_WITH_UPDATED fields', () => {
      EXCLUDE_FIELDS_WITH_UPDATED.forEach(field => {
        expect(EXCLUDE_FIELDS_WITH_CREATED).toContain(field);
      });
    });

    it('should have id as first element', () => {
      expect(EXCLUDE_FIELDS_WITH_CREATED[0]).toBe('id');
    });
  });

  describe('relationship between constants', () => {
    it('EXCLUDE_FIELDS_WITH_CREATED should be superset of EXCLUDE_FIELDS_WITH_UPDATED', () => {
      const updated = EXCLUDE_FIELDS_WITH_UPDATED.length;
      const created = EXCLUDE_FIELDS_WITH_CREATED.length;

      expect(created).toBeGreaterThan(updated);
      expect(created).toBe(updated + 1);
    });

    it('EXCLUDE_FIELDS_WITH_CREATED should contain id that EXCLUDE_FIELDS_WITH_UPDATED does not', () => {
      expect(EXCLUDE_FIELDS_WITH_CREATED).toContain('id');
      expect(EXCLUDE_FIELDS_WITH_UPDATED).not.toContain('id');
    });
  });
});

describe('HTTP Constants', () => {
  describe('HTTP_HEADER', () => {
    it('should have CORRELATION_ID property', () => {
      expect(HTTP_HEADER).toHaveProperty('CORRELATION_ID');
    });

    it('should have correct CORRELATION_ID value', () => {
      expect(HTTP_HEADER.CORRELATION_ID).toBe('x-correlation-id');
    });

    it('should be an object', () => {
      expect(typeof HTTP_HEADER).toBe('object');
    });

    it('should have exactly two properties', () => {
      expect(Object.keys(HTTP_HEADER)).toHaveLength(2);
    });
  });

  describe('real-world usage', () => {
    it('should be usable for setting request headers', () => {
      const headers: Record<string, string> = {};
      headers[HTTP_HEADER.CORRELATION_ID] = 'abc-123-def-456';

      expect(headers['x-correlation-id']).toBe('abc-123-def-456');
    });

    it('should be usable for reading request headers', () => {
      const mockHeaders: Record<string, string> = {
        'x-correlation-id': 'correlation-123',
        'content-type': 'application/json',
      };

      const correlationId = mockHeaders[HTTP_HEADER.CORRELATION_ID];

      expect(correlationId).toBe('correlation-123');
    });
  });
});

describe('Metadata Constants', () => {
  describe('DEFAULT_SCALAR', () => {
    it('should have TITLE property', () => {
      expect(DEFAULT_SCALAR.TITLE).toBe('Sprouting Academy API');
    });

    it('should have DESCRIPTION property', () => {
      expect(DEFAULT_SCALAR.DESCRIPTION).toBe(
        'The Sprouting Academy API description',
      );
    });

    it('should have VERSION property', () => {
      expect(DEFAULT_SCALAR.VERSION).toBe('1.0');
    });

    it('should have CONTACT_NAME property', () => {
      expect(DEFAULT_SCALAR.CONTACT_NAME).toBe('Support Team');
    });

    it('should have CONTACT_URL property', () => {
      expect(DEFAULT_SCALAR.CONTACT_URL).toBe('http://localhost:3001');
    });

    it('should have CONTACT_EMAIL property', () => {
      expect(DEFAULT_SCALAR.CONTACT_EMAIL).toBe('support@example.com');
    });

    it('should have TERMS_OF_SERVICE property', () => {
      expect(DEFAULT_SCALAR.TERMS_OF_SERVICE).toBe('http://example.com/terms/');
    });

    it('should have LICENSE_NAME property', () => {
      expect(DEFAULT_SCALAR.LICENSE_NAME).toBe('Apache 2.0');
    });

    it('should have LICENSE_URL property', () => {
      expect(DEFAULT_SCALAR.LICENSE_URL).toBe(
        'https://www.apache.org/licenses/LICENSE-2.0.html',
      );
    });

    it('should have SERVE_ROOT property', () => {
      expect(DEFAULT_SCALAR.SERVE_ROOT).toBe('scalar');
    });

    it('should have THEME property', () => {
      expect(DEFAULT_SCALAR.THEME).toBe('bluePlanet');
    });

    it('should have LAYOUT property', () => {
      expect(DEFAULT_SCALAR.LAYOUT).toBe('modern');
    });
  });

  describe('DEFAULT_SCALAR.AUTH', () => {
    it('should have AUTH property', () => {
      expect(DEFAULT_SCALAR).toHaveProperty('AUTH');
    });

    it('should have correct TYPE', () => {
      expect(DEFAULT_SCALAR.AUTH.TYPE).toBe('http');
    });

    it('should have correct SCHEME', () => {
      expect(DEFAULT_SCALAR.AUTH.SCHEME).toBe('bearer');
    });

    it('should have correct BEARER_FORMAT', () => {
      expect(DEFAULT_SCALAR.AUTH.BEARER_FORMAT).toBe('JWT');
    });

    it('should have all auth properties', () => {
      expect(DEFAULT_SCALAR.AUTH).toHaveProperty('TYPE');
      expect(DEFAULT_SCALAR.AUTH).toHaveProperty('SCHEME');
      expect(DEFAULT_SCALAR.AUTH).toHaveProperty('BEARER_FORMAT');
    });
  });

  describe('structure validation', () => {
    it('should have all top-level properties', () => {
      const expectedKeys = [
        'TITLE',
        'DESCRIPTION',
        'VERSION',
        'CONTACT_NAME',
        'CONTACT_URL',
        'CONTACT_EMAIL',
        'TERMS_OF_SERVICE',
        'LICENSE_NAME',
        'LICENSE_URL',
        'AUTH',
        'SERVE_ROOT',
        'THEME',
        'LAYOUT',
      ];

      expectedKeys.forEach(key => {
        expect(DEFAULT_SCALAR).toHaveProperty(key);
      });
    });

    it('should be an object', () => {
      expect(typeof DEFAULT_SCALAR).toBe('object');
    });
  });

  describe('real-world usage for API documentation', () => {
    it('should provide complete contact information', () => {
      const contact = {
        name: DEFAULT_SCALAR.CONTACT_NAME,
        url: DEFAULT_SCALAR.CONTACT_URL,
        email: DEFAULT_SCALAR.CONTACT_EMAIL,
      };

      expect(contact.name).toBe('Support Team');
      expect(contact.url).toBe('http://localhost:3001');
      expect(contact.email).toBe('support@example.com');
    });

    it('should provide complete license information', () => {
      const license = {
        name: DEFAULT_SCALAR.LICENSE_NAME,
        url: DEFAULT_SCALAR.LICENSE_URL,
      };

      expect(license.name).toBe('Apache 2.0');
      expect(license.url).toContain('apache.org');
    });

    it('should provide complete auth configuration', () => {
      const authConfig = DEFAULT_SCALAR.AUTH;

      expect(authConfig.TYPE).toBe('http');
      expect(authConfig.SCHEME).toBe('bearer');
      expect(authConfig.BEARER_FORMAT).toBe('JWT');
    });

    it('should provide API metadata', () => {
      const metadata = {
        title: DEFAULT_SCALAR.TITLE,
        description: DEFAULT_SCALAR.DESCRIPTION,
        version: DEFAULT_SCALAR.VERSION,
      };

      expect(metadata.title).toBe('Sprouting Academy API');
      expect(metadata.description).toBeTruthy();
      expect(metadata.version).toBe('1.0');
    });

    it('should provide Scalar UI configuration', () => {
      const scalarConfig = {
        serveRoot: DEFAULT_SCALAR.SERVE_ROOT,
        theme: DEFAULT_SCALAR.THEME,
        layout: DEFAULT_SCALAR.LAYOUT,
      };

      expect(scalarConfig.serveRoot).toBe('scalar');
      expect(scalarConfig.theme).toBe('bluePlanet');
      expect(scalarConfig.layout).toBe('modern');
    });
  });
});
