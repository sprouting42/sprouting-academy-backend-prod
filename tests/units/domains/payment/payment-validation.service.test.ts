import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ERROR_CODES } from '@/common/errors/error-code';
import { OMISE_MINIMUM_CHARGE_AMOUNT_THB } from '@/constants/currency';
import type { IOrderRepository } from '@/domains/order/repositories/interfaces/order.repository.interface';
import { PaymentValidationService } from '@/domains/payment/services/payment-validation.service';
import type { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import type { OrderDto } from '@/infrastructures/database/dto/order.dto';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

describe('PaymentValidationService', () => {
  let paymentValidationService: PaymentValidationService;
  let mockLogger: Partial<AppLoggerService>;
  let mockOrderRepository: Partial<IOrderRepository>;

  const mockOrder: OrderDto = {
    id: 'order-123',
    subtotalAmount: 1000,
    totalAmount: 1000,
    orderStatus: 'pending',
    couponId: null,
    userId: 'user-123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockOrderItem: OrderItemDto = {
    id: 'item-123',
    courseId: 'course-123',
    orderId: 'order-123',
    unitPrice: 1000,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockOrderRepository = {
      findOneById: vi.fn(),
      findOrderItemsByOrderId: vi.fn(),
    };

    paymentValidationService = new PaymentValidationService(
      mockLogger as AppLoggerService,
      mockOrderRepository as IOrderRepository,
    );
  });

  describe('validateAndPreparePayment', () => {
    it('should validate and prepare payment successfully', async () => {
      const input = {
        userId: 'user-123',
        orderId: 'order-123',
      };

      vi.spyOn(mockOrderRepository, 'findOneById').mockResolvedValue(mockOrder);
      vi.spyOn(
        mockOrderRepository,
        'findOrderItemsByOrderId',
      ).mockResolvedValue([mockOrderItem]);

      const result = await paymentValidationService.validateAndPreparePayment(
        input,
        input,
      );

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.order.id).toBe('order-123');
        expect(result.orderItems).toHaveLength(1);
        expect(result.finalAmount).toBe(1000);
      }
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should fail when order not found', async () => {
      const input = {
        userId: 'user-123',
        orderId: 'non-existent',
      };

      vi.spyOn(mockOrderRepository, 'findOneById').mockResolvedValue(null);

      const result = await paymentValidationService.validateAndPreparePayment(
        input,
        input,
      );

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorResponse.errorDetails?.code).toBe(
          ERROR_CODES.ORDER.ORDER_NOT_FOUND.code,
        );
      }
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should fail when order does not belong to user', async () => {
      const input = {
        userId: 'user-456',
        orderId: 'order-123',
      };

      vi.spyOn(mockOrderRepository, 'findOneById').mockResolvedValue(mockOrder);

      const result = await paymentValidationService.validateAndPreparePayment(
        input,
        input,
      );

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorResponse.errorDetails?.code).toBe(
          ERROR_CODES.ORDER.ACCESS_DENIED.code,
        );
      }
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should fail when order is not pending', async () => {
      const input = {
        userId: 'user-123',
        orderId: 'order-123',
      };

      vi.spyOn(mockOrderRepository, 'findOneById').mockResolvedValue({
        ...mockOrder,
        orderStatus: 'successful',
      });

      const result = await paymentValidationService.validateAndPreparePayment(
        input,
        input,
      );

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorResponse.errorDetails?.code).toBe(
          ERROR_CODES.ORDER.ALREADY_PROCESSED.code,
        );
      }
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should fail when order has no items', async () => {
      const input = {
        userId: 'user-123',
        orderId: 'order-123',
      };

      vi.spyOn(mockOrderRepository, 'findOneById').mockResolvedValue(mockOrder);
      vi.spyOn(
        mockOrderRepository,
        'findOrderItemsByOrderId',
      ).mockResolvedValue([]);

      const result = await paymentValidationService.validateAndPreparePayment(
        input,
        input,
      );

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorResponse.errorDetails?.code).toBe(
          ERROR_CODES.ORDER.EMPTY.code,
        );
      }
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should fail when amount is below minimum', async () => {
      const input = {
        userId: 'user-123',
        orderId: 'order-123',
      };

      const lowAmountOrder = {
        ...mockOrder,
        totalAmount: OMISE_MINIMUM_CHARGE_AMOUNT_THB - 1,
      };

      vi.spyOn(mockOrderRepository, 'findOneById').mockResolvedValue(
        lowAmountOrder,
      );
      vi.spyOn(
        mockOrderRepository,
        'findOrderItemsByOrderId',
      ).mockResolvedValue([mockOrderItem]);

      const result = await paymentValidationService.validateAndPreparePayment(
        input,
        input,
      );

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorResponse.errorDetails?.code).toBe(
          ERROR_CODES.PAYMENT.MINIMUM_AMOUNT_ERROR.code,
        );
      }
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle exact minimum amount', async () => {
      const input = {
        userId: 'user-123',
        orderId: 'order-123',
      };

      const minAmountOrder = {
        ...mockOrder,
        totalAmount: OMISE_MINIMUM_CHARGE_AMOUNT_THB,
      };

      vi.spyOn(mockOrderRepository, 'findOneById').mockResolvedValue(
        minAmountOrder,
      );
      vi.spyOn(
        mockOrderRepository,
        'findOrderItemsByOrderId',
      ).mockResolvedValue([mockOrderItem]);

      const result = await paymentValidationService.validateAndPreparePayment(
        input,
        input,
      );

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.finalAmount).toBe(OMISE_MINIMUM_CHARGE_AMOUNT_THB);
      }
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(PaymentValidationService.TOKEN).toBeTypeOf('symbol');
      expect(PaymentValidationService.TOKEN.toString()).toBe(
        'Symbol(PaymentValidationService)',
      );
    });
  });
});
