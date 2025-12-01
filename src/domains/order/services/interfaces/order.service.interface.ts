import type { ResponseOutputWithContent } from '@/common/response/response-output';
import type { CreateOrderInput } from '@/domains/order/services/dto/create-order.input';
import type { CreateOrderOutput } from '@/domains/order/services/dto/create-order.output';
import type { OrderOutput } from '@/domains/order/services/dto/order.output';
import type { Language } from '@/enums/language.enum';

export interface IOrderService {
  createOrder(
    language: Language,
    input: CreateOrderInput,
  ): Promise<ResponseOutputWithContent<CreateOrderInput, CreateOrderOutput>>;
  getOrderById(
    id: string,
    language: Language,
  ): Promise<ResponseOutputWithContent<{ id: string }, OrderOutput>>;
  getMyOrders(
    userId: string,
    language: Language,
  ): Promise<ResponseOutputWithContent<{ userId: string }, OrderOutput[]>>;
}
