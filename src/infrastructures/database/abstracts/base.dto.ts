import { Expose, Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class BaseDatabaseDto {
  @Expose()
  @IsString()
  @IsUUID()
  id: string;

  @Expose()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
