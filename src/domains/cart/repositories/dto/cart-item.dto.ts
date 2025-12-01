export class CartItemDto {
  id: string;
  cartId: string;
  coursesId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    cartId: string;
    coursesId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.cartId = data.cartId;
    this.coursesId = data.coursesId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
