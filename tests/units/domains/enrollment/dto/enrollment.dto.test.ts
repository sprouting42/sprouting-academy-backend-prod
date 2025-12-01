import { describe, it, expect } from 'vitest';

import type { CreateEnrollmentInput } from '@/domains/enrollment/services/dto/create-enrollment.input';

describe('Enrollment Service DTOs', () => {
  describe('CreateEnrollmentInput', () => {
    it('should create valid enrollment input', () => {
      const input: CreateEnrollmentInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      expect(input.userId).toBe('user-123');
      expect(input.courseId).toBe('course-123');
    });
  });
});
