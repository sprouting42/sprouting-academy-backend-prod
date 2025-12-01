/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import {
  AUTH_CONFIG,
  AUTH_CONFIG_WITHOUT_REFRESH,
} from '@/infrastructures/supabase/constants/auth-config';
import { ISupabaseConnector } from '@/infrastructures/supabase/interfaces/supabase-connector.interface';
import { EnvVariables } from '@/modules/config/dto/config.dto';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

@Injectable()
export class SupabaseConnector implements ISupabaseConnector, OnModuleInit {
  static readonly TOKEN = Symbol('SupabaseConnector');
  private supabaseClient!: SupabaseClient;

  constructor(private readonly logger: AppLoggerService) {}

  onModuleInit(): void {
    try {
      this.initializeClient();
      this.logger.log(
        'Supabase client initialized successfully',
        SupabaseConnector.name,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stackTrace = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to initialize Supabase client: ${errorMessage}`,
        stackTrace,
        SupabaseConnector.name,
      );
      throw error;
    }
  }

  /**
   * Get Supabase client instance
   * Uses service account credentials
   * @returns SupabaseClient instance
   * @throws InternalServerErrorException if client is not initialized
   */
  getClient(): SupabaseClient {
    if (this.supabaseClient === undefined || this.supabaseClient === null) {
      const error = 'Supabase client not initialized';
      this.logger.error(error, undefined, SupabaseConnector.name);
      throw new InternalServerErrorException(error);
    }

    return this.supabaseClient;
  }

  /**
   * Get Supabase client with specific access token
   * Used for user-specific operations with Row Level Security (RLS)
   * @param accessToken - User's JWT access token
   * @returns SupabaseClient instance with user context
   * @throws InternalServerErrorException if credentials are missing or client creation fails
   */
  getClientWithAuth(accessToken: string): SupabaseClient {
    this.logger.debug(
      'Creating authenticated Supabase client',
      SupabaseConnector.name,
    );

    if (!accessToken || accessToken.trim() === '') {
      const error = 'Access token must be provided';
      this.logger.warn(error, SupabaseConnector.name);
      throw new InternalServerErrorException(error);
    }

    const { supabaseUrl, supabaseAnonKey } = this.getCredentials();

    try {
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: AUTH_CONFIG_WITHOUT_REFRESH,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to create authenticated client: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        SupabaseConnector.name,
      );
      throw new InternalServerErrorException(
        `Failed to create authenticated Supabase client: ${errorMessage}`,
      );
    }
  }

  /**
   * Initialize the main Supabase client
   * @private
   * @throws Error if credentials are missing
   */
  private initializeClient(): void {
    const { supabaseUrl, supabaseAnonKey } = this.getCredentials();

    this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: AUTH_CONFIG,
    });
  }

  /**
   * Get and validate Supabase credentials from environment
   * @private
   * @returns Object containing supabaseUrl and supabaseAnonKey
   * @throws Error if credentials are missing or empty
   */
  private getCredentials(): { supabaseUrl: string; supabaseAnonKey: string } {
    const supabaseUrl = EnvVariables.instance.SUPABASE_URL;
    const supabaseAnonKey = EnvVariables.instance.SUPABASE_ANON_KEY;

    if (!supabaseUrl || supabaseUrl.trim() === '') {
      throw new Error('SUPABASE_URL environment variable is required');
    }

    if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
      throw new Error('SUPABASE_ANON_KEY environment variable is required');
    }

    return { supabaseUrl, supabaseAnonKey };
  }
}
