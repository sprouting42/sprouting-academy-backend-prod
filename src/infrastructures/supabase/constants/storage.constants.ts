export const STORAGE_CONSTANTS = {
  BUCKET_NAME: 'payment-slips',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png'],

  // Image dimension constraints
  MIN_IMAGE_WIDTH: 200, // pixels
  MIN_IMAGE_HEIGHT: 200, // pixels
  MAX_IMAGE_WIDTH: 10000, // pixels
  MAX_IMAGE_HEIGHT: 10000, // pixels
} as const;
