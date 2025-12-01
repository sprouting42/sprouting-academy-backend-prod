const API_CONTROLLER_HEALTH = {
  HEALTH: {
    PREFIX: '_health',
    TAG: 'System',
    ROUTE: {
      GET_HEALTH: '',
    },
  },
  AUTH: {
    PREFIX: 'auth',
    TAG: 'Authentication',
    ROUTE: {
      POST_SIGN_IN: 'sign-in-with-otp',
      VERIFY_OTP: 'verify-otp',
      SIGN_OUT: 'sign-out',
      REFRESH: 'refresh',
      GET_ME: 'me',
    },
  },
  CART: {
    PREFIX: 'cart',
    TAG: 'Cart',
    ROUTE: {
      GET_CART: '',
      ADD_ITEM: 'items',
      DELETE_ITEM: 'items/:itemId',
    },
  },
  PAYMENT: {
    PREFIX: 'payment',
    TAG: 'Payment',
    ROUTE: {
      BANK_TRANSFER: 'bank-transfer',
      BANK_TRANSFER_BY_ID: ':id',
      BANK_TRANSFER_BY_ENROLLMENT: 'enrollment-course/:enrollmentCourseId',
      BANK_TRANSFER_BY_STATUS: 'status/:status',
    },
  },
  ENROLLMENT: {
    PREFIX: 'enrollment',
    TAG: 'Enrollment',
    ROUTE: {
      CREATE: '',
      GET_BY_ID: ':id',
      GET_MY_ENROLLMENTS: '',
    },
  },
  ORDER: {
    PREFIX: 'order',
    TAG: 'Order',
    ROUTE: {
      CREATE: '',
    },
  },
} as const;

export const API_CONTROLLER_CONFIG = {
  HEALTH: API_CONTROLLER_HEALTH.HEALTH,
  AUTH: API_CONTROLLER_HEALTH.AUTH,
  CART: API_CONTROLLER_HEALTH.CART,
  PAYMENT: API_CONTROLLER_HEALTH.PAYMENT,
  ENROLLMENT: API_CONTROLLER_HEALTH.ENROLLMENT,
  ORDER: API_CONTROLLER_HEALTH.ORDER,
} as const;
