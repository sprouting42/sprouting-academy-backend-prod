import type { ResponseOutputWithContent } from '@/common/response/response-output';
import type { CartAddItemInput } from '@/domains/cart/services/dto/cart-add-item.input';
import type { CartAddItemOutput } from '@/domains/cart/services/dto/cart-add-item.output';
import type { CartDeleteItemOutput } from '@/domains/cart/services/dto/cart-delete-item.output';
import type { CartGetOutput } from '@/domains/cart/services/dto/cart-get.output';
import type { Language } from '@/enums/language.enum';

export interface ICartService {
  getCart(
    language: Language,
    userId: string,
  ): Promise<ResponseOutputWithContent<string, CartGetOutput>>;

  addItemToCart(
    language: Language,
    input: CartAddItemInput,
  ): Promise<ResponseOutputWithContent<CartAddItemInput, CartAddItemOutput>>;

  deleteItemFromCart(
    language: Language,
    userId: string,
    itemId: string,
  ): Promise<ResponseOutputWithContent<string, CartDeleteItemOutput>>;
}
