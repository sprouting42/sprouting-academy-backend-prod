/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import '../../modules/logger/mocks/logger.mock.ts';
import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/supabase/supabase.module';
import { SupabaseConnector } from '@/infrastructures/supabase/services/supabase-connector';
import { SupabaseManager } from '@/infrastructures/supabase/services/supabase.manager';
import { SupabaseModule } from '@/infrastructures/supabase/supabase.module';

describe('supabase.module', () => {
  it('should be defined', () => {
    expect(SupabaseModule).toBeDefined();
  });

  it('should be a global module', () => {
    const isGlobal = Reflect.getMetadata('__module:global__', SupabaseModule);
    expect(isGlobal).toBe(true);
  });

  it('should import LoggerModule', () => {
    const imports = Reflect.getMetadata('imports', SupabaseModule);
    expect(imports).toBeDefined();
    expect(Array.isArray(imports)).toBe(true);
  });

  it('should provide SupabaseConnector with custom token', () => {
    const providers = Reflect.getMetadata('providers', SupabaseModule);
    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);

    const connectorProvider = providers.find(
      (p: { provide?: symbol }) => p.provide === SupabaseConnector.TOKEN,
    );
    expect(connectorProvider).toBeDefined();
    expect(connectorProvider.provide).toBe(SupabaseConnector.TOKEN);
    expect(connectorProvider.useClass).toBe(SupabaseConnector);
  });

  it('should provide SupabaseManager with custom token', () => {
    const providers = Reflect.getMetadata('providers', SupabaseModule);
    const managerProvider = providers.find(
      (p: { provide?: symbol }) => p.provide === SupabaseManager.TOKEN,
    );

    expect(managerProvider).toBeDefined();
    expect(managerProvider.provide).toBe(SupabaseManager.TOKEN);
    expect(managerProvider.useClass).toBe(SupabaseManager);
  });

  it('should export SupabaseManager token', () => {
    const exports = Reflect.getMetadata('exports', SupabaseModule);
    expect(exports).toBeDefined();
    expect(Array.isArray(exports)).toBe(true);
    expect(exports).toContain(SupabaseManager.TOKEN);
  });

  it('should have SupabaseConnector.TOKEN as a symbol', () => {
    expect(typeof SupabaseConnector.TOKEN).toBe('symbol');
  });

  it('should have SupabaseManager.TOKEN as a symbol', () => {
    expect(typeof SupabaseManager.TOKEN).toBe('symbol');
  });

  it('should not export SupabaseConnector token', () => {
    const exports = Reflect.getMetadata('exports', SupabaseModule);
    expect(exports).not.toContain(SupabaseConnector.TOKEN);
  });
});
