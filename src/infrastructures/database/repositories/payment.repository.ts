import { Injectable, Scope } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BaseRepository } from '@/infrastructures/database/abstracts/base.repository';
import { PaymentDto } from '@/infrastructures/database/dto/payment.dto';
import { PaymentEntity } from '@/infrastructures/database/entites/payment.entity';
import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';

@Injectable({ scope: Scope.REQUEST })
export class PaymentRepository extends BaseRepository<
  PaymentEntity,
  PaymentDto,
  PrismaDatabase['payment']
> {
  static readonly TOKEN = Symbol('PaymentRepository');

  constructor(private readonly db: PrismaDatabase) {
    super(db.payment, PaymentDto);
  }

  /**
   * Select object for payment fields used across multiple methods
   */
  private static readonly PAYMENT_SELECT = {
    id: true,
    paymentType: true,
    status: true,
    orderId: true,
    omiseChargeId: true,
    slipImage: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  /**
   * Maps payment data to PaymentDto
   */
  private mapToPaymentDto(item: {
    id: string;
    paymentType: string;
    status: string;
    orderId: string | null;
    omiseChargeId: string | null;
    slipImage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): PaymentDto {
    return {
      id: item.id,
      paymentType: item.paymentType,
      status: item.status,
      orderId: item.orderId ?? null,
      omiseChargeId: item.omiseChargeId ?? null,
      slipImage: item.slipImage ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    } as PaymentDto;
  }

  // Override findOneById
  override async findOneById(id: string): Promise<PaymentDto | null> {
    const item = await this.db.payment.findUnique({
      where: { id },
      select: PaymentRepository.PAYMENT_SELECT,
    });

    if (!item) return null;

    return this.mapToPaymentDto(item);
  }

  // Override findMany
  override async findMany(data: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    include?: Prisma.PaymentInclude;
  }): Promise<PaymentDto[]> {
    const { where, orderBy } = data;
    const items = await this.db.payment.findMany({
      where: where as never,
      orderBy: orderBy as never,
      select: PaymentRepository.PAYMENT_SELECT,
    });

    return items.map(item => this.mapToPaymentDto(item));
  }

  async createPayment(data: {
    paymentType: string;
    status: string;
    orderId: string;
    omiseChargeId?: string | null;
    slipImage?: string | null;
  }): Promise<PaymentDto> {
    const item = await this.db.payment.create({
      data: {
        paymentType: data.paymentType,
        status: data.status,
        orderId: data.orderId,
        ...(data.omiseChargeId !== null &&
          data.omiseChargeId !== undefined &&
          data.omiseChargeId.trim() !== '' && {
            omiseChargeId: data.omiseChargeId,
          }),
        ...(data.slipImage !== null &&
          data.slipImage !== undefined &&
          data.slipImage.trim() !== '' && { slipImage: data.slipImage }),
      },
      select: PaymentRepository.PAYMENT_SELECT,
    });

    return {
      ...this.mapToPaymentDto(item),
      updatedAt: item.updatedAt ?? item.createdAt,
    };
  }

  async updatePaymentStatus(id: string, status: string): Promise<PaymentDto> {
    const item = await this.db.payment.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      select: PaymentRepository.PAYMENT_SELECT,
    });

    return this.mapToPaymentDto(item);
  }

  async findByOmiseChargeId(omiseChargeId: string): Promise<PaymentDto | null> {
    const item = await this.db.payment.findFirst({
      where: { omiseChargeId },
      select: PaymentRepository.PAYMENT_SELECT,
    });

    if (!item) return null;

    return this.mapToPaymentDto(item);
  }

  async findByEnrollmentId(enrollmentId: string): Promise<PaymentDto | null> {
    const enrollment = await this.db.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        payment: {
          select: PaymentRepository.PAYMENT_SELECT,
        },
      },
    });

    if (!enrollment?.payment) return null;

    return this.mapToPaymentDto(enrollment.payment);
  }

  async findEnrollmentById(enrollmentId: string): Promise<{
    id: string;
    userId: string;
    course: string;
    paymentId: string | null;
  } | null> {
    const enrollment = await this.db.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        userId: true,
        courseId: true,
        paymentId: true,
        course: {
          select: {
            coursesTitle: true,
          },
        },
      },
    });

    if (!enrollment) return null;

    return {
      id: enrollment.id,
      userId: enrollment.userId,
      course: enrollment.course.coursesTitle,
      paymentId: enrollment.paymentId,
    };
  }

  async findCourseByTitle(title: string): Promise<{
    id: string;
    title: string;
    price: number;
  } | null> {
    const course = await this.db.course.findFirst({
      where: { coursesTitle: title },
      select: {
        id: true,
        coursesTitle: true,
        normalPrice: true,
      },
    });

    if (!course) return null;

    return {
      id: course.id,
      title: course.coursesTitle,
      price: Number(course.normalPrice),
    };
  }

  async findCouponById(id: string) {
    const coupon = await this.db.coupon.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        type: true,
        discount: true,
        minOrderAmount: true,
        maxDiscount: true,
        usageLimit: true,
        usageCount: true,
        status: true,
        startDate: true,
        expireDate: true,
      },
    });

    if (!coupon) return null;

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discount: Number(coupon.discount),
      minOrderAmount: coupon.minOrderAmount
        ? Number(coupon.minOrderAmount)
        : null,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : null,
      usageCount: Number(coupon.usageCount),
      status: coupon.status,
      startDate: coupon.startDate,
      expireDate: coupon.expireDate,
    };
  }

  async incrementCouponUsage(id: string): Promise<void> {
    await this.db.coupon.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<PaymentDto[]> {
    const items = await this.db.payment.findMany({
      where: {
        order: {
          userId,
        },
      },
      select: PaymentRepository.PAYMENT_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return items.map(item => this.mapToPaymentDto(item));
  }
}
