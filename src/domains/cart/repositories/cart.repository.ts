import { Injectable } from '@nestjs/common';

import type {
  AddCartItemInput,
  CartDto,
  CartItemDto,
  CartWithItemsDto,
  CreateCartInput,
} from '@/domains/cart/repositories/dto';
import type { ICartRepository } from '@/domains/cart/repositories/interfaces/cart.repository.interface';
import { CartItemRepository } from '@/infrastructures/database/repositories/cart-item.repository';
import { CartRepository as InfraCartRepository } from '@/infrastructures/database/repositories/cart.repository';
import { CourseRepository } from '@/infrastructures/database/repositories/course.repository';

@Injectable()
export class CartRepository implements ICartRepository {
  static readonly TOKEN = Symbol('CartRepository');

  constructor(
    private readonly cartRepository: InfraCartRepository,
    private readonly cartItemRepository: CartItemRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async findCartByUserId(userId: string): Promise<CartDto | null> {
    return this.cartRepository.findCartByUserId(userId);
  }

  async createCart(input: CreateCartInput): Promise<CartDto> {
    return this.cartRepository.createCart(input.userId);
  }

  async addCartItem(input: AddCartItemInput): Promise<CartItemDto> {
    return this.cartItemRepository.addCartItem(input.cartId, input.courseId);
  }

  async findCartItemByCartAndCourse(
    cartId: string,
    courseId: string,
  ): Promise<CartItemDto | null> {
    return this.cartItemRepository.findCartItemByCartAndCourse(
      cartId,
      courseId,
    );
  }

  async deleteCartItem(itemId: string): Promise<void> {
    await this.cartItemRepository.deleteCartItem(itemId);
  }

  async findCartItemById(itemId: string): Promise<CartItemDto | null> {
    return this.cartItemRepository.findOneById(itemId);
  }

  async getCartWithItems(cartId: string): Promise<CartWithItemsDto | null> {
    const result = (await this.cartRepository.getCartWithItems(
      cartId,
    )) as CartWithItemsDto | null;
    return result;
  }

  async findCourseById(courseId: string): Promise<{ id: string } | null> {
    return this.courseRepository.findCourseByIdSimple(courseId);
  }
}
