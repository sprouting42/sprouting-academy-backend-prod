import { Injectable, Scope } from '@nestjs/common';

import { BaseRepository } from '@/infrastructures/database/abstracts/base.repository';
import { CartItemDto } from '@/infrastructures/database/dto/cart-item.dto';
import { CartItemEntity } from '@/infrastructures/database/entites/cart-item.entity';
import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { MapperUtil } from '@/utils/mapper.util';

@Injectable({ scope: Scope.REQUEST })
export class CartItemRepository extends BaseRepository<
  CartItemEntity,
  CartItemDto,
  PrismaDatabase['cartItem']
> {
  static readonly TOKEN = Symbol('CartItemRepository');
  constructor(private readonly db: PrismaDatabase) {
    super(db.cartItem, CartItemDto);
  }

  // Override findOneById because CartItem model doesn't have soft delete fields
  override async findOneById(id: string): Promise<CartItemDto | null> {
    const item = await this.db.cartItem.findUnique({
      where: { id },
    });

    if (!item) return null;

    return MapperUtil.mapper<CartItemEntity, CartItemDto>(CartItemDto, item);
  }

  // Override findMany because CartItem model doesn't have soft delete fields
  override async findMany(data: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
  }): Promise<CartItemDto[]> {
    const { where, orderBy } = data;
    const items = await this.db.cartItem.findMany({
      where: where as never,
      orderBy: orderBy as never,
    });

    return MapperUtil.mapMany<CartItemEntity, CartItemDto>(CartItemDto, items);
  }

  async findCartItemByCartAndCourse(
    cartId: string,
    courseId: string,
  ): Promise<CartItemDto | null> {
    const item = await this.db.cartItem.findFirst({
      where: {
        cartId,
        coursesId: courseId,
      },
    });

    if (!item) return null;

    return MapperUtil.mapper<CartItemEntity, CartItemDto>(CartItemDto, item);
  }

  async addCartItem(cartId: string, courseId: string): Promise<CartItemDto> {
    const now = new Date();
    const item = await this.db.cartItem.create({
      data: {
        cartId,
        coursesId: courseId,
        createdAt: now,
        updatedAt: now,
      },
    });

    return MapperUtil.mapper<CartItemEntity, CartItemDto>(CartItemDto, item);
  }

  async deleteCartItem(itemId: string): Promise<void> {
    await this.db.cartItem.delete({
      where: { id: itemId },
    });
  }
}
