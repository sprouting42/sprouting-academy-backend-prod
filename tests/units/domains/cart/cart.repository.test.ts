import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CartRepository } from '@/domains/cart/repositories/cart.repository';
import type {
  AddCartItemInput,
  CartDto,
  CartItemDto,
  CartWithItemsDto,
  CreateCartInput,
} from '@/domains/cart/repositories/dto';
import type { CartItemRepository } from '@/infrastructures/database/repositories/cart-item.repository';
import type { CartRepository as InfraCartRepository } from '@/infrastructures/database/repositories/cart.repository';
import type { CourseRepository } from '@/infrastructures/database/repositories/course.repository';

describe('CartRepository', () => {
  let cartRepository: CartRepository;
  let mockInfraCartRepository: Partial<InfraCartRepository>;
  let mockCartItemRepository: Partial<CartItemRepository>;
  let mockCourseRepository: Partial<CourseRepository>;

  const mockCart: CartDto = {
    id: 'cart-123',
    user: 'user-123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCartItem: CartItemDto = {
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

  const mockCartWithItems: CartWithItemsDto = {
    ...mockCart,
    cartItems: [
      {
        ...mockCartItem,
        courseRelation: mockCourse,
      },
    ],
  };

  beforeEach(() => {
    mockInfraCartRepository = {
      findCartByUserId: vi.fn(),
      createCart: vi.fn(),
      getCartWithItems: vi.fn(),
    };

    mockCartItemRepository = {
      addCartItem: vi.fn(),
      findCartItemByCartAndCourse: vi.fn(),
      deleteCartItem: vi.fn(),
      findOneById: vi.fn(),
    };

    mockCourseRepository = {
      findCourseByIdSimple: vi.fn(),
    };

    cartRepository = new CartRepository(
      mockInfraCartRepository as InfraCartRepository,
      mockCartItemRepository as CartItemRepository,
      mockCourseRepository as CourseRepository,
    );
  });

  describe('findCartByUserId', () => {
    it('should find cart by userId successfully', async () => {
      const findCartSpy = vi
        .spyOn(mockInfraCartRepository as any, 'findCartByUserId')
        .mockResolvedValue(mockCart as any);

      const result = await cartRepository.findCartByUserId('user-123');

      expect(result).toEqual(mockCart);
      expect(findCartSpy).toHaveBeenCalledWith('user-123');
    });

    it('should return null when cart not found', async () => {
      vi.spyOn(
        mockInfraCartRepository as any,
        'findCartByUserId',
      ).mockResolvedValue(null as any);

      const result = await cartRepository.findCartByUserId('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createCart', () => {
    it('should create cart successfully', async () => {
      const input: CreateCartInput = {
        userId: 'user-123',
      };

      const createSpy = vi
        .spyOn(mockInfraCartRepository as any, 'createCart')
        .mockResolvedValue(mockCart as any);

      const result = await cartRepository.createCart(input);

      expect(result).toEqual(mockCart);
      expect(createSpy).toHaveBeenCalledWith(input.userId);
    });
  });

  describe('addCartItem', () => {
    it('should add item to cart successfully', async () => {
      const input: AddCartItemInput = {
        cartId: 'cart-123',
        courseId: 'course-123',
      };

      const addItemSpy = vi
        .spyOn(mockCartItemRepository as any, 'addCartItem')
        .mockResolvedValue(mockCartItem as any);

      const result = await cartRepository.addCartItem(input);

      expect(result).toEqual(mockCartItem);
      expect(addItemSpy).toHaveBeenCalledWith(input.cartId, input.courseId);
    });
  });

  describe('findCartItemByCartAndCourse', () => {
    it('should find cart item by cart and course successfully', async () => {
      const findItemSpy = vi
        .spyOn(mockCartItemRepository as any, 'findCartItemByCartAndCourse')
        .mockResolvedValue(mockCartItem as any);

      const result = await cartRepository.findCartItemByCartAndCourse(
        'cart-123',
        'course-123',
      );

      expect(result).toEqual(mockCartItem);
      expect(findItemSpy).toHaveBeenCalledWith('cart-123', 'course-123');
    });

    it('should return null when item not found', async () => {
      vi.spyOn(
        mockCartItemRepository as any,
        'findCartItemByCartAndCourse',
      ).mockResolvedValue(null as any);

      const result = await cartRepository.findCartItemByCartAndCourse(
        'cart-123',
        'non-existent',
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteCartItem', () => {
    it('should delete cart item successfully', async () => {
      const deleteSpy = vi
        .spyOn(mockCartItemRepository as any, 'deleteCartItem')
        .mockResolvedValue(undefined as any);

      await cartRepository.deleteCartItem('item-123');

      expect(deleteSpy).toHaveBeenCalledWith('item-123');
    });
  });

  describe('findCartItemById', () => {
    it('should find cart item by id successfully', async () => {
      const findByIdSpy = vi
        .spyOn(mockCartItemRepository as any, 'findOneById')
        .mockResolvedValue(mockCartItem as any);

      const result = await cartRepository.findCartItemById('item-123');

      expect(result).toEqual(mockCartItem);
      expect(findByIdSpy).toHaveBeenCalledWith('item-123');
    });

    it('should return null when item not found', async () => {
      vi.spyOn(mockCartItemRepository as any, 'findOneById').mockResolvedValue(
        null as any,
      );

      const result = await cartRepository.findCartItemById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getCartWithItems', () => {
    it('should get cart with items successfully', async () => {
      const getCartSpy = vi
        .spyOn(mockInfraCartRepository as any, 'getCartWithItems')
        .mockResolvedValue(mockCartWithItems as any);

      const result = await cartRepository.getCartWithItems('cart-123');

      expect(result).toEqual(mockCartWithItems);
      expect(getCartSpy).toHaveBeenCalledWith('cart-123');
    });

    it('should return null when cart not found', async () => {
      vi.spyOn(
        mockInfraCartRepository as any,
        'getCartWithItems',
      ).mockResolvedValue(null as any);

      const result = await cartRepository.getCartWithItems('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findCourseById', () => {
    it('should find course by id successfully', async () => {
      const mockCourseResult = { id: 'course-123' };
      const findCourseSpy = vi
        .spyOn(mockCourseRepository as any, 'findCourseByIdSimple')
        .mockResolvedValue(mockCourseResult as any);

      const result = await cartRepository.findCourseById('course-123');

      expect(result).toEqual(mockCourseResult);
      expect(findCourseSpy).toHaveBeenCalledWith('course-123');
    });

    it('should return null when course not found', async () => {
      vi.spyOn(
        mockCourseRepository as any,
        'findCourseByIdSimple',
      ).mockResolvedValue(null as any);

      const result = await cartRepository.findCourseById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('TOKEN', () => {
    it('should have a unique TOKEN symbol', () => {
      expect(CartRepository.TOKEN).toBeTypeOf('symbol');
      expect(CartRepository.TOKEN.toString()).toBe('Symbol(CartRepository)');
    });
  });
});
