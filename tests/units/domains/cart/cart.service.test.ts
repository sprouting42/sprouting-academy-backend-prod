import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { ICartRepository } from '@/domains/cart/repositories/interfaces/cart.repository.interface';
import { CartService } from '@/domains/cart/services/cart.service';
import type { CartAddItemInput } from '@/domains/cart/services/dto/cart-add-item.input';
import { Language } from '@/enums/language.enum';
import type { AppLoggerService } from '@/modules/logger/services/app-logger.service';

describe('CartService', () => {
  let cartService: CartService;
  let mockLogger: Partial<AppLoggerService>;
  let mockCartRepository: Partial<ICartRepository>;

  const mockCart = {
    id: 'cart-123',
    user: 'user-123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCartItem = {
    id: 'item-123',
    cartId: 'cart-123',
    coursesId: 'course-123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCourse = {
    id: 'course-123',
    coursesTitle: 'Test Course',
    normalPrice: 1000,
    earlyBirdPricePrice: 800,
    earlyBirdPriceStartDate: null,
    earlyBirdPriceEndDate: null,
    date: null,
    courseDetailRels: [
      {
        id: 1,
        courseDetail: {
          id: 'detail-123',
          titleText: 'Test Title',
          courseBenefit: 'Test Benefit',
          classType: 'online',
          totalTimesCourse: 10,
          totalClass: 5,
          updatedAt: new Date('2025-01-01'),
          createdAt: new Date('2025-01-01'),
        },
      },
    ],
  };

  const mockCartWithItems = {
    ...mockCart,
    cartItems: [
      {
        ...mockCartItem,
        courseRelation: mockCourse,
      },
    ],
  };

  beforeEach(() => {
    mockLogger = {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
    };

    mockCartRepository = {
      findCartByUserId: vi.fn(),
      createCart: vi.fn(),
      getCartWithItems: vi.fn(),
      addCartItem: vi.fn(),
      findCartItemByCartAndCourse: vi.fn(),
      deleteCartItem: vi.fn(),
      findCartItemById: vi.fn(),
      findCourseById: vi.fn(),
    };

    cartService = new CartService(
      mockLogger as AppLoggerService,
      mockCartRepository as ICartRepository,
    );
  });

  describe('getCart', () => {
    it('should get existing cart successfully', async () => {
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(
        mockCart,
      );
      vi.spyOn(mockCartRepository, 'getCartWithItems').mockResolvedValue(
        mockCartWithItems,
      );

      const result = await cartService.getCart(Language.EN, 'user-123');

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.id).toBe('cart-123');
      expect(result.responseContent?.items).toHaveLength(1);
      expect(result.responseContent?.items[0]?.courseId).toBe('course-123');
      expect(result.responseContent?.totalPrice).toBe(1000);
      expect(result.responseContent?.itemCount).toBe(1);
    });

    it('should create cart if not exists', async () => {
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(null);
      vi.spyOn(mockCartRepository, 'createCart').mockResolvedValue(mockCart);
      vi.spyOn(mockCartRepository, 'getCartWithItems').mockResolvedValue({
        ...mockCart,
        cartItems: [],
      });

      const result = await cartService.getCart(Language.EN, 'user-123');

      expect(result.isSuccessful).toBe(true);
      expect(mockCartRepository.createCart).toHaveBeenCalledWith({
        userId: 'user-123',
      });
      expect(result.responseContent?.items).toHaveLength(0);
      expect(result.responseContent?.totalPrice).toBe(0);
    });

    it('should return error if cart not found after creation', async () => {
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(null);
      vi.spyOn(mockCartRepository, 'createCart').mockResolvedValue(mockCart);
      vi.spyOn(mockCartRepository, 'getCartWithItems').mockResolvedValue(null);

      const result = await cartService.getCart(Language.EN, 'user-123');

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toContain('Cart not found');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should calculate total price correctly with multiple items', async () => {
      const cartWithMultipleItems = {
        ...mockCart,
        cartItems: [
          {
            ...mockCartItem,
            id: 'item-1',
            coursesId: 'course-1',
            courseRelation: {
              ...mockCourse,
              id: 'course-1',
              normalPrice: 1000,
            },
          },
          {
            ...mockCartItem,
            id: 'item-2',
            coursesId: 'course-2',
            courseRelation: {
              ...mockCourse,
              id: 'course-2',
              normalPrice: 2000,
            },
          },
        ],
      };

      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(
        mockCart,
      );
      vi.spyOn(mockCartRepository, 'getCartWithItems').mockResolvedValue(
        cartWithMultipleItems,
      );

      const result = await cartService.getCart(Language.EN, 'user-123');

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.totalPrice).toBe(3000);
      expect(result.responseContent?.itemCount).toBe(2);
    });

    it('should apply early bird price when within early bird period', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow

      const cartWithEarlyBirdItem = {
        ...mockCart,
        cartItems: [
          {
            ...mockCartItem,
            courseRelation: {
              ...mockCourse,
              normalPrice: 1000,
              earlyBirdPricePrice: 800,
              earlyBirdPriceStartDate: startDate,
              earlyBirdPriceEndDate: endDate,
            },
          },
        ],
      };

      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(
        mockCart,
      );
      vi.spyOn(mockCartRepository, 'getCartWithItems').mockResolvedValue(
        cartWithEarlyBirdItem,
      );

      const result = await cartService.getCart(Language.EN, 'user-123');

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.totalPrice).toBe(800); // Early bird price
      expect(result.responseContent?.items[0]?.price).toBe(800);
    });

    it('should apply normal price when outside early bird period', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      const endDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // Day after

      const cartWithExpiredEarlyBird = {
        ...mockCart,
        cartItems: [
          {
            ...mockCartItem,
            courseRelation: {
              ...mockCourse,
              normalPrice: 1000,
              earlyBirdPricePrice: 800,
              earlyBirdPriceStartDate: startDate,
              earlyBirdPriceEndDate: endDate,
            },
          },
        ],
      };

      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(
        mockCart,
      );
      vi.spyOn(mockCartRepository, 'getCartWithItems').mockResolvedValue(
        cartWithExpiredEarlyBird,
      );

      const result = await cartService.getCart(Language.EN, 'user-123');

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.totalPrice).toBe(1000); // Normal price
      expect(result.responseContent?.items[0]?.price).toBe(1000);
    });

    it('should handle non-Error exceptions gracefully', async () => {
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockRejectedValue(
        'String error',
      );

      const result = await cartService.getCart(Language.EN, 'user-123');

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get cart',
        'String error',
      );
    });
  });

  describe('addItemToCart', () => {
    it('should add item to cart successfully', async () => {
      const input: CartAddItemInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      vi.spyOn(mockCartRepository, 'findCourseById').mockResolvedValue(
        mockCourse,
      );
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(
        mockCart,
      );
      vi.spyOn(
        mockCartRepository,
        'findCartItemByCartAndCourse',
      ).mockResolvedValue(null);
      vi.spyOn(mockCartRepository, 'addCartItem').mockResolvedValue(
        mockCartItem,
      );

      const result = await cartService.addItemToCart(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.id).toBe('item-123');
      expect(result.responseContent?.courseId).toBe('course-123');
      expect(result.responseContent?.message).toBe(
        'Item added to cart successfully',
      );
    });

    it('should create cart if not exists before adding item', async () => {
      const input: CartAddItemInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      vi.spyOn(mockCartRepository, 'findCourseById').mockResolvedValue(
        mockCourse,
      );
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(null);
      vi.spyOn(mockCartRepository, 'createCart').mockResolvedValue(mockCart);
      vi.spyOn(
        mockCartRepository,
        'findCartItemByCartAndCourse',
      ).mockResolvedValue(null);
      vi.spyOn(mockCartRepository, 'addCartItem').mockResolvedValue(
        mockCartItem,
      );

      const result = await cartService.addItemToCart(Language.EN, input);

      expect(result.isSuccessful).toBe(true);
      expect(mockCartRepository.createCart).toHaveBeenCalledWith({
        userId: 'user-123',
      });
    });

    it('should return error if item already exists in cart', async () => {
      const input: CartAddItemInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      vi.spyOn(mockCartRepository, 'findCourseById').mockResolvedValue(
        mockCourse,
      );
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(
        mockCart,
      );
      vi.spyOn(
        mockCartRepository,
        'findCartItemByCartAndCourse',
      ).mockResolvedValue(mockCartItem);

      const result = await cartService.addItemToCart(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toContain('Course already exists');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const input: CartAddItemInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      vi.spyOn(mockCartRepository, 'findCourseById').mockResolvedValue(
        mockCourse,
      );
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await cartService.addItemToCart(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return error if course not found', async () => {
      const input: CartAddItemInput = {
        userId: 'user-123',
        courseId: 'non-existent-course',
      };

      vi.spyOn(mockCartRepository, 'findCourseById').mockResolvedValue(null);

      const result = await cartService.addItemToCart(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toContain('Course not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle non-Error exceptions gracefully', async () => {
      const input: CartAddItemInput = {
        userId: 'user-123',
        courseId: 'course-123',
      };

      vi.spyOn(mockCartRepository, 'findCourseById').mockRejectedValue({
        message: 'Object error',
      });

      const result = await cartService.addItemToCart(Language.EN, input);

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to add item to cart',
        '[object Object]',
      );
    });
  });

  describe('deleteItemFromCart', () => {
    it('should delete item from cart successfully', async () => {
      vi.spyOn(mockCartRepository, 'findCartItemById').mockResolvedValue(
        mockCartItem,
      );
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(
        mockCart,
      );
      vi.spyOn(mockCartRepository, 'deleteCartItem').mockResolvedValue();

      const result = await cartService.deleteItemFromCart(
        Language.EN,
        'user-123',
        'item-123',
      );

      expect(result.isSuccessful).toBe(true);
      expect(result.responseContent?.message).toBe(
        'Item removed from cart successfully',
      );
      expect(mockCartRepository.deleteCartItem).toHaveBeenCalledWith(
        'item-123',
      );
    });

    it('should return error if item not found', async () => {
      vi.spyOn(mockCartRepository, 'findCartItemById').mockResolvedValue(null);

      const result = await cartService.deleteItemFromCart(
        Language.EN,
        'user-123',
        'non-existent',
      );

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toContain('Cart item not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error if user cart not found', async () => {
      vi.spyOn(mockCartRepository, 'findCartItemById').mockResolvedValue(
        mockCartItem,
      );
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(null);

      const result = await cartService.deleteItemFromCart(
        Language.EN,
        'user-123',
        'item-123',
      );

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toContain('Cart not found');
    });

    it('should return error if item does not belong to user cart', async () => {
      const otherCart = {
        ...mockCart,
        id: 'other-cart-123',
        user: 'other-user-123',
      };

      vi.spyOn(mockCartRepository, 'findCartItemById').mockResolvedValue(
        mockCartItem,
      );
      vi.spyOn(mockCartRepository, 'findCartByUserId').mockResolvedValue(
        otherCart,
      );

      const result = await cartService.deleteItemFromCart(
        Language.EN,
        'user-123',
        'item-123',
      );

      expect(result.isSuccessful).toBe(false);
      expect(result.errorMessage).toContain('do not have permission');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(mockCartRepository, 'findCartItemById').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await cartService.deleteItemFromCart(
        Language.EN,
        'user-123',
        'item-123',
      );

      expect(result.isSuccessful).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(CartService.TOKEN).toBeTypeOf('symbol');
      expect(CartService.TOKEN.toString()).toBe('Symbol(CartService)');
    });
  });
});
