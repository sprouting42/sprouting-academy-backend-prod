import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, it, expect } from 'vitest';

import { CreateEnrollmentRequestBody } from '@/domains/enrollment/controller/contracts/create-enrollment.request';

describe('Enrollment Controller Contracts', () => {
  describe('CreateEnrollmentRequestBody', () => {
    it('should validate valid enrollment request', async () => {
      const dto = plainToClass(CreateEnrollmentRequestBody, {
        courseId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid UUID', async () => {
      const dto = plainToClass(CreateEnrollmentRequestBody, {
        courseId: 'invalid-uuid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with missing courseId', async () => {
      const dto = plainToClass(CreateEnrollmentRequestBody, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with empty string courseId', async () => {
      const dto = plainToClass(CreateEnrollmentRequestBody, {
        courseId: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
