import { Injectable, Scope } from '@nestjs/common';

import { BaseRepository } from '@/infrastructures/database/abstracts/base.repository';
import { CartDto } from '@/infrastructures/database/dto/cart.dto';
import { CartEntity } from '@/infrastructures/database/entites/cart.entity';
import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { MapperUtil } from '@/utils/mapper.util';

@Injectable({ scope: Scope.REQUEST })
export class CartRepository extends BaseRepository<
  CartEntity,
  CartDto,
  PrismaDatabase['cart']
> {
  static readonly TOKEN = Symbol('CartRepository');
  constructor(private readonly db: PrismaDatabase) {
    super(db.cart, CartDto);
  }

  // Override findOneById because Cart model doesn't have soft delete fields
  override async findOneById(id: string): Promise<CartDto | null> {
    const item = await this.db.cart.findUnique({
      where: { id },
    });

    if (!item) return null;

    return MapperUtil.mapper<CartEntity, CartDto>(CartDto, item);
  }

  // Override findMany because Cart model doesn't have soft delete fields
  override async findMany(data: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
  }): Promise<CartDto[]> {
    const { where, orderBy } = data;
    const items = await this.db.cart.findMany({
      where: where as never,
      orderBy: orderBy as never,
    });

    return MapperUtil.mapMany<CartEntity, CartDto>(CartDto, items);
  }

  async findCartByUserId(userId: string): Promise<CartDto | null> {
    const item = await this.db.cart.findFirst({
      where: { user: userId },
    });

    if (!item) return null;

    return MapperUtil.mapper<CartEntity, CartDto>(CartDto, item);
  }

  async createCart(userId: string): Promise<CartDto> {
    const now = new Date();
    const item = await this.db.cart.create({
      data: {
        user: userId,
        createdAt: now,
        updatedAt: now,
      },
    });

    return MapperUtil.mapper<CartEntity, CartDto>(CartDto, item);
  }

  async getCartWithItems(
    cartId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.db.cart.findUnique({
      where: { id: cartId },
      include: {
        cartItems: {
          include: {
            courseRelation: {
              select: {
                id: true,
                coursesTitle: true,
                normalPrice: true,
                earlyBirdPricePrice: true,
                earlyBirdPriceStartDate: true,
                earlyBirdPriceEndDate: true,
                date: true,
                courseDetailRels: {
                  take: 1,
                  where: {
                    parentId: { not: null },
                  },
                  include: {
                    courseDetail: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
