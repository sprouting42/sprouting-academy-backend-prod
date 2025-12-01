import type {
  CreateOrderInput,
  CreateOrderItemInput,
} from '@/domains/order/repositories/dto/order.repository.dto';
import type { OrderItemDto } from '@/infrastructures/database/dto/order-item.dto';
import type { OrderDto } from '@/infrastructures/database/dto/order.dto';

export interface IOrderRepository {
  createOrder(input: CreateOrderInput): Promise<OrderDto>;
  createOrderItem(input: CreateOrderItemInput): Promise<OrderItemDto>;
  findOneById(id: string): Promise<OrderDto | null>;
  findOrderById(orderId: string): Promise<OrderDto | null>;
  findOrderItemsByOrderId(orderId: string): Promise<OrderItemDto[]>;
  findByUserId(userId: string): Promise<OrderDto[]>;
  findCourseById(id: string): Promise<{
    id: string;
    title: string;
    price: number;
  } | null>;
  findCoursesByIds(courseIds: string[]): Promise<
    Array<{
      id: string;
      title: string;
      price: number;
    }>
  >;
  updateOrderStatus(orderId: string, status: string): Promise<OrderDto>;
}
