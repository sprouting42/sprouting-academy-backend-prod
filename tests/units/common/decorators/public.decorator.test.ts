/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { IS_PUBLIC_KEY, Public } from '@/common/decorators/public.decorator';

describe('public.decorator', () => {
  describe('IS_PUBLIC_KEY', () => {
    it('should export the correct metadata key', () => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });
  });

  describe('Public', () => {
    it('should set metadata with IS_PUBLIC_KEY and true value', () => {
      class TestClass {
        @Public()
        testMethod() {
          return 'test';
        }
      }

      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        TestClass.prototype.testMethod,
      );

      expect(metadata).toBe(true);
    });

    it('should be applicable to multiple methods', () => {
      class TestClass {
        @Public()
        method1() {
          return 'method1';
        }

        @Public()
        method2() {
          return 'method2';
        }

        privateMethod() {
          return 'private';
        }
      }

      const method1Metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        TestClass.prototype.method1,
      );
      const method2Metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        TestClass.prototype.method2,
      );
      const privateMetadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        TestClass.prototype.privateMethod,
      );

      expect(method1Metadata).toBe(true);
      expect(method2Metadata).toBe(true);
      expect(privateMetadata).toBeUndefined();
    });

    it('should work with class methods', () => {
      class Controller {
        @Public()
        login() {
          return 'login';
        }
      }

      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        Controller.prototype.login,
      );

      expect(metadata).toBe(true);
    });

    it('should be callable as a decorator factory', () => {
      const decorator = Public();
      expect(typeof decorator).toBe('function');
    });

    it('should set the same metadata value for all decorated methods', () => {
      class TestClass {
        @Public()
        route1() {
          return 'route1';
        }

        @Public()
        route2() {
          return 'route2';
        }
      }

      const metadata1 = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        TestClass.prototype.route1,
      );
      const metadata2 = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        TestClass.prototype.route2,
      );

      expect(metadata1).toBe(metadata2);
      expect(metadata1).toBe(true);
    });

    it('should not interfere with other decorators', () => {
      const OtherDecorator = () => {
        return (
          target: object,
          propertyKey: string | symbol,
          descriptor: PropertyDescriptor,
        ) => {
          Reflect.defineMetadata('other', 'value', descriptor.value);
        };
      };

      class TestClass {
        @Public()
        @OtherDecorator()
        combinedMethod() {
          return 'combined';
        }
      }

      const publicMetadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        TestClass.prototype.combinedMethod,
      );
      const otherMetadata = Reflect.getMetadata(
        'other',
        TestClass.prototype.combinedMethod,
      );

      expect(publicMetadata).toBe(true);
      expect(otherMetadata).toBe('value');
    });
  });
});
