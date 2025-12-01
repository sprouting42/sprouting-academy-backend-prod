/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import '../mocks/nest-common.mock.ts';
import './mocks/api-ok-response.decorator.mock';

import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { describe, expect, it, type vi } from 'vitest';

import {
  ApiOkSingleResponse,
  ApiPaginatedOkResponse,
} from '@/common/decorators/api-ok-response.decorator';
import { PaginationOutput } from '@/common/pagination';
import { ResponseContent } from '@/common/response/response-content';

import { TestModel } from './mocks/api-ok-response.decorator.mock';

describe('ApiOkResponse Decorators', () => {
  describe('ApiPaginatedOkResponse', () => {
    it('should create decorator with default description', () => {
      ApiPaginatedOkResponse({ type: TestModel });

      expect(applyDecorators).toHaveBeenCalled();
      expect(ApiExtraModels).toHaveBeenCalledWith(
        ResponseContent,
        PaginationOutput,
        TestModel,
      );
      expect(ApiOkResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Paginated response',
        }),
      );
    });

    it('should create decorator with custom description', () => {
      const customDescription = 'List of test models';
      ApiPaginatedOkResponse({
        type: TestModel,
        description: customDescription,
      });

      expect(ApiOkResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          description: customDescription,
        }),
      );
    });

    it('should configure schema correctly', () => {
      ApiPaginatedOkResponse({ type: TestModel });

      const callArgs = (ApiOkResponse as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];

      expect(callArgs?.schema?.allOf).toBeDefined();
    });

    it('should use getSchemaPath for type references', () => {
      ApiPaginatedOkResponse({ type: TestModel });

      expect(getSchemaPath).toHaveBeenCalledWith(ResponseContent);
      expect(getSchemaPath).toHaveBeenCalledWith(PaginationOutput);
      expect(getSchemaPath).toHaveBeenCalledWith(TestModel);
    });

    it('should return decorators array', () => {
      const result = ApiPaginatedOkResponse({ type: TestModel });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('ApiOkSingleResponse', () => {
    it('should create decorator with default description', () => {
      ApiOkSingleResponse({ type: TestModel });

      expect(applyDecorators).toHaveBeenCalled();
      expect(ApiExtraModels).toHaveBeenCalledWith(ResponseContent, TestModel);
      expect(ApiOkResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Single object response',
        }),
      );
    });

    it('should create decorator with custom description', () => {
      const customDescription = 'Get single test model';
      ApiOkSingleResponse({
        type: TestModel,
        description: customDescription,
      });

      expect(ApiOkResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          description: customDescription,
        }),
      );
    });

    it('should configure schema correctly', () => {
      ApiOkSingleResponse({ type: TestModel });

      const callArgs = (ApiOkResponse as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];

      expect(callArgs?.schema?.allOf).toBeDefined();
    });

    it('should use getSchemaPath for type references', () => {
      ApiOkSingleResponse({ type: TestModel });

      expect(getSchemaPath).toHaveBeenCalledWith(ResponseContent);
      expect(getSchemaPath).toHaveBeenCalledWith(TestModel);
    });

    it('should return decorators array', () => {
      const result = ApiOkSingleResponse({ type: TestModel });

      expect(Array.isArray(result)).toBe(true);
    });

    it('should not include PaginationOutput in extra models', () => {
      ApiOkSingleResponse({ type: TestModel });

      const callArgs = (ApiExtraModels as ReturnType<typeof vi.fn>).mock
        .calls[0];
      expect(callArgs).not.toContain(PaginationOutput);
    });
  });

  describe('real-world usage', () => {
    class UserDto {
      id: number;
      email: string;
    }

    it('should work with different model types - paginated', () => {
      const result = ApiPaginatedOkResponse({
        type: UserDto,
        description: 'Get all users',
      });

      expect(result).toBeDefined();
      expect(ApiExtraModels).toHaveBeenCalledWith(
        ResponseContent,
        PaginationOutput,
        UserDto,
      );
    });

    it('should work with different model types - single', () => {
      const result = ApiOkSingleResponse({
        type: UserDto,
        description: 'Get user by id',
      });

      expect(result).toBeDefined();
      expect(ApiExtraModels).toHaveBeenCalledWith(ResponseContent, UserDto);
    });
  });
});
