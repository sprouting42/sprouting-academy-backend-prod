export class CartDeleteItemOutput {
  readonly message: string;

  private constructor(props: CartDeleteItemOutput) {
    Object.assign(this, props);
  }

  static create(
    input: Pick<CartDeleteItemOutput, 'message'>,
  ): CartDeleteItemOutput {
    return new CartDeleteItemOutput({
      message: input.message,
    });
  }
}
