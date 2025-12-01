import { Expose } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class CartItemDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  cartId: string;

  @Expose()
  @IsString()
  coursesId: string;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
