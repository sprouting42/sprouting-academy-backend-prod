import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

import { HTTP_HEADER } from '@/constants/http';
import type { Language } from '@/enums/language.enum';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/enums/language.enum';

export const CurrentLanguage = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Language => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const languageHeader = request.headers[HTTP_HEADER.LANGUAGE];
    const language =
      typeof languageHeader === 'string'
        ? languageHeader.toUpperCase()
        : undefined;

    if (SUPPORTED_LANGUAGES.includes(language as Language)) {
      return language as Language;
    }

    return DEFAULT_LANGUAGE;
  },
);
