import type { HttpStatus } from '@nestjs/common';

import { BaseController } from '@/common/controllers/base.controller';
import type {
  ResponseOutput,
  ResponseOutputWithRequest,
  ResponseOutputWithContent,
} from '@/common/response/response-output';
import { DEFAULT_LANGUAGE, type Language } from '@/enums/language.enum';

export class TestController extends BaseController {
  public testActionResponse(data: ResponseOutput) {
    return this.actionResponse(data);
  }

  public testActionResponseWithRequest<T>(data: ResponseOutputWithRequest<T>) {
    return this.actionResponse(data);
  }

  public testActionResponseWithContent<T, R>(
    data: ResponseOutputWithContent<T, R>,
  ) {
    return this.actionResponse(data);
  }

  public testActionResponseError(
    language: Language = DEFAULT_LANGUAGE,
    ex: unknown,
    value?: object,
    statusCode?: HttpStatus,
  ) {
    return this.actionResponseError(language, ex, value, statusCode);
  }
}
