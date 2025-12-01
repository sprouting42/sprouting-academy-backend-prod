import { CartItemDto } from './cart-item.dto';
import { CartDto } from './cart.dto';

export class CourseDetailDto {
  id: string;
  titleText: string | null;
  courseBenefit: string | null;
  classType: string | null;
  totalTimesCourse: number | null;
  totalClass: number | null;
  updatedAt: Date;
  createdAt: Date;

  constructor(data: {
    id: string;
    titleText: string | null;
    courseBenefit: string | null;
    classType: string | null;
    totalTimesCourse: number | null;
    totalClass: number | null;
    updatedAt: Date;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.titleText = data.titleText;
    this.courseBenefit = data.courseBenefit;
    this.classType = data.classType;
    this.totalTimesCourse = data.totalTimesCourse;
    this.totalClass = data.totalClass;
    this.updatedAt = data.updatedAt;
    this.createdAt = data.createdAt;
  }
}

export class CourseDetailRelDto {
  id: number;
  courseDetail: CourseDetailDto | null;

  constructor(data: { id: number; courseDetail: CourseDetailDto | null }) {
    this.id = data.id;
    this.courseDetail = data.courseDetail;
  }
}

export class CourseRelationDto {
  id: string;
  coursesTitle: string;
  normalPrice: number | bigint;
  earlyBirdPricePrice: number | bigint | null;
  earlyBirdPriceStartDate: Date | null;
  earlyBirdPriceEndDate: Date | null;
  date: Date | null;
  courseDetailRels: CourseDetailRelDto[];

  constructor(data: {
    id: string;
    coursesTitle: string;
    normalPrice: number | bigint;
    earlyBirdPricePrice: number | bigint | null;
    earlyBirdPriceStartDate: Date | null;
    earlyBirdPriceEndDate: Date | null;
    date: Date | null;
    courseDetailRels: CourseDetailRelDto[];
  }) {
    this.id = data.id;
    this.coursesTitle = data.coursesTitle;
    this.normalPrice = data.normalPrice;
    this.earlyBirdPricePrice = data.earlyBirdPricePrice;
    this.earlyBirdPriceStartDate = data.earlyBirdPriceStartDate;
    this.earlyBirdPriceEndDate = data.earlyBirdPriceEndDate;
    this.date = data.date;
    this.courseDetailRels = data.courseDetailRels;
  }
}

export class CartItemWithCourseDto extends CartItemDto {
  courseRelation: CourseRelationDto;

  constructor(
    data: {
      id: string;
      cartId: string;
      coursesId: string;
      createdAt: Date;
      updatedAt: Date;
    } & {
      courseRelation: CourseRelationDto;
    },
  ) {
    super(data);
    this.courseRelation = data.courseRelation;
  }
}

export class CartWithItemsDto extends CartDto {
  cartItems: CartItemWithCourseDto[];

  constructor(
    data: {
      id: string;
      user: string;
      createdAt: Date;
      updatedAt: Date;
    } & {
      cartItems: CartItemWithCourseDto[];
    },
  ) {
    super(data);
    this.cartItems = data.cartItems;
  }
}
