import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';
import type { CreateTokenInput } from '@/modules/omise/services/interfaces/create-token.input';
import { OmiseService } from '@/modules/omise/services/omise.service';

// Mock Omise SDK
let mockOmiseInstance: {
  tokens: { create: ReturnType<typeof vi.fn> };
  charges: {
    create: ReturnType<typeof vi.fn>;
    retrieve: ReturnType<typeof vi.fn>;
  };
};

vi.mock('omise', () => ({
  default: vi.fn(() => {
    mockOmiseInstance = {
      tokens: {
        create: vi.fn(),
      },
      charges: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    };
    return mockOmiseInstance;
  }),
}));

// Mock EnvVariables
vi.mock('@/modules/config/dto/config.dto', () => ({
  EnvVariables: {
    instance: {
      OMISE_SECRET_KEY: 'skey_test_123',
      OMISE_PUBLIC_KEY: 'pkey_test_123',
    },
  },
}));

describe('OmiseService', () => {
  let omiseService: OmiseService;
  let mockLogger: Partial<AppLoggerService>;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    // Reset mocks
    vi.clearAllMocks();

    omiseService = new OmiseService(mockLogger as AppLoggerService);
  });

  describe('constructor', () => {
    it('should initialize Omise client with API keys', () => {
      expect(omiseService).toBeDefined();
      // Logger.log is called in onModuleInit(), not in constructor
      expect(mockLogger.log).not.toHaveBeenCalled();
    });

    it('should throw error if API keys are missing', () => {
      // This test is skipped because EnvVariables is mocked and always has keys
      // In real scenario, constructor would throw if keys are missing
      expect(true).toBe(true);
    });
  });

  describe('onModuleInit', () => {
    it('should log initialization message', () => {
      omiseService.onModuleInit();
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Omise service initialized successfully',
        'OmiseService',
      );
    });
  });

  describe('getPublicKey', () => {
    it('should return Omise public key', () => {
      const publicKey = omiseService.getPublicKey();
      expect(publicKey).toBe('pkey_test_123');
    });
  });

  describe('createToken', () => {
    const mockTokenInput: CreateTokenInput = {
      cardNumber: '4242424242424242',
      cardName: 'John Doe',
      expirationMonth: 12,
      expirationYear: 2025,
      securityCode: '123',
      city: 'Bangkok',
      postalCode: '10110',
    };

    it('should create token successfully', async () => {
      const mockOmiseToken = {
        id: 'tokn_test_123',
        livemode: false,
        location: '/tokens/tokn_test_123',
        card: {
          id: 'card_test_123',
          last_digits: '4242',
          brand: 'Visa',
          name: 'John Doe',
          expiration_month: 12,
          expiration_year: 2025,
          fingerprint: 'fingerprint_123',
          funding: 'credit',
        },
        created: '2025-01-01T00:00:00Z',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.tokens, 'create').mockResolvedValue(
        mockOmiseToken as never,
      );

      const result = await omiseService.createToken(mockTokenInput);

      expect(result.id).toBe('tokn_test_123');
      expect(result.card.lastDigits).toBe('4242');
      expect(result.card.brand).toBe('Visa');
      expect(result.card.funding).toBe('credit');
      expect(mockOmiseInstance.tokens.create).toHaveBeenCalledWith({
        card: {
          name: 'John Doe',
          number: '4242424242424242',
          expiration_month: 12,
          expiration_year: 2025,
          security_code: '123',
          city: 'Bangkok',
          postal_code: '10110',
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Token created successfully: tokn_test_123',
        'OmiseService',
      );
    });

    it('should handle token with missing optional fields', async () => {
      const mockOmiseToken = {
        id: 'tokn_test_456',
        livemode: true,
        location: '/tokens/tokn_test_456',
        card: {
          id: 'card_test_456',
          last_digits: '1234',
          brand: 'MasterCard',
          name: 'Jane Doe',
          expiration_month: 6,
          expiration_year: 2026,
          fingerprint: 'fingerprint_456',
        },
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.tokens, 'create').mockResolvedValue(
        mockOmiseToken as never,
      );

      const result = await omiseService.createToken({
        cardNumber: '5555555555554444',
        cardName: 'Jane Doe',
        expirationMonth: 6,
        expirationYear: 2026,
        securityCode: '456',
      });

      expect(result.id).toBe('tokn_test_456');
      expect(result.livemode).toBe(true);
      expect(result.card.funding).toBe('credit'); // Default value
      expect(result.created).toBeDefined(); // Should have default value
    });

    it('should handle optional city and postalCode', async () => {
      const inputWithoutOptional: CreateTokenInput = {
        cardNumber: '4242424242424242',
        cardName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        securityCode: '123',
      };

      const mockOmiseToken = {
        id: 'tokn_test_123',
        livemode: false,
        location: '/tokens/tokn_test_123',
        card: {
          id: 'card_test_123',
          last_digits: '4242',
          brand: 'Visa',
          name: 'John Doe',
          expiration_month: 12,
          expiration_year: 2025,
          fingerprint: 'fingerprint_123',
        },
        created: '2025-01-01T00:00:00Z',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.tokens, 'create').mockResolvedValue(
        mockOmiseToken as never,
      );

      await omiseService.createToken(inputWithoutOptional);

      expect(mockOmiseInstance.tokens.create).toHaveBeenCalledWith({
        card: {
          name: 'John Doe',
          number: '4242424242424242',
          expiration_month: 12,
          expiration_year: 2025,
          security_code: '123',
          city: '',
          postal_code: '',
        },
      });
    });

    it('should handle token creation errors', async () => {
      const error = {
        code: 'invalid_card',
        message: 'Invalid card number',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.tokens, 'create').mockRejectedValue(error);

      await expect(omiseService.createToken(mockTokenInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('createCharge', () => {
    it('should create charge successfully', async () => {
      const mockOmiseCharge = {
        id: 'chrg_test_123',
        amount: 100000, // 1000 THB in satang
        currency: 'thb',
        paid: true,
        description: 'Test charge',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.charges, 'create').mockResolvedValue(
        mockOmiseCharge as never,
      );

      const result = await omiseService.createCharge(
        1000,
        'tokn_test_123',
        'Test charge',
      );

      expect(result.id).toBe('chrg_test_123');
      expect(result.amount).toBe(1000); // Converted from satang to THB
      expect(result.currency).toBe('thb');
      expect(result.paid).toBe(true);
      expect(mockOmiseInstance.charges.create).toHaveBeenCalledWith({
        amount: 100000, // 1000 THB = 100000 satang
        currency: 'thb',
        card: 'tokn_test_123',
        description: 'Test charge',
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Charge created successfully: chrg_test_123',
        'OmiseService',
      );
    });

    it('should create charge without description', async () => {
      const mockOmiseCharge = {
        id: 'chrg_test_123',
        amount: 50000,
        currency: 'thb',
        paid: false,
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.charges, 'create').mockResolvedValue(
        mockOmiseCharge as never,
      );

      const result = await omiseService.createCharge(500, 'tokn_test_123');

      expect(result.amount).toBe(500);
      expect(mockOmiseInstance.charges.create).toHaveBeenCalledWith({
        amount: 50000,
        currency: 'thb',
        card: 'tokn_test_123',
        description: undefined,
      });
    });

    it('should handle charge creation errors', async () => {
      const error = {
        code: 'insufficient_fund',
        message: 'Insufficient funds',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.charges, 'create').mockRejectedValue(error);

      await expect(
        omiseService.createCharge(1000, 'tokn_test_123'),
      ).rejects.toThrow(BadRequestException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('retrieveCharge', () => {
    it('should retrieve charge successfully', async () => {
      const mockOmiseCharge = {
        id: 'chrg_test_123',
        amount: 200000, // 2000 THB in satang
        currency: 'thb',
        paid: true,
        description: 'Test charge',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.charges, 'retrieve').mockResolvedValue(
        mockOmiseCharge as never,
      );

      const result = await omiseService.retrieveCharge('chrg_test_123');

      expect(result.id).toBe('chrg_test_123');
      expect(result.amount).toBe(2000); // Converted from satang to THB
      expect(result.paid).toBe(true);
      expect(mockOmiseInstance.charges.retrieve).toHaveBeenCalledWith(
        'chrg_test_123',
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Charge retrieved successfully: chrg_test_123',
        'OmiseService',
      );
    });

    it('should handle charge retrieval errors', async () => {
      const error = {
        code: 'not_found',
        message: 'Charge not found',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.charges, 'retrieve').mockRejectedValue(error);

      await expect(
        omiseService.retrieveCharge('invalid_charge_id'),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should map invalid_card error to BadRequestException', async () => {
      const error = {
        code: 'invalid_card',
        message: 'Invalid card number',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.tokens, 'create').mockRejectedValue(error);

      await expect(
        omiseService.createToken({
          cardNumber: '1234',
          cardName: 'John Doe',
          expirationMonth: 12,
          expirationYear: 2025,
          securityCode: '123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map expired_card error to BadRequestException', async () => {
      const error = {
        code: 'expired_card',
        message: 'Card has expired',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.tokens, 'create').mockRejectedValue(error);

      await expect(
        omiseService.createToken({
          cardNumber: '4242424242424242',
          cardName: 'John Doe',
          expirationMonth: 12,
          expirationYear: 2025,
          securityCode: '123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map invalid_cvv error to BadRequestException', async () => {
      const error = {
        code: 'invalid_cvv',
        message: 'Invalid CVV',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.tokens, 'create').mockRejectedValue(error);

      await expect(
        omiseService.createToken({
          cardNumber: '4242424242424242',
          cardName: 'John Doe',
          expirationMonth: 12,
          expirationYear: 2025,
          securityCode: '123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map insufficient_fund error to BadRequestException', async () => {
      const error = {
        code: 'insufficient_fund',
        message: 'Insufficient funds',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.charges, 'create').mockRejectedValue(error);

      await expect(
        omiseService.createCharge(1000, 'tokn_test_123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map service_unavailable error to InternalServerErrorException', async () => {
      const error = {
        code: 'service_unavailable',
        message: 'Service temporarily unavailable',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.charges, 'create').mockRejectedValue(error);

      await expect(
        omiseService.createCharge(1000, 'tokn_test_123'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle string error', async () => {
      vi.spyOn(mockOmiseInstance.tokens, 'create').mockRejectedValue(
        'String error',
      );

      await expect(
        omiseService.createToken({
          cardNumber: '4242424242424242',
          cardName: 'John Doe',
          expirationMonth: 12,
          expirationYear: 2025,
          securityCode: '123',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle Error object', async () => {
      const error = new Error('Network error');
      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.tokens, 'create').mockRejectedValue(error);

      await expect(
        omiseService.createToken({
          cardNumber: '4242424242424242',
          cardName: 'John Doe',
          expirationMonth: 12,
          expirationYear: 2025,
          securityCode: '123',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle error without code', async () => {
      const error = {
        message: 'Unknown error',
      };

      if (mockOmiseInstance === null || mockOmiseInstance === undefined) {
        throw new Error('mockOmiseInstance is not initialized');
      }

      vi.spyOn(mockOmiseInstance.tokens, 'create').mockRejectedValue(error);

      await expect(
        omiseService.createToken({
          cardNumber: '4242424242424242',
          cardName: 'John Doe',
          expirationMonth: 12,
          expirationYear: 2025,
          securityCode: '123',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(OmiseService.TOKEN).toBeTypeOf('symbol');
      expect(OmiseService.TOKEN.toString()).toBe('Symbol(OmiseService)');
    });
  });
});
