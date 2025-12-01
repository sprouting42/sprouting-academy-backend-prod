import type { SecuritySchemeType } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const DEFAULT_SCALAR = {
  TITLE: 'Sprouting Academy API',
  DESCRIPTION: 'The Sprouting Academy API description',
  VERSION: '1.0',
  CONTACT_NAME: 'Support Team',
  CONTACT_URL: 'http://localhost:3001',
  CONTACT_EMAIL: 'support@example.com',
  TERMS_OF_SERVICE: 'http://example.com/terms/',
  LICENSE_NAME: 'Apache 2.0',
  LICENSE_URL: 'https://www.apache.org/licenses/LICENSE-2.0.html',
  AUTH: {
    TYPE: 'http' as SecuritySchemeType,
    SCHEME: 'bearer',
    BEARER_FORMAT: 'JWT',
  },
  SERVE_ROOT: 'scalar',
  THEME: 'bluePlanet',
  LAYOUT: 'modern',
};
