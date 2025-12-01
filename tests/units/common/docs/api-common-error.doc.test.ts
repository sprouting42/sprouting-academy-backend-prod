import '../mocks/nest-common.mock.ts';
import './mocks/api-common-error.doc.mock';

import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { describe, expect, it } from 'vitest';

import { CommonErrorResponses } from '@/common/docs/api-common-error.doc';

describe('CommonErrorResponses', () => {
  it('should call applyDecorators', () => {
    CommonErrorResponses();

    expect(applyDecorators).toHaveBeenCalled();
  });

  it('should include ApiBadRequestResponse', () => {
    CommonErrorResponses();

    expect(ApiBadRequestResponse).toHaveBeenCalledWith({
      description: 'Invalid request data or parameters',
    });
  });

  it('should include ApiInternalServerErrorResponse', () => {
    CommonErrorResponses();

    expect(ApiInternalServerErrorResponse).toHaveBeenCalledWith({
      description: 'Unexpected server error occurred',
    });
  });

  it('should return array of decorators', () => {
    const result = CommonErrorResponses();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toContain('ApiBadRequestResponse');
    expect(result).toContain('ApiInternalServerErrorResponse');
  });

  it('should be usable as method decorator', () => {
    const decorator = CommonErrorResponses();

    expect(decorator).toBeDefined();
  });
});
