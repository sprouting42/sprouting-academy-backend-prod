export class CreateCartInput {
  userId: string;

  constructor(data: { userId: string }) {
    this.userId = data.userId;
  }
}
