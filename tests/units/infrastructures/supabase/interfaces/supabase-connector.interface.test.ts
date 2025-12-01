/* eslint-disable @typescript-eslint/unbound-method */
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/supabase/interfaces/supabase-connector.interface';
import type { ISupabaseConnector } from '@/infrastructures/supabase/interfaces/supabase-connector.interface';

describe('supabase-connector.interface', () => {
  describe('ISupabaseConnector', () => {
    it('should define getClient method signature', () => {
      const mockClient = {} as SupabaseClient;

      const mockConnector: ISupabaseConnector = {
        getClient: () => mockClient,
        getClientWithAuth: () => mockClient,
      };

      expect(mockConnector.getClient).toBeDefined();
      expect(typeof mockConnector.getClient).toBe('function');
    });

    it('should define getClientWithAuth method signature', () => {
      const mockClient = {} as SupabaseClient;

      const mockConnector: ISupabaseConnector = {
        getClient: () => mockClient,
        getClientWithAuth: (token: string) => {
          expect(token).toBeDefined();
          return mockClient;
        },
      };

      expect(mockConnector.getClientWithAuth).toBeDefined();
      expect(typeof mockConnector.getClientWithAuth).toBe('function');
    });

    it('should allow implementation with working methods', () => {
      const mockClient1 = { auth: {} } as SupabaseClient;
      const mockClient2 = { auth: {} } as SupabaseClient;

      const connector: ISupabaseConnector = {
        getClient: () => mockClient1,
        getClientWithAuth: (accessToken: string) => {
          if (!accessToken) throw new Error('Token required');
          return mockClient2;
        },
      };

      const client1 = connector.getClient();
      expect(client1).toBe(mockClient1);

      const client2 = connector.getClientWithAuth('test-token');
      expect(client2).toBe(mockClient2);

      expect(() => connector.getClientWithAuth('')).toThrow('Token required');
    });

    it('should return SupabaseClient from getClient', () => {
      const mockClient = {
        auth: {
          getUser: vi.fn(),
        },
      } as unknown as SupabaseClient;

      const connector: ISupabaseConnector = {
        getClient: () => mockClient,
        getClientWithAuth: () => mockClient,
      };

      const result = connector.getClient();
      expect(result).toHaveProperty('auth');
    });

    it('should return SupabaseClient from getClientWithAuth', () => {
      const mockClient = {
        auth: {
          signInWithOtp: vi.fn(),
        },
      } as unknown as SupabaseClient;

      const connector: ISupabaseConnector = {
        getClient: () => mockClient,
        getClientWithAuth: (token: string) => {
          expect(token).toBeTruthy();
          return mockClient;
        },
      };

      const result = connector.getClientWithAuth('valid-token');
      expect(result).toHaveProperty('auth');
    });
  });
});
