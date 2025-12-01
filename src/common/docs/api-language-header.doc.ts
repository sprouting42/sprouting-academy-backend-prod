import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

import { ApiHeader as ApiHeaderConfig } from '@/constants/api';
import { SUPPORTED_LANGUAGES } from '@/enums/language.enum';

export function ApiDocLanguageHeader() {
  return applyDecorators(
    ApiHeader({
      name: ApiHeaderConfig.LANGUAGE.name,
      description: ApiHeaderConfig.LANGUAGE.description,
      required: ApiHeaderConfig.LANGUAGE.required,
      schema: {
        type: 'string',
        enum: [...SUPPORTED_LANGUAGES],
      },
    }),
  );
}
