import { describe, expect, it } from 'vitest';

// Import with side effect to ensure coverage tracking
import '@/infrastructures/supabase/dto/sign-in-with-otp.dto';
import { SignInWithOtpInputDto } from '@/infrastructures/supabase/dto/sign-in-with-otp.dto';

describe('sign-in-with-otp.dto', () => {
  describe('SignInWithOtpInputDto', () => {
    it('should be defined as a class', () => {
      expect(SignInWithOtpInputDto).toBeDefined();
      expect(typeof SignInWithOtpInputDto).toBe('function');
    });

    it('should be instantiable', () => {
      const dto = new SignInWithOtpInputDto();
      expect(dto).toBeDefined();
      expect(dto).toBeInstanceOf(SignInWithOtpInputDto);
    });

    it('should have email property', () => {
      const dto = new SignInWithOtpInputDto();
      dto.email = 'test@example.com';

      expect(dto.email).toBe('test@example.com');
    });

    it('should have optional fullName property', () => {
      const dto = new SignInWithOtpInputDto();
      dto.fullName = 'John Doe';

      expect(dto.fullName).toBe('John Doe');
    });

    it('should have optional phone property', () => {
      const dto = new SignInWithOtpInputDto();
      dto.phone = '+1234567890';

      expect(dto.phone).toBe('+1234567890');
    });

    it('should allow all properties to be set', () => {
      const dto = new SignInWithOtpInputDto();
      dto.email = 'user@test.com';
      dto.fullName = 'Test User';
      dto.phone = '+9876543210';

      expect(dto.email).toBe('user@test.com');
      expect(dto.fullName).toBe('Test User');
      expect(dto.phone).toBe('+9876543210');
    });

    it('should allow optional properties to be undefined', () => {
      const dto = new SignInWithOtpInputDto();
      dto.email = 'test@example.com';

      expect(dto.email).toBe('test@example.com');
      expect(dto.fullName).toBeUndefined();
      expect(dto.phone).toBeUndefined();
    });

    it('should work with object literal', () => {
      const data: SignInWithOtpInputDto = {
        email: 'literal@test.com',
        fullName: 'Literal User',
        phone: '+1111111111',
      };

      expect(data.email).toBe('literal@test.com');
      expect(data.fullName).toBe('Literal User');
      expect(data.phone).toBe('+1111111111');
    });

    it('should work with partial object literal', () => {
      const data: SignInWithOtpInputDto = {
        email: 'partial@test.com',
      };

      expect(data.email).toBe('partial@test.com');
      expect(data.fullName).toBeUndefined();
      expect(data.phone).toBeUndefined();
    });
  });
});
