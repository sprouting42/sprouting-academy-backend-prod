import { Injectable, Scope } from '@nestjs/common';

import { BaseRepository } from '@/infrastructures/database/abstracts/base.repository';
import { CourseDto } from '@/infrastructures/database/dto/course.dto';
import { CourseEntity } from '@/infrastructures/database/entites/course.entity';
import { PrismaDatabase } from '@/infrastructures/database/prisma/prisma-database';
import { MapperUtil } from '@/utils/mapper.util';

@Injectable({ scope: Scope.REQUEST })
export class CourseRepository extends BaseRepository<
  CourseEntity,
  CourseDto,
  PrismaDatabase['course']
> {
  static readonly TOKEN = Symbol('CourseRepository');
  constructor(private readonly db: PrismaDatabase) {
    super(db.course, CourseDto);
  }

  // Override findOneById because Course model doesn't have soft delete fields
  override async findOneById(id: string): Promise<CourseDto | null> {
    const item = await this.db.course.findUnique({
      where: { id },
    });

    if (!item) return null;

    return MapperUtil.mapper<CourseEntity, CourseDto>(CourseDto, item);
  }

  // Override findMany because Course model doesn't have soft delete fields
  override async findMany(data: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
  }): Promise<CourseDto[]> {
    const { where, orderBy } = data;
    const items = await this.db.course.findMany({
      where: where as never,
      orderBy: orderBy as never,
    });

    return MapperUtil.mapMany<CourseEntity, CourseDto>(CourseDto, items);
  }

  async findCourseByIdSimple(courseId: string): Promise<{ id: string } | null> {
    const result = await this.db.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    return result;
  }
}
