import { NodeEnv } from '@/enums/node-env.enum';
import { envValidationSchema } from '@/modules/config/validation/config.validation';

export class EnvVariables {
  NODE_ENV: NodeEnv;
  PORT: number;
  JWT_SECRET: string;
  ALLOW_URL: string;
  API_VERSION: string;
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  OMISE_SECRET_KEY: string;
  OMISE_PUBLIC_KEY: string;

  private static _instance: EnvVariables | null;

  private constructor(partial: Partial<EnvVariables>) {
    Object.assign(this, partial);
  }

  public static initialize(config: Record<string, unknown>): EnvVariables {
    if (EnvVariables._instance) {
      return EnvVariables._instance;
    }

    const validationResult = envValidationSchema.validate(config, {
      allowUnknown: true,
      abortEarly: false,
    });

    if (validationResult.error) {
      throw new Error(
        `Environment validation error: ${validationResult.error.message}`,
      );
    }

    EnvVariables._instance = new EnvVariables(
      validationResult.value as EnvVariables,
    );

    return EnvVariables._instance;
  }

  public static get instance(): EnvVariables {
    if (!EnvVariables._instance) {
      throw new Error(
        'EnvVariables not initialized. Call EnvVariables.initialize first.',
      );
    }
    return EnvVariables._instance;
  }

  public static get isDevelopment(): boolean {
    return EnvVariables._instance?.NODE_ENV === NodeEnv.DEVELOPMENT;
  }

  public static get isProduction(): boolean {
    return EnvVariables._instance?.NODE_ENV === NodeEnv.PRODUCTION;
  }
}
