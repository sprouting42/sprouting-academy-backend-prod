import { Expose } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class CourseDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  coursesTitle: string;

  @Expose()
  normalPrice: number | bigint;

  @Expose()
  earlyBirdPricePrice: number | bigint | null;

  @Expose()
  earlyBirdPriceStartDate: Date | null;

  @Expose()
  earlyBirdPriceEndDate: Date | null;

  @Expose()
  @IsDate()
  updatedAt: Date;

  @Expose()
  @IsDate()
  createdAt: Date;
}
