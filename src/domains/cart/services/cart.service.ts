import { Inject, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@/common/errors/error-code';
import { ResponseOutputWithContent } from '@/common/response/response-output';
import { CartRepository } from '@/domains/cart/repositories/cart.repository';
import type { ICartRepository } from '@/domains/cart/repositories/interfaces/cart.repository.interface';
import type { CartAddItemInput } from '@/domains/cart/services/dto/cart-add-item.input';
import { CartAddItemOutput } from '@/domains/cart/services/dto/cart-add-item.output';
import { CartDeleteItemOutput } from '@/domains/cart/services/dto/cart-delete-item.output';
import { CartGetOutput } from '@/domains/cart/services/dto/cart-get.output';
import type { ICartService } from '@/domains/cart/services/interfaces/cart.service.interface';
import { Language } from '@/enums/language.enum';
import { AppLoggerService } from '@/modules/logger/services/app-logger.service';

@Injectable()
export class CartService implements ICartService {
  static readonly TOKEN = Symbol('CartService');

  constructor(
    private readonly logger: AppLoggerService,
    @Inject(CartRepository.TOKEN)
    private readonly cartRepository: ICartRepository,
  ) {}

  async getCart(
    language: Language,
    userId: string,
  ): Promise<ResponseOutputWithContent<string, CartGetOutput>> {
    try {
      // 1. Find or create cart
      let cart = await this.cartRepository.findCartByUserId(userId);
      cart ??= await this.cartRepository.createCart({ userId });

      // 2. Get cart with items
      const cartWithItems = await this.cartRepository.getCartWithItems(cart.id);

      if (!cartWithItems) {
        this.logger.error('Cart not found after creation');
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.CART.CART_NOT_FOUND,
          userId,
          language,
        );
      }

      // 3. Map items and calculate price based on early bird dates
      const now = new Date();
      const items = cartWithItems.cartItems.map(item => {
        const course = item.courseRelation;
        const courseDetail = course.courseDetailRels[0]?.courseDetail;
        let price = Number(course.normalPrice);

        // Check if within early bird period
        if (
          course.earlyBirdPricePrice !== null &&
          course.earlyBirdPriceStartDate !== null &&
          course.earlyBirdPriceEndDate !== null &&
          now >= course.earlyBirdPriceStartDate &&
          now <= course.earlyBirdPriceEndDate
        ) {
          price = Number(course.earlyBirdPricePrice);
        }

        return {
          id: item.id,
          courseId: item.coursesId,
          courseTitle: String(course.coursesTitle),
          courseDate: course.date ?? undefined,
          price,
          classType: courseDetail?.classType ?? undefined,
          totalTimesCourse: courseDetail?.totalTimesCourse ?? undefined,
          totalClass: courseDetail?.totalClass ?? undefined,
        };
      });

      // 4. Calculate total
      const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

      const result = CartGetOutput.create({
        id: cartWithItems.id,
        items,
        totalPrice,
        itemCount: items.length,
      });

      return ResponseOutputWithContent.successWithContent(userId, result);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to get cart', errMessage);
      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.CART.CART_NOT_FOUND,
        userId,
        language,
      );
    }
  }

  async addItemToCart(
    language: Language,
    input: CartAddItemInput,
  ): Promise<ResponseOutputWithContent<CartAddItemInput, CartAddItemOutput>> {
    try {
      // 1. Validate course exists
      const course = await this.cartRepository.findCourseById(input.courseId);
      if (!course) {
        this.logger.warn(`Course not found - courseId: ${input.courseId}`);
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.CART.COURSE_NOT_FOUND,
          input,
          language,
        );
      }

      // 2. Find or create cart
      let cart = await this.cartRepository.findCartByUserId(input.userId);
      cart ??= await this.cartRepository.createCart({ userId: input.userId });

      // 3. Check if course already in cart
      const existingItem =
        await this.cartRepository.findCartItemByCartAndCourse(
          cart.id,
          input.courseId,
        );

      if (existingItem) {
        this.logger.warn(
          `Course already in cart - userId: ${input.userId}, courseId: ${input.courseId}`,
        );
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.CART.ITEM_ALREADY_EXISTS,
          input,
          language,
        );
      }

      // 4. Add item to cart
      const cartItem = await this.cartRepository.addCartItem({
        cartId: cart.id,
        courseId: input.courseId,
      });

      const result = CartAddItemOutput.create({
        id: cartItem.id,
        courseId: input.courseId,
        message: 'Item added to cart successfully',
      });

      return ResponseOutputWithContent.successWithContent(input, result);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to add item to cart', errMessage);
      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.CART.ITEM_NOT_FOUND,
        input,
        language,
      );
    }
  }

  async deleteItemFromCart(
    language: Language,
    userId: string,
    itemId: string,
  ): Promise<ResponseOutputWithContent<string, CartDeleteItemOutput>> {
    try {
      // 1. Find the cart item
      const cartItem = await this.cartRepository.findCartItemById(itemId);

      if (!cartItem) {
        this.logger.warn(`Cart item not found - itemId: ${itemId}`);
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.CART.ITEM_NOT_FOUND,
          itemId,
          language,
        );
      }

      // 2. Find user's cart to verify ownership
      const userCart = await this.cartRepository.findCartByUserId(userId);

      if (!userCart) {
        this.logger.warn(`User cart not found - userId: ${userId}`);
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.CART.CART_NOT_FOUND,
          itemId,
          language,
        );
      }

      // 3. Verify that the item belongs to user's cart
      if (cartItem.cartId !== userCart.id) {
        this.logger.warn(
          `Unauthorized cart item deletion attempt - userId: ${userId}, itemId: ${itemId}`,
        );
        return ResponseOutputWithContent.failWithContent(
          ERROR_CODES.CART.UNAUTHORIZED_ACCESS,
          itemId,
          language,
        );
      }

      // 4. Delete the item
      await this.cartRepository.deleteCartItem(itemId);

      const result = CartDeleteItemOutput.create({
        message: 'Item removed from cart successfully',
      });

      return ResponseOutputWithContent.successWithContent(itemId, result);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to delete cart item', errMessage);
      return ResponseOutputWithContent.failWithContent(
        ERROR_CODES.CART.ITEM_NOT_FOUND,
        itemId,
        language,
      );
    }
  }
}
