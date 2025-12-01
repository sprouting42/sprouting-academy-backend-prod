import type {
  AddCartItemInput,
  CartDto,
  CartItemDto,
  CartWithItemsDto,
  CreateCartInput,
} from '../dto';

export interface ICartRepository {
  findCartByUserId(userId: string): Promise<CartDto | null>;

  createCart(input: CreateCartInput): Promise<CartDto>;

  addCartItem(input: AddCartItemInput): Promise<CartItemDto>;

  findCartItemByCartAndCourse(
    cartId: string,
    courseId: string,
  ): Promise<CartItemDto | null>;

  deleteCartItem(itemId: string): Promise<void>;

  findCartItemById(itemId: string): Promise<CartItemDto | null>;

  getCartWithItems(cartId: string): Promise<CartWithItemsDto | null>;

  findCourseById(courseId: string): Promise<{ id: string } | null>;
}
