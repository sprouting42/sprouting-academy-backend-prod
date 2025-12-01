import { resolve } from 'path';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    setupFiles: ['./tests/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'logs/',
        'dist/',
        'coverage/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/vitest.setup.ts',
        '**/*.config.ts',
        '**/*.config.js',
        '.eslintrc.js',
        'commitlint.config.js',
        'nest-cli.json',
        'tsconfig.json',
        'vitest.config.ts',
        'src/main.ts',
        '**/*.d.ts',
        'prisma/',
        'docker/',
        'scripts/',
        'README.md',
        '**/*.md',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/common': resolve(__dirname, './src/common'),
      '@/modules': resolve(__dirname, './src/modules'),
      '@/config': resolve(__dirname, './src/config'),
      '@/constants': resolve(__dirname, './src/constants'),
      '@/domain': resolve(__dirname, './src/domain'),
      '@/enums': resolve(__dirname, './src/enums'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/Infrastructure': resolve(__dirname, './src/Infrastructure'),
    },
  },
});
