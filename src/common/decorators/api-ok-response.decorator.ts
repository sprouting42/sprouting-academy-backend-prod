import type { Type } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

import { PaginationOutput } from '@/common/pagination';
import { ResponseContent } from '@/common/response/response-content';

interface ApiOkResponseOptions<T> {
  description?: string;
  type: Type<T>;
}

export function ApiPaginatedOkResponse<TModel>(
  options: ApiOkResponseOptions<TModel>,
) {
  return applyDecorators(
    ApiExtraModels(ResponseContent, PaginationOutput, options.type),
    ApiOkResponse({
      description: options.description ?? 'Paginated response',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseContent) },
          {
            properties: {
              responseContent: {
                allOf: [
                  { $ref: getSchemaPath(PaginationOutput) },
                  {
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: getSchemaPath(options.type) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
}

export function ApiOkSingleResponse<TModel>(
  options: ApiOkResponseOptions<TModel>,
) {
  return applyDecorators(
    ApiExtraModels(ResponseContent, options.type),
    ApiOkResponse({
      description: options.description ?? 'Single object response',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseContent) },
          {
            properties: {
              responseContent: { $ref: getSchemaPath(options.type) },
            },
          },
        ],
      },
    }),
  );
}
