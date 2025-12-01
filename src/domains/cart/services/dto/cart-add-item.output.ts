export class CartAddItemOutput {
  readonly id: string;
  readonly courseId: string;
  readonly message: string;

  private constructor(props: CartAddItemOutput) {
    Object.assign(this, props);
  }

  static create(
    input: Pick<CartAddItemOutput, 'id' | 'courseId' | 'message'>,
  ): CartAddItemOutput {
    return new CartAddItemOutput({
      id: input.id,
      courseId: input.courseId,
      message: input.message,
    });
  }
}
