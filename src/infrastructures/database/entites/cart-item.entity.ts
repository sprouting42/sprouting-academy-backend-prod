import { BaseEntity } from '@/infrastructures/database/abstracts/base.entity';

export class CartItemEntity extends BaseEntity {
  cartId: string;
  coursesId: string;
}
