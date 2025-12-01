import type {
  EXCLUDE_FIELDS_WITH_CREATED,
  EXCLUDE_FIELDS_WITH_UPDATED,
} from '@/constants/database';
import type {
  FindManyArgs,
  FindManyPaginatedArgs,
  PaginatedResult,
} from '@/infrastructures/database/dto/repository.dto';

export interface IRepository<TEntity, TOutput> {
  findMany(data: FindManyArgs): Promise<TOutput[]>;

  findManyWithPagination(
    data: FindManyPaginatedArgs,
  ): Promise<PaginatedResult<TOutput>>;

  findOneById(id: string): Promise<TOutput | null>;

  create(
    data: Omit<TEntity, (typeof EXCLUDE_FIELDS_WITH_CREATED)[number]>,
    createdBy: string,
  ): Promise<TOutput>;

  update(
    data: Omit<TEntity, (typeof EXCLUDE_FIELDS_WITH_UPDATED)[number]> & {
      id: string;
    },
    updatedBy: string,
  ): Promise<TOutput>;

  exists(id: string): Promise<boolean>;
}
