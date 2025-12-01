import type { Decimal } from '@prisma/client/runtime/client';

import { BaseEntity } from '@/infrastructures/database/abstracts/base.entity';

export class CourseEntity extends BaseEntity {
  coursesTitle: string;
  normalPrice: Decimal;
  earlyBirdPricePrice: Decimal | null;
  earlyBirdPriceStartDate: Date | null;
  earlyBirdPriceEndDate: Date | null;
}
