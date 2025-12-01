import { Expose } from 'class-transformer';

export class TestDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  age: number;
}

export class TestEntity {
  id: string;
  name: string;
  age: number;
  secretField: string;
}
