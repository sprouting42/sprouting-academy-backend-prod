import { Expose } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class CartDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  user: string;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
