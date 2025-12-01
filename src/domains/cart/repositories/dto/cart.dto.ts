export class CartDto {
  id: string;
  user: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    user: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.user = data.user;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
