/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ResponseOutputWithContent } from '@/common/response/response-output';
import { CartController } from '@/domains/cart/controller/cart.controller';
import type { CartAddItemInput } from '@/domains/cart/services/dto/cart-add-item.input';
import type { CartAddItemOutput } from '@/domains/cart/services/dto/cart-add-item.output';
import type { CartDeleteItemOutput } from '@/domains/cart/services/dto/cart-delete-item.output';
import type { CartGetOutput } from '@/domains/cart/services/dto/cart-get.output';
import type { ICartService } from '@/domains/cart/services/interfaces/cart.service.interface';
import { Language } from '@/enums/language.enum';
import { UserRole } from '@/infrastructures/database/enums/user-role';

// Mock BaseRepository to prevent "Class extends value undefined" error
vi.mock('@/infrastructures/database/abstracts/base.repository', () => ({
  BaseRepository: class {
    constructor(
      protected prismaModel: any,
      protected dtoClass: any,
    ) {}
  },
}));

// Mock BaseController to prevent "Cannot read properties of undefined (reading 'SYSTEM')" error
vi.mock('@/common/controllers/base.controller', () => ({
  BaseController: class {
    protected actionResponse<TResponse>(result: TResponse): TResponse {
      return result;
    }
    protected actionResponseError(
      _language: unknown,
      error: unknown,
      _input?: unknown,
    ): { isSuccessful: boolean; error: unknown } {
      return { isSuccessful: false, error };
    }
  },
}));

describe('CartController', () => {
  let controller: CartController;
  let mockCartService: ICartService;

  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    role: UserRole.STUDENT,
  };

  beforeEach(() => {
    mockCartService = {
      getCart: vi.fn(),
      addItemToCart: vi.fn(),
      deleteItemFromCart: vi.fn(),
    } as unknown as ICartService;

    controller = new CartController(mockCartService);
  });

  describe('getCart', () => {
    it('should return cart successfully', async () => {
      const mockCartData: CartGetOutput = {
        id: 'cart-123',
        items: [
          {
            id: 'item-1',
            courseId: 'course-123',
            courseTitle: 'Test Course',
            price: 1000,
            classType: 'online',
            totalTimesCourse: 10,
            totalClass: 5,
          },
        ],
        totalPrice: 1000,
        itemCount: 1,
      };

      const mockServiceResult = ResponseOutputWithContent.successWithContent<
        string,
        CartGetOutput
      >('user-123', mockCartData);

      (mockCartService.getCart as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockServiceResult,
      );

      const result = await controller.getCart(mockUser, Language.EN);

      expect(result).toBeDefined();
      expect(result.responseContent).toBeDefined();
      expect(mockCartService.getCart).toHaveBeenCalledWith(
        Language.EN,
        'user-123',
      );
    });

    it('should return empty cart when user has no items', async () => {
      const mockCartData: CartGetOutput = {
        id: 'cart-123',
        items: [],
        totalPrice: 0,
        itemCount: 0,
      };

      const mockServiceResult = ResponseOutputWithContent.successWithContent<
        string,
        CartGetOutput
      >('user-123', mockCartData);

      (mockCartService.getCart as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockServiceResult,
      );

      const result = await controller.getCart(mockUser, Language.EN);

      expect(result).toBeDefined();
      expect(result.responseContent).toBeDefined();
      expect(mockCartService.getCart).toHaveBeenCalledWith(
        Language.EN,
        'user-123',
      );
    });

    it('should handle error from service', async () => {
      const error = new Error('Database error');
      (mockCartService.getCart as ReturnType<typeof vi.fn>).mockRejectedValue(
        error,
      );

      const result = await controller.getCart(mockUser, Language.EN);

      expect(result).toBeDefined();
      expect(mockCartService.getCart).toHaveBeenCalledWith(
        Language.EN,
        'user-123',
      );
    });
  });

  describe('addItemToCart', () => {
    it('should add item to cart successfully', async () => {
      const addItemInput = { courseId: 'course-123' };
      const mockAddItemData: CartAddItemOutput = {
        id: 'item-1',
        courseId: 'course-123',
        message: 'Item added to cart successfully',
      };

      const mockServiceResult = ResponseOutputWithContent.successWithContent<
        CartAddItemInput,
        CartAddItemOutput
      >({ userId: 'user-123', courseId: 'course-123' }, mockAddItemData);

      (
        mockCartService.addItemToCart as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockServiceResult);

      const result = await controller.addItemToCart(
        mockUser,
        addItemInput,
        Language.EN,
      );

      expect(result).toBeDefined();
      expect(result.responseContent).toBeDefined();
      expect(mockCartService.addItemToCart).toHaveBeenCalledWith(Language.EN, {
        userId: 'user-123',
        courseId: 'course-123',
      });
    });

    it('should handle service errors', async () => {
      const addItemInput = { courseId: 'course-123' };
      const error = new Error('Database error');

      (
        mockCartService.addItemToCart as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const result = await controller.addItemToCart(
        mockUser,
        addItemInput,
        Language.EN,
      );

      expect(result).toBeDefined();
      expect(mockCartService.addItemToCart).toHaveBeenCalledWith(Language.EN, {
        userId: 'user-123',
        courseId: 'course-123',
      });
    });
  });

  describe('deleteItemFromCart', () => {
    it('should delete item from cart successfully', async () => {
      const itemId = 'item-1';
      const mockDeleteData: CartDeleteItemOutput = {
        message: 'Item removed from cart successfully',
      };

      const mockServiceResult = ResponseOutputWithContent.successWithContent<
        string,
        CartDeleteItemOutput
      >(itemId, mockDeleteData);

      (
        mockCartService.deleteItemFromCart as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockServiceResult);

      const result = await controller.deleteItemFromCart(
        mockUser,
        itemId,
        Language.EN,
      );

      expect(result).toBeDefined();
      expect(result.responseContent).toBeDefined();
      expect(mockCartService.deleteItemFromCart).toHaveBeenCalledWith(
        Language.EN,
        'user-123',
        'item-1',
      );
    });

    it('should handle service errors', async () => {
      const itemId = 'item-1';
      const error = new Error('Database error');

      (
        mockCartService.deleteItemFromCart as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const result = await controller.deleteItemFromCart(
        mockUser,
        itemId,
        Language.EN,
      );

      expect(result).toBeDefined();
      expect(mockCartService.deleteItemFromCart).toHaveBeenCalledWith(
        Language.EN,
        'user-123',
        'item-1',
      );
    });
  });
});
