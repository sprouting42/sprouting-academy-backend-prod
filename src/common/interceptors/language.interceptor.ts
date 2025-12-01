import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';

import { HTTP_HEADER } from '@/constants/http';
import {
  DEFAULT_LANGUAGE,
  Language,
  SUPPORTED_LANGUAGES,
} from '@/enums/language.enum';

/**
 * Extended Request interface with language property
 */
interface RequestWithLanguage extends Request {
  language: Language;
}

/**
 * Interceptor to normalize the X-LANGUAGE header
 * - Validates the language value
 * - Sets default to EN if missing or invalid
 * - Converts to uppercase for consistency
 */
@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithLanguage>();
    const languageHeader = request.headers[HTTP_HEADER.LANGUAGE];
    const language =
      typeof languageHeader === 'string'
        ? languageHeader.toUpperCase()
        : undefined;

    if (SUPPORTED_LANGUAGES.includes(language as Language)) {
      request.headers[HTTP_HEADER.LANGUAGE] = language;
      request.language = language as Language;
    } else {
      request.headers[HTTP_HEADER.LANGUAGE] = DEFAULT_LANGUAGE;
      request.language = DEFAULT_LANGUAGE;
    }

    return next.handle();
  }
}
