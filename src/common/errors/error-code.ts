import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/errors/types/error-code.type';
import { createLocalizedMessage } from '@/utils/language-util';

const SYSTEM_ERROR_CODES = {
  SYSTEM: {
    INTERNAL_SERVER_ERROR: ErrorCode.create({
      code: 'SYSTEM.INTERNAL_SERVER_ERROR',
      message: createLocalizedMessage(
        'An unexpected server error occurred. Please try again later.',
        'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ที่ไม่คาดคิดขึ้น โปรดลองอีกครั้งในภายหลัง',
      ),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    }),
  },
} as const;

const AUTH_ERROR_CODES = {
  AUTH: {
    SIGN_IN_ERROR: ErrorCode.create({
      code: 'AUTH.SIGN_IN_ERROR',
      message: createLocalizedMessage(
        'Failed to sign in. Please check your credentials and try again.',
        'ล้มเหลวในการเข้าสู่ระบบ โปรดตรวจสอบข้อมูลประจำตัวของคุณและลองอีกครั้ง',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    OVER_EMAIL_SEND_RATE_LIMIT: ErrorCode.create({
      code: 'AUTH.OVER_EMAIL_SEND_RATE_LIMIT',
      message: createLocalizedMessage(
        'For security purposes, you can only request this after 3 seconds',
        'เพื่อความปลอดภัย คุณสามารถขอได้หลังจาก 3 วินาที',
      ),
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
    }),
    OTP_EXPIRED: ErrorCode.create({
      code: 'AUTH.OTP_EXPIRED',
      message: createLocalizedMessage(
        'Token has expired or is invalid',
        'โทเค็นหมดอายุหรือไม่ถูกต้อง',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    USER_NOT_FOUND: ErrorCode.create({
      code: 'AUTH.USER_NOT_FOUND',
      message: createLocalizedMessage('User not found', 'ไม่พบผู้ใช้'),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    TOKEN_REQUIRED: ErrorCode.create({
      code: 'AUTH.TOKEN_REQUIRED',
      message: createLocalizedMessage(
        'Access token is required',
        'จำเป็นต้องมี Access Token',
      ),
      statusCode: HttpStatus.UNAUTHORIZED,
    }),
  },
} as const;

const CART_ERROR_CODES = {
  CART: {
    ITEM_ALREADY_EXISTS: ErrorCode.create({
      code: 'CART.ITEM_ALREADY_EXISTS',
      message: createLocalizedMessage(
        'Course already exists in cart',
        'คอร์สนี้มีอยู่ในตะกร้าแล้ว',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    ITEM_NOT_FOUND: ErrorCode.create({
      code: 'CART.ITEM_NOT_FOUND',
      message: createLocalizedMessage(
        'Cart item not found',
        'ไม่พบสินค้านี้ในตะกร้า',
      ),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    COURSE_NOT_FOUND: ErrorCode.create({
      code: 'CART.COURSE_NOT_FOUND',
      message: createLocalizedMessage('Course not found', 'ไม่พบคอร์สนี้'),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    UNAUTHORIZED_ACCESS: ErrorCode.create({
      code: 'CART.UNAUTHORIZED_ACCESS',
      message: createLocalizedMessage(
        'You do not have permission to access this cart item',
        'คุณไม่มีสิทธิ์เข้าถึงสินค้าในตะกร้านี้',
      ),
      statusCode: HttpStatus.UNAUTHORIZED,
    }),
    CART_NOT_FOUND: ErrorCode.create({
      code: 'CART.CART_NOT_FOUND',
      message: createLocalizedMessage('Cart not found', 'ไม่พบตะกร้าสินค้า'),
      statusCode: HttpStatus.NOT_FOUND,
    }),
  },
} as const;

const ORDER_ERROR_CODES = {
  ORDER: {
    COURSE_NOT_FOUND: ErrorCode.create({
      code: 'ORDER.COURSE_NOT_FOUND',
      message: 'Course not found',
      statusCode: HttpStatus.NOT_FOUND,
    }),
    ORDER_NOT_FOUND: ErrorCode.create({
      code: 'ORDER.ORDER_NOT_FOUND',
      message: createLocalizedMessage('Order not found', 'ไม่พบคำสั่งซื้อ'),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    CREATE_ORDER_ERROR: ErrorCode.create({
      code: 'ORDER.CREATE_ORDER_ERROR',
      message: createLocalizedMessage(
        'Failed to create order',
        'ไม่สามารถสร้างคำสั่งซื้อได้',
      ),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    }),
    INTERNAL_SERVER_ERROR: ErrorCode.create({
      code: 'ORDER.INTERNAL_SERVER_ERROR',
      message: createLocalizedMessage(
        'Failed to process order',
        'ไม่สามารถประมวลผลคำสั่งซื้อได้',
      ),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    }),
    ACCESS_DENIED: ErrorCode.create({
      code: 'ORDER.ACCESS_DENIED',
      message: createLocalizedMessage(
        'You do not have access to this order',
        'คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้',
      ),
      statusCode: HttpStatus.FORBIDDEN,
    }),
    ALREADY_PROCESSED: ErrorCode.create({
      code: 'ORDER.ALREADY_PROCESSED',
      message: createLocalizedMessage(
        'Order has already been processed',
        'คำสั่งซื้อนี้ถูกประมวลผลแล้ว',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    EMPTY: ErrorCode.create({
      code: 'ORDER.EMPTY',
      message: createLocalizedMessage(
        'Order has no items',
        'คำสั่งซื้อไม่มีรายการ',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
  },
} as const;

const ENROLLMENT_ERROR_CODES = {
  ENROLLMENT: {
    COURSE_NOT_FOUND: ErrorCode.create({
      code: 'ENROLLMENT.COURSE_NOT_FOUND',
      message: createLocalizedMessage('Course not found', 'ไม่พบคอร์ส'),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    ALREADY_ENROLLED: ErrorCode.create({
      code: 'ENROLLMENT.ALREADY_ENROLLED',
      message: createLocalizedMessage(
        'You are already enrolled in this course',
        'คุณได้ลงทะเบียนในคอร์สนี้แล้ว',
      ),
      statusCode: HttpStatus.CONFLICT,
    }),
    ENROLLMENT_NOT_FOUND: ErrorCode.create({
      code: 'ENROLLMENT.ENROLLMENT_NOT_FOUND',
      message: createLocalizedMessage(
        'Enrollment not found',
        'ไม่พบการลงทะเบียน',
      ),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    INTERNAL_SERVER_ERROR: ErrorCode.create({
      code: 'ENROLLMENT.INTERNAL_SERVER_ERROR',
      message: createLocalizedMessage(
        'Failed to process enrollment',
        'ไม่สามารถประมวลผลการลงทะเบียนได้',
      ),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    }),
  },
} as const;

const PAYMENT_ERROR_CODES = {
  PAYMENT: {
    MINIMUM_AMOUNT_ERROR: ErrorCode.create({
      code: 'PAYMENT.MINIMUM_AMOUNT_ERROR',
      message: createLocalizedMessage(
        'Payment amount must be at least ฿20 (minimum charge requirement)',
        'จำนวนเงินที่ต้องชำระต้องไม่ต่ำกว่า ฿20 (ข้อกำหนดขั้นต่ำของการชำระเงิน)',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    CREATE_CHARGE_ERROR: ErrorCode.create({
      code: 'PAYMENT.CREATE_CHARGE_ERROR',
      message: createLocalizedMessage(
        'Failed to create charge',
        'ไม่สามารถสร้างการชำระเงินได้',
      ),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    }),
    RETRIEVE_CHARGE_ERROR: ErrorCode.create({
      code: 'PAYMENT.RETRIEVE_CHARGE_ERROR',
      message: createLocalizedMessage(
        'Failed to retrieve charge',
        'ไม่สามารถดึงข้อมูลการชำระเงินได้',
      ),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    }),
    PAYMENT_NOT_FOUND: ErrorCode.create({
      code: 'PAYMENT.PAYMENT_NOT_FOUND',
      message: createLocalizedMessage(
        'Payment record not found',
        'ไม่พบข้อมูลการชำระเงิน',
      ),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    COURSE_NOT_FOUND: ErrorCode.create({
      code: 'PAYMENT.COURSE_NOT_FOUND',
      message: createLocalizedMessage('Course not found', 'ไม่พบคอร์ส'),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    ALREADY_ENROLLED: ErrorCode.create({
      code: 'PAYMENT.ALREADY_ENROLLED',
      message: createLocalizedMessage(
        'You are already enrolled in this course',
        'คุณได้ลงทะเบียนในคอร์สนี้แล้ว',
      ),
      statusCode: HttpStatus.CONFLICT,
    }),
    ENROLLMENT_COURSE_NOT_FOUND: ErrorCode.create({
      code: 'PAYMENT.ENROLLMENT_COURSE_NOT_FOUND',
      message: createLocalizedMessage(
        'Enrollment course not found',
        'ไม่พบการลงทะเบียนคอร์ส',
      ),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    INVALID_PAYMENT_AMOUNT: ErrorCode.create({
      code: 'PAYMENT.INVALID_PAYMENT_AMOUNT',
      message: createLocalizedMessage(
        'Payment amount does not match the enrollment course final price',
        'จำนวนเงินที่ชำระไม่ตรงกับราคาสุดท้ายของคอร์ส',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    ENROLLMENT_COURSE_ALREADY_CONFIRMED: ErrorCode.create({
      code: 'PAYMENT.ENROLLMENT_COURSE_ALREADY_CONFIRMED',
      message: createLocalizedMessage(
        'Enrollment course is already confirmed',
        'การลงทะเบียนคอร์สได้รับการยืนยันแล้ว',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    PAYMENT_ALREADY_EXISTS: ErrorCode.create({
      code: 'PAYMENT.PAYMENT_ALREADY_EXISTS',
      message: createLocalizedMessage(
        'A successful payment already exists for this enrollment course',
        'มีการชำระเงินที่สำเร็จแล้วสำหรับการลงทะเบียนคอร์สนี้',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    INVALID_COUPON: ErrorCode.create({
      code: 'PAYMENT.INVALID_COUPON',
      message: createLocalizedMessage('Invalid coupon', 'โค้ดส่วนลดไม่ถูกต้อง'),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    COUPON_NOT_FOUND: ErrorCode.create({
      code: 'PAYMENT.COUPON_NOT_FOUND',
      message: createLocalizedMessage('Coupon not found', 'ไม่พบโค้ดส่วนลด'),
      statusCode: HttpStatus.NOT_FOUND,
    }),
    COUPON_INACTIVE: ErrorCode.create({
      code: 'PAYMENT.COUPON_INACTIVE',
      message: createLocalizedMessage(
        'Coupon is not active',
        'โค้ดส่วนลดไม่สามารถใช้งานได้',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    COUPON_EXPIRED: ErrorCode.create({
      code: 'PAYMENT.COUPON_EXPIRED',
      message: createLocalizedMessage(
        'Coupon has expired',
        'โค้ดส่วนลดหมดอายุแล้ว',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    COUPON_LIMIT_REACHED: ErrorCode.create({
      code: 'PAYMENT.COUPON_LIMIT_REACHED',
      message: createLocalizedMessage(
        'Coupon usage limit has been reached',
        'โค้ดส่วนลดถูกใช้งานครบจำนวนแล้ว',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    MINIMUM_ORDER_NOT_MET: ErrorCode.create({
      code: 'PAYMENT.MINIMUM_ORDER_NOT_MET',
      message: createLocalizedMessage(
        'Minimum order amount requirement not met',
        'ยอดสั่งซื้อไม่ถึงจำนวนขั้นต่ำที่กำหนด',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    ALREADY_PAID: ErrorCode.create({
      code: 'PAYMENT.ALREADY_PAID',
      message: createLocalizedMessage(
        'You have already paid for this course',
        'คุณได้ชำระเงินสำหรับคอร์สนี้แล้ว',
      ),
      statusCode: HttpStatus.CONFLICT,
    }),
    BANK_TRANSFER_CREATE_ERROR: ErrorCode.create({
      code: 'PAYMENT.BANK_TRANSFER_CREATE_ERROR',
      message: createLocalizedMessage(
        'Failed to create bank transfer payment',
        'ไม่สามารถสร้างการชำระเงินผ่านธนาคารได้',
      ),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    }),
    PAYMENT_ALREADY_PROCESSED: ErrorCode.create({
      code: 'PAYMENT.PAYMENT_ALREADY_PROCESSED',
      message: createLocalizedMessage(
        'Payment has already been processed',
        'การชำระเงินได้รับการประมวลผลแล้ว',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    INVALID_PAYMENT_TYPE: ErrorCode.create({
      code: 'PAYMENT.INVALID_PAYMENT_TYPE',
      message: createLocalizedMessage(
        'Invalid payment type for this operation',
        'ประเภทการชำระเงินไม่ถูกต้องสำหรับการดำเนินการนี้',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    APPROVAL_REASON_REQUIRED: ErrorCode.create({
      code: 'PAYMENT.APPROVAL_REASON_REQUIRED',
      message: createLocalizedMessage(
        'Reason is required when rejecting payment',
        'จำเป็นต้องระบุเหตุผลเมื่อปฏิเสธการชำระเงิน',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    INVALID_IMAGE_FORMAT: ErrorCode.create({
      code: 'PAYMENT.INVALID_IMAGE_FORMAT',
      message: createLocalizedMessage(
        'Invalid image format. File signature does not match the declared file type.',
        'รูปแบบรูปภาพไม่ถูกต้อง ลายเซ็นไฟล์ไม่ตรงกับประเภทไฟล์ที่ประกาศ',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    IMAGE_DIMENSIONS_TOO_SMALL: ErrorCode.create({
      code: 'PAYMENT.IMAGE_DIMENSIONS_TOO_SMALL',
      message: createLocalizedMessage(
        'Image dimensions are too small. Minimum size is 200x200 pixels.',
        'ขนาดรูปภาพเล็กเกินไป ขนาดขั้นต่ำคือ 200x200 พิกเซล',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    IMAGE_DIMENSIONS_TOO_LARGE: ErrorCode.create({
      code: 'PAYMENT.IMAGE_DIMENSIONS_TOO_LARGE',
      message: createLocalizedMessage(
        'Image dimensions are too large. Maximum size is 10000x10000 pixels.',
        'ขนาดรูปภาพใหญ่เกินไป ขนาดสูงสุดคือ 10000x10000 พิกเซล',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    IMAGE_PROCESSING_ERROR: ErrorCode.create({
      code: 'PAYMENT.IMAGE_PROCESSING_ERROR',
      message: createLocalizedMessage(
        'Failed to process image. The file may be corrupted.',
        'ไม่สามารถประมวลผลรูปภาพได้ ไฟล์อาจเสียหาย',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    CREATE_TOKEN_ERROR: ErrorCode.create({
      code: 'PAYMENT.CREATE_TOKEN_ERROR',
      message: createLocalizedMessage(
        'Failed to create payment token',
        'ไม่สามารถสร้างโทเค็นการชำระเงินได้',
      ),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    }),
    INVALID_CARD: ErrorCode.create({
      code: 'PAYMENT.INVALID_CARD',
      message: createLocalizedMessage(
        'Invalid card information. Please check your card details and try again.',
        'ข้อมูลบัตรไม่ถูกต้อง โปรดตรวจสอบข้อมูลบัตรของคุณและลองอีกครั้ง',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    EXPIRED_CARD: ErrorCode.create({
      code: 'PAYMENT.EXPIRED_CARD',
      message: createLocalizedMessage(
        'Card has expired. Please use a different card.',
        'บัตรหมดอายุแล้ว โปรดใช้บัตรอื่น',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    INSUFFICIENT_FUND: ErrorCode.create({
      code: 'PAYMENT.INSUFFICIENT_FUND',
      message: createLocalizedMessage(
        'Insufficient funds. Please check your card balance.',
        'เงินในบัตรไม่เพียงพอ โปรดตรวจสอบยอดเงินในบัตร',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    CARD_DECLINED: ErrorCode.create({
      code: 'PAYMENT.CARD_DECLINED',
      message: createLocalizedMessage(
        'Card was declined. Please contact your bank or use a different card.',
        'บัตรถูกปฏิเสธ โปรดติดต่อธนาคารหรือใช้บัตรอื่น',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
    INVALID_CVV: ErrorCode.create({
      code: 'PAYMENT.INVALID_CVV',
      message: createLocalizedMessage(
        'Invalid CVV/CVC code. Please check and try again.',
        'รหัส CVV/CVC ไม่ถูกต้อง โปรดตรวจสอบและลองอีกครั้ง',
      ),
      statusCode: HttpStatus.BAD_REQUEST,
    }),
  },
} as const;

export const ERROR_CODES = {
  ...SYSTEM_ERROR_CODES,
  ...AUTH_ERROR_CODES,
  ...CART_ERROR_CODES,
  ...ORDER_ERROR_CODES,
  ...PAYMENT_ERROR_CODES,
  ...ENROLLMENT_ERROR_CODES,
};
