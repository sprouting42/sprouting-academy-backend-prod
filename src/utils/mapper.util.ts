import { plainToInstance } from 'class-transformer';

export class MapperUtil {
  public static mapper<E, D>(DtoClass: new () => D, value: Partial<E>): D {
    return plainToInstance(DtoClass, value, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  public static mapMany<E, D>(
    DtoClass: new () => D,
    values: Partial<E>[],
  ): D[] {
    return values.map(v => this.mapper(DtoClass, v));
  }
}
