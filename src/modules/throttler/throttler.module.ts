import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModule as NestThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';

import { THROTTLERS_CONFIG } from '@/constants/api';

@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (): ThrottlerModuleOptions => ({
        throttlers: THROTTLERS_CONFIG,
        errorMessage: 'Too many requests, please try again later.',
        ignoreUserAgents: [
          /googlebot/gi,
          /bingbot/gi,
          /slackbot/gi,
          /twitterbot/gi,
          /facebookexternalhit/gi,
        ],
      }),
    }),
  ],
  exports: [NestThrottlerModule],
})
export class ThrottlerModule {}
