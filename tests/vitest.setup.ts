import { vi, beforeEach, afterEach, afterAll } from 'vitest';

const originalConsole = global.console;

vi.setConfig({
  testTimeout: 10000,
  hookTimeout: 5000,
});

vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    Logger: vi.fn().mockImplementation(() => ({
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      verbose: vi.fn(),
      setContext: vi.fn(),
    })),
  };
});

vi.mock('winston', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
  })),
  format: {
    combine: vi.fn(),
    timestamp: vi.fn(),
    errors: vi.fn(),
    json: vi.fn(),
    printf: vi.fn(),
    colorize: vi.fn(),
    simple: vi.fn(),
  },
  transports: {
    Console: vi.fn(),
    File: vi.fn(),
  },
  Logger: vi.fn().mockImplementation(() => ({
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    info: vi.fn(),
  })),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
  })),
  UserRole: {
    ADMIN: 'ADMIN',
    INSTRUCTOR: 'INSTRUCTOR',
    STUDENT: 'STUDENT',
  },
  EnrollmentStatus: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
  },
  PaymentStatus: {
    PENDING: 'pending',
    SUCCESSFUL: 'successful',
    FAILED: 'failed',
  },
  BankTransferStatus: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
  },
  QrPaymentStatus: {
    PENDING: 'pending',
    PAID: 'paid',
    EXPIRED: 'expired',
    FAILED: 'failed',
  },
  DiscountType: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

afterAll(() => {
  global.console = originalConsole;
});

export const createMockApp = () => ({
  get: vi.fn(),
  use: vi.fn(),
  listen: vi.fn(),
  close: vi.fn(),
  enableCors: vi.fn(),
  setGlobalPrefix: vi.fn(),
  useGlobalPipes: vi.fn(),
  useGlobalFilters: vi.fn(),
  useGlobalInterceptors: vi.fn(),
  useLogger: vi.fn(),
});

export const createMockLogger = () => ({
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  verbose: vi.fn(),
  setContext: vi.fn(),
});

export const waitFor = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });
