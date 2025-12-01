import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, it, expect } from 'vitest';

import { CreateBankTransferRequestBody } from '@/domains/payment/controller/contracts/create-bank-transfer.request';
import { CreateChargeRequestBody } from '@/domains/payment/controller/contracts/create-charge.request';
import { RetrieveChargeRequestParams } from '@/domains/payment/controller/contracts/retrieve-charge.request';

describe('Payment Controller Contracts', () => {
  describe('CreateChargeRequestBody', () => {
    it('should validate valid charge request', async () => {
      const dto = plainToClass(CreateChargeRequestBody, {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
        city: 'Bangkok',
        postalCode: '10110',
        description: 'Test payment',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid UUID', async () => {
      const dto = plainToClass(CreateChargeRequestBody, {
        orderId: 'invalid-uuid',
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid card number (too short)', async () => {
      const dto = plainToClass(CreateChargeRequestBody, {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        cardNumber: '123',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with non-numeric card number', async () => {
      const dto = plainToClass(CreateChargeRequestBody, {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        cardNumber: '424242424242ABCD',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid expiration month', async () => {
      const dto = plainToClass(CreateChargeRequestBody, {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 13,
        expirationYear: 2025,
        securityCode: '123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept optional fields', async () => {
      const dto = plainToClass(CreateChargeRequestBody, {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('CreateBankTransferRequestBody', () => {
    it('should validate valid bank transfer request', async () => {
      const dto = plainToClass(CreateBankTransferRequestBody, {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid UUID', async () => {
      const dto = plainToClass(CreateBankTransferRequestBody, {
        orderId: 'not-a-uuid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('RetrieveChargeRequestParams', () => {
    it('should validate valid charge ID', async () => {
      const dto = plainToClass(RetrieveChargeRequestParams, {
        chargeId: 'chrg_test_123456',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
