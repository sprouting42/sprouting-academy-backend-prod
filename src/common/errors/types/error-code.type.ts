import type { HttpStatus } from '@nestjs/common';

import { Language } from '@/enums/language.enum';

export type LocalizedMessage = Record<Language, string>;

export class ErrorCode {
  code: string;
  message: string | LocalizedMessage;
  statusCode: HttpStatus;

  private constructor(data: Partial<ErrorCode>) {
    Object.assign(this, data);
  }

  static create(data: Partial<ErrorCode>): ErrorCode {
    return new ErrorCode(data);
  }

  /**
   * Get the message for a specific language
   * @param language - The language to get the message for
   * @returns The localized message or the string message if not localized
   */
  getMessage(language: Language): string {
    if (typeof this.message === 'string') {
      return this.message;
    }
    switch (language) {
      case Language.EN:
        return this.message[Language.EN];
      case Language.TH:
        return this.message[Language.TH];
      default:
        return '';
    }
  }
}
