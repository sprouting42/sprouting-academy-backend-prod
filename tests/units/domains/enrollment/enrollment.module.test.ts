/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from 'vitest';

import { EnrollmentModule } from '@/domains/enrollment/enrollment.module';

describe('EnrollmentModule', () => {
  it('should be defined', () => {
    expect(EnrollmentModule).toBeDefined();
  });

  it('should have correct metadata', () => {
    const moduleMetadata = Reflect.getMetadata('imports', EnrollmentModule);
    expect(moduleMetadata).toBeDefined();
  });

  it('should import LoggerModule and DatabaseModule', () => {
    const imports = Reflect.getMetadata('imports', EnrollmentModule);
    expect(imports).toBeDefined();
    expect(imports).toHaveLength(2);
  });

  it('should have EnrollmentController', () => {
    const controllers = Reflect.getMetadata('controllers', EnrollmentModule);
    expect(controllers).toBeDefined();
    expect(controllers).toHaveLength(1);
  });

  it('should provide EnrollmentRepository and EnrollmentService', () => {
    const providers = Reflect.getMetadata('providers', EnrollmentModule);
    expect(providers).toBeDefined();
    expect(providers).toHaveLength(2);
  });

  it('should export EnrollmentService and EnrollmentRepository', () => {
    const exports = Reflect.getMetadata('exports', EnrollmentModule);
    expect(exports).toBeDefined();
    expect(exports).toHaveLength(2);
  });
});
