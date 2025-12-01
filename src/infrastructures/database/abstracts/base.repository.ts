import type {
  EXCLUDE_FIELDS_WITH_CREATED,
  EXCLUDE_FIELDS_WITH_UPDATED,
} from '@/constants/database';
import { SortOrder } from '@/enums/pagination.enum';
import type {
  FindManyArgs,
  FindManyPaginatedArgs,
} from '@/infrastructures/database/dto/repository.dto';
import { PaginatedResult } from '@/infrastructures/database/dto/repository.dto';
import type { IRepository } from '@/infrastructures/database/interfaces/repository.interface';
import type { PrismaDelegate } from '@/infrastructures/database/types/repository.type';
import { MapperUtil } from '@/utils/mapper.util';
import { NanoUtil } from '@/utils/nano.util';

export abstract class BaseRepository<
  TEntity,
  TOutput,
  Delegate extends PrismaDelegate<TEntity>,
> implements IRepository<TEntity, TOutput> {
  protected constructor(
    protected readonly context: Delegate,
    protected readonly dtoClass: new () => TOutput,
  ) {}

  async findMany(data: FindManyArgs): Promise<TOutput[]> {
    const { where, orderBy } = data;
    const items = await this.context.findMany({
      where,
      orderBy: orderBy ?? { created_at: SortOrder.DESC },
    });

    return MapperUtil.mapMany<TEntity, TOutput>(this.dtoClass, items);
  }

  async findManyWithPagination(
    data: FindManyPaginatedArgs,
  ): Promise<PaginatedResult<TOutput>> {
    const { where, orderBy, pagination } = data;
    const pageNumber = pagination?.pageNumber ?? 1;
    const pageSize = pagination?.pageSize ?? 10;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const totalCount = await this.context.count?.({
      where,
    });

    const items = await this.context.findMany({
      where,
      orderBy: orderBy ?? { created_at: SortOrder.DESC },
      skip,
      take,
    });

    return PaginatedResult.create(
      MapperUtil.mapMany<TEntity, TOutput>(this.dtoClass, items),
      totalCount,
      pageNumber,
      pageSize,
    );
  }

  async findOneById(id: string): Promise<TOutput | null> {
    const item = await this.context.findUnique({
      where: { id },
    });

    if (!item) return null;

    return MapperUtil.mapper<TEntity, TOutput>(this.dtoClass, item);
  }

  async create(
    data: Omit<TEntity, (typeof EXCLUDE_FIELDS_WITH_CREATED)[number]>,
    createdBy: string,
  ): Promise<TOutput> {
    const item = await this.context.create({
      data: {
        ...data,
        id: NanoUtil.generateId(),
        created_at: new Date(),
        created_by: createdBy,
      },
    });

    return MapperUtil.mapper<TEntity, TOutput>(this.dtoClass, item);
  }

  async update(
    data: Omit<TEntity, (typeof EXCLUDE_FIELDS_WITH_UPDATED)[number]> & {
      id: string;
    },
    updatedBy: string,
  ): Promise<TOutput> {
    const { id, ...dataRest } = data;
    const item = await this.context.update({
      where: { id },
      data: {
        ...dataRest,
        updated_at: new Date(),
        updated_by: updatedBy,
      },
    });

    return MapperUtil.mapper<TEntity, TOutput>(this.dtoClass, item);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.context.count?.({
      where: {
        id,
      },
    });

    return (count ?? 0) > 0;
  }
}
