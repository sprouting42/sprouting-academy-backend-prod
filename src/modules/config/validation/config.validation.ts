import Joi from 'joi';

import { DEFAULT_NODE_ENV } from '@/constants/node-env';
import { NodeEnv } from '@/enums/node-env.enum';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .required(),
  PORT: Joi.number().min(1).max(65535).default(DEFAULT_NODE_ENV.PORT),
  ALLOW_URL: Joi.string().default(DEFAULT_NODE_ENV.ALLOW_URL),
  API_VERSION: Joi.string().default(DEFAULT_NODE_ENV.API_VERSION),
  JWT_SECRET: Joi.string().optional(),
  DATABASE_URL: Joi.string().required(),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  OMISE_SECRET_KEY: Joi.string().required(),
  OMISE_PUBLIC_KEY: Joi.string().required(),
});
