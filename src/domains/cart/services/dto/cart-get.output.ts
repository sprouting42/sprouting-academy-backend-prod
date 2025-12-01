export type CartItemDto = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseDate?: Date | null;
  price: number;
  classType?: string | null;
  totalTimesCourse?: number | null;
  totalClass?: number | null;
};

export class CartGetOutput {
  readonly id: string;
  readonly items: CartItemDto[];
  readonly totalPrice: number;
  readonly itemCount: number;

  private constructor(props: CartGetOutput) {
    Object.assign(this, props);
  }

  static create(
    input: Pick<CartGetOutput, 'id' | 'items' | 'totalPrice' | 'itemCount'>,
  ): CartGetOutput {
    return new CartGetOutput({
      id: input.id,
      items: input.items,
      totalPrice: input.totalPrice,
      itemCount: input.itemCount,
    });
  }
}
