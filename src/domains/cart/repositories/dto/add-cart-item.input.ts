export class AddCartItemInput {
  cartId: string;
  courseId: string;

  constructor(data: { cartId: string; courseId: string }) {
    this.cartId = data.cartId;
    this.courseId = data.courseId;
  }
}
