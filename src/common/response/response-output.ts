import { HttpStatus } from '@nestjs/common';

import type { ErrorDebug } from '@/common/errors/error-info';
import type { ErrorCode } from '@/common/errors/types/error-code.type';
import { DEFAULT_LANGUAGE, type Language } from '@/enums/language.enum';

export class ResponseOutput {
  type = 'ResponseOutput';
  statusCode: number;
  status: string;
  errorMessage?: string;
  isSuccessful: boolean;
  errorDetails?: ErrorDebug;

  protected constructor(init?: Partial<ResponseOutput>) {
    Object.assign(this, init);
  }

  protected static getErrorMessage(
    error: ErrorCode,
    language?: Language,
  ): string {
    if (typeof error.message === 'string') {
      return error.message;
    }
    return error.getMessage(language ?? DEFAULT_LANGUAGE);
  }

  public static fail(error: ErrorCode, language?: Language) {
    const localizedMessage = this.getErrorMessage(error, language);
    return new ResponseOutput({
      statusCode: error.statusCode,
      isSuccessful: false,
      status: error.statusCode.toString(),
      errorMessage: localizedMessage,
      errorDetails: {
        message: localizedMessage,
        code: error.code,
      },
    });
  }

  public static success(statusCode: HttpStatus = HttpStatus.OK) {
    return new ResponseOutput({
      statusCode: statusCode as number,
      isSuccessful: true,
      status: statusCode.toString(),
    });
  }
}

export class ResponseOutputWithRequest<T> extends ResponseOutput {
  override type = 'ResponseOutputWithRequest';
  request?: T;

  protected constructor(init?: Partial<ResponseOutputWithRequest<T>>) {
    super(init);
    Object.assign(this, init);
  }

  public static failWithRequest<T>(
    error: ErrorCode,
    request: T,
    language?: Language,
  ): ResponseOutputWithRequest<T> {
    const localizedMessage = this.getErrorMessage(error, language);
    return new ResponseOutputWithRequest<T>({
      statusCode: error.statusCode,
      isSuccessful: false,
      status: error.statusCode.toString(),
      errorMessage: localizedMessage,
      request,
      errorDetails: {
        message: localizedMessage,
        code: error.code,
      },
    });
  }

  public static successWithRequest<T>(
    request: T,
    statusCode: HttpStatus = HttpStatus.OK,
  ): ResponseOutputWithRequest<T> {
    return new ResponseOutputWithRequest<T>({
      statusCode: statusCode as number,
      isSuccessful: true,
      status: statusCode.toString(),
      request,
    });
  }
}

export class ResponseOutputWithContent<
  T,
  R,
> extends ResponseOutputWithRequest<T> {
  override type = 'ResponseOutputWithContent';
  responseContent?: R;

  protected constructor(init?: Partial<ResponseOutputWithContent<T, R>>) {
    super(init);
    Object.assign(this, init);
  }

  public static failWithContent<T, R>(
    error: ErrorCode,
    request: T,
    language?: Language,
  ): ResponseOutputWithContent<T, R> {
    const localizedMessage = this.getErrorMessage(error, language);
    return new ResponseOutputWithContent<T, R>({
      statusCode: error.statusCode,
      isSuccessful: false,
      status: error.statusCode.toString(),
      errorMessage: localizedMessage,
      request,
      errorDetails: {
        message: localizedMessage,
        code: error.code,
      },
    });
  }

  public static successWithContent<T, R>(
    request: T,
    responseContent: R,
    statusCode: HttpStatus = HttpStatus.OK,
  ): ResponseOutputWithContent<T, R> {
    return new ResponseOutputWithContent<T, R>({
      statusCode: statusCode as number,
      isSuccessful: true,
      status: statusCode.toString(),
      request,
      responseContent,
    });
  }
}
