import { HttpStatus } from '@nestjs/common';

import { ERROR_CODES } from '@/common/errors/error-code';
import type { ErrorDetail, ErrorDebug } from '@/common/errors/error-info';
import { ErrorCode } from '@/common/errors/types/error-code.type';
import type { Response } from '@/common/response/response';
import { ResponseContent } from '@/common/response/response-content';
import type {
  ResponseOutput,
  ResponseOutputWithRequest,
} from '@/common/response/response-output';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import type { Language } from '@/enums/language.enum';
import { EnvVariables } from '@/modules/config/dto/config.dto';
import { NanoUtil } from '@/utils/nano.util';

export abstract class BaseController {
  protected actionResponse(data: ResponseOutput): Response;

  protected actionResponse<TRequest>(
    data: ResponseOutputWithRequest<TRequest>,
  ): ResponseContent<TRequest>;

  protected actionResponse<TResponse, TRequest>(
    data: ResponseOutputWithContent<TRequest, TResponse>,
  ): ResponseContent<TResponse>;

  protected actionResponse<TResponse, TRequest>(
    data:
      | ResponseOutput
      | ResponseOutputWithRequest<TRequest>
      | ResponseOutputWithContent<TRequest, TResponse>,
  ): ResponseContent<TResponse> {
    const { type, ...getData } = data;
    if (
      (type === 'ResponseOutputWithRequest' ||
        type === 'ResponseOutputWithContent') &&
      EnvVariables.isProduction
    ) {
      const { request: _request, ...rest } = getData as
        | ResponseOutputWithRequest<TRequest>
        | ResponseOutputWithContent<TRequest, TResponse>;
      let safeerrorDetails: ErrorDebug | ErrorDetail | undefined =
        rest.errorDetails;
      if (!rest.isSuccessful && rest.errorDetails) {
        const {
          debugInfo: _debugInfo,
          debugSource: _debugSource,
          ...restWithoutDebug
        } = rest.errorDetails;
        safeerrorDetails = restWithoutDebug;
      }

      return ResponseContent.create<TResponse>({
        correlationId: NanoUtil.generateId(),
        responseDate: new Date().toISOString(),
        ...rest,
        errorDetails: safeerrorDetails,
      });
    }

    return ResponseContent.create({
      correlationId: NanoUtil.generateId(),
      responseDate: new Date().toISOString(),
      ...getData,
    });
  }

  private createErrorResponse(
    language: Language,
    ex: unknown,
    value: object,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ResponseOutputWithContent<object, unknown> {
    let errorCode = 'Error';
    if (ex instanceof Error && ex.name) {
      errorCode = ex.name;
    } else if (typeof statusCode === 'number') {
      errorCode = String(statusCode);
    }

    const errorDetails = {
      message: ex instanceof Error ? ex.message : String(ex),
      code: errorCode,
      debugInfo: ex instanceof Error ? ex?.stack !== null || '' : '',
      debugSource: ex instanceof Error ? ex?.name !== null || '' : '',
    } as ErrorDebug;

    const errorResponse = ResponseOutputWithContent.failWithContent(
      ErrorCode.create({
        code: errorDetails.code,
        message: ERROR_CODES.SYSTEM.INTERNAL_SERVER_ERROR.message,
        statusCode,
      }),
      value,
      language,
    );
    errorResponse.errorDetails = errorDetails;

    return errorResponse;
  }

  protected actionResponseError(
    language: Language,
    ex: unknown,
    value?: object,
    statusCode?: HttpStatus,
  ): Response;

  protected actionResponseError<TRequest>(
    language: Language,
    ex: unknown,
    value?: object,
    statusCode?: HttpStatus,
  ): ResponseContent<TRequest>;

  protected actionResponseError<TRequest, _TResponse>(
    language: Language,
    ex: unknown,
    value?: object,
    statusCode?: HttpStatus,
  ): ResponseContent<TRequest>;

  protected actionResponseError<TRequest, _TResponse>(
    language: Language,
    ex: unknown,
    value?: object,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ResponseContent<TRequest> {
    const errorResponse = this.createErrorResponse(
      language,
      ex,
      value ?? {},
      statusCode,
    );
    return this.actionResponse(errorResponse);
  }
}
