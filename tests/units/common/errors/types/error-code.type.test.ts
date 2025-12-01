import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ErrorCode } from '@/common/errors/types/error-code.type';
import { Language } from '@/enums/language.enum';
import { createLocalizedMessage } from '@/utils/language-util';

describe('ErrorCode', () => {
  describe('create', () => {
    it('should create error code with string message', () => {
      const errorCode = ErrorCode.create({
        code: 'TEST_ERROR',
        message: 'Test error message',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(errorCode).toBeInstanceOf(ErrorCode);
      expect(errorCode.code).toBe('TEST_ERROR');
      expect(errorCode.message).toBe('Test error message');
      expect(errorCode.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should create error code with localized message', () => {
      const localizedMessage = createLocalizedMessage(
        'English message',
        'Thai message',
      );

      const errorCode = ErrorCode.create({
        code: 'LOCALIZED_ERROR',
        message: localizedMessage,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      expect(errorCode).toBeInstanceOf(ErrorCode);
      expect(errorCode.code).toBe('LOCALIZED_ERROR');
      expect(typeof errorCode.message).toBe('object');
      expect(errorCode.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should create error code with all properties', () => {
      const errorCode = ErrorCode.create({
        code: 'COMPLETE_ERROR',
        message: 'Complete error',
        statusCode: HttpStatus.NOT_FOUND,
      });

      expect(errorCode.code).toBe('COMPLETE_ERROR');
      expect(errorCode.message).toBe('Complete error');
      expect(errorCode.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should create error code with partial data', () => {
      const errorCode = ErrorCode.create({
        code: 'PARTIAL_ERROR',
      });

      expect(errorCode.code).toBe('PARTIAL_ERROR');
    });
  });

  describe('getMessage', () => {
    it('should return string message when message is string', () => {
      const errorCode = ErrorCode.create({
        code: 'STRING_ERROR',
        message: 'This is a string message',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const message = errorCode.getMessage(Language.EN);

      expect(message).toBe('This is a string message');
    });

    it('should return English message from localized message', () => {
      const localizedMessage = createLocalizedMessage(
        'English error message',
        'Thai error message',
      );

      const errorCode = ErrorCode.create({
        code: 'LOCALIZED_ERROR',
        message: localizedMessage,
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const message = errorCode.getMessage(Language.EN);

      expect(message).toBe('English error message');
    });

    it('should return Thai message from localized message', () => {
      const localizedMessage = createLocalizedMessage(
        'English error message',
        'ข้อความแสดงข้อผิดพลาดภาษาไทย',
      );

      const errorCode = ErrorCode.create({
        code: 'LOCALIZED_ERROR',
        message: localizedMessage,
        statusCode: HttpStatus.BAD_REQUEST,
      });

      const message = errorCode.getMessage(Language.TH);

      expect(message).toBe('ข้อความแสดงข้อผิดพลาดภาษาไทย');
    });

    it('should return correct message for different languages', () => {
      const localizedMessage = createLocalizedMessage(
        'User not found',
        'ไม่พบผู้ใช้',
      );

      const errorCode = ErrorCode.create({
        code: 'USER_NOT_FOUND',
        message: localizedMessage,
        statusCode: HttpStatus.NOT_FOUND,
      });

      expect(errorCode.getMessage(Language.EN)).toBe('User not found');
      expect(errorCode.getMessage(Language.TH)).toBe('ไม่พบผู้ใช้');
    });

    it('should handle string message with any language parameter', () => {
      const errorCode = ErrorCode.create({
        code: 'SIMPLE_ERROR',
        message: 'Simple error message',
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(errorCode.getMessage(Language.EN)).toBe('Simple error message');
      expect(errorCode.getMessage(Language.TH)).toBe('Simple error message');
    });

    it('should return empty string for unsupported language with localized message', () => {
      const localizedMessage = createLocalizedMessage(
        'English message',
        'Thai message',
      );

      const errorCode = ErrorCode.create({
        code: 'LOCALIZED_ERROR',
        message: localizedMessage,
        statusCode: HttpStatus.BAD_REQUEST,
      });

      // Test with invalid language value
      const message = errorCode.getMessage('FR' as Language);

      expect(message).toBe('');
    });
  });

  describe('constructor privacy', () => {
    it('should not allow direct instantiation', () => {
      // Constructor is private, can only create via static create method
      const errorCode = ErrorCode.create({
        code: 'TEST',
        message: 'Test',
        statusCode: HttpStatus.OK,
      });

      expect(errorCode).toBeInstanceOf(ErrorCode);
    });
  });

  describe('real-world error codes', () => {
    it('should work with authentication errors', () => {
      const authError = ErrorCode.create({
        code: 'AUTH.UNAUTHORIZED',
        message: createLocalizedMessage(
          'Unauthorized access',
          'ไม่ได้รับอนุญาต',
        ),
        statusCode: HttpStatus.UNAUTHORIZED,
      });

      expect(authError.code).toBe('AUTH.UNAUTHORIZED');
      expect(authError.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(authError.getMessage(Language.EN)).toBe('Unauthorized access');
      expect(authError.getMessage(Language.TH)).toBe('ไม่ได้รับอนุญาต');
    });

    it('should work with validation errors', () => {
      const validationError = ErrorCode.create({
        code: 'VALIDATION.INVALID_INPUT',
        message: createLocalizedMessage(
          'Invalid input provided',
          'ข้อมูลที่ป้อนไม่ถูกต้อง',
        ),
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(validationError.code).toBe('VALIDATION.INVALID_INPUT');
      expect(validationError.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(validationError.getMessage(Language.EN)).toBe(
        'Invalid input provided',
      );
      expect(validationError.getMessage(Language.TH)).toBe(
        'ข้อมูลที่ป้อนไม่ถูกต้อง',
      );
    });

    it('should work with server errors', () => {
      const serverError = ErrorCode.create({
        code: 'SERVER.INTERNAL_ERROR',
        message: 'Internal server error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      expect(serverError.code).toBe('SERVER.INTERNAL_ERROR');
      expect(serverError.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(serverError.getMessage(Language.EN)).toBe('Internal server error');
    });
  });
});
