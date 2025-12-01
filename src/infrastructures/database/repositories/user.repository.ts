import { Injectable, Scope } from '@nestjs/common';

import { BaseRepository } from '@/infrastructures/database/abstracts/base.repository';
import { UserDto } from '@/infrastructures/database/dto/user.dto';
import { UserEntity } from '@/infrastructures/database/entites/user.entity';
import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { MapperUtil } from '@/utils/mapper.util';

@Injectable({ scope: Scope.REQUEST })
export class UserRepository extends BaseRepository<
  UserEntity,
  UserDto,
  PrismaDatabase['user']
> {
  static readonly TOKEN = Symbol('UserRepository');
  constructor(private readonly db: PrismaDatabase) {
    super(db.user, UserDto);
  }

  // Override findOneById because User model doesn't have soft delete fields
  override async findOneById(id: string): Promise<UserDto | null> {
    const item = await this.db.user.findUnique({
      where: { id },
    });

    if (!item) return null;

    return MapperUtil.mapper<UserEntity, UserDto>(UserDto, item);
  }

  // Override findMany because User model doesn't have soft delete fields
  override async findMany(data: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
  }): Promise<UserDto[]> {
    const { where, orderBy } = data;
    const items = await this.db.user.findMany({
      where: where as never,
      orderBy: orderBy as never,
    });

    return MapperUtil.mapMany<UserEntity, UserDto>(UserDto, items);
  }

  async createWithId(
    data: UserEntity & { id: string },
    _createdBy: string,
  ): Promise<UserDto> {
    const { id, createdAt, updatedAt, ...restData } = data;
    const item = await this.db.user.create({
      data: {
        ...restData,
        id,
        createdAt: createdAt ?? new Date(),
        updatedAt: updatedAt ?? new Date(),
      },
    });

    return MapperUtil.mapper<UserEntity, UserDto>(UserDto, item);
  }
}
