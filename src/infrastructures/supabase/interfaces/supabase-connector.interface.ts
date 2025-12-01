import type { SupabaseClient } from '@supabase/supabase-js';

export interface ISupabaseConnector {
  getClient(): SupabaseClient;

  getClientWithAuth(accessToken: string): SupabaseClient;
}
