import { describe, it, expect } from 'vitest';

import { safeCompare } from '@/utils/crypto.util';

describe('Crypto Utilities', () => {
  describe('safeCompare', () => {
    describe('Successful Comparisons', () => {
      it('should return true for identical strings', () => {
        const testString = 'hello world';

        const result = safeCompare(testString, testString);

        expect(result).toBe(true);
      });

      it('should return true for identical complex strings', () => {
        const testString = 'MySecretPassword123!@#';

        const result = safeCompare(testString, testString);

        expect(result).toBe(true);
      });

      it('should return true for empty strings', () => {
        const result = safeCompare('', '');

        expect(result).toBe(true);
      });

      it('should return true for identical unicode strings', () => {
        const testString = '🔐💻🚀 Unicode Test String 你好世界';

        const result = safeCompare(testString, testString);

        expect(result).toBe(true);
      });

      it('should return true for identical long strings', () => {
        const longString = 'a'.repeat(10000);

        const result = safeCompare(longString, longString);

        expect(result).toBe(true);
      });
    });

    describe('Failed Comparisons', () => {
      it('should return false for different strings of same length', () => {
        const result = safeCompare('hello', 'world');

        expect(result).toBe(false);
      });

      it('should return false for strings of different lengths', () => {
        const result = safeCompare('short', 'this is a longer string');

        expect(result).toBe(false);
      });

      it('should return false when comparing empty string with non-empty', () => {
        const result = safeCompare('', 'non-empty');

        expect(result).toBe(false);
      });

      it('should return false for case-sensitive differences', () => {
        const result = safeCompare('Hello', 'hello');

        expect(result).toBe(false);
      });

      it('should return false for strings with different special characters', () => {
        const result = safeCompare('test@123', 'test#123');

        expect(result).toBe(false);
      });

      it('should return false for strings with whitespace differences', () => {
        const result = safeCompare('hello world', 'hello  world');

        expect(result).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle strings with null bytes', () => {
        const stringWithNull = 'hello\x00world';
        const normalString = 'hello world';

        const result = safeCompare(stringWithNull, normalString);

        expect(result).toBe(false);
      });

      it('should handle very long different strings efficiently', () => {
        const string1 = 'a'.repeat(100000);
        const string2 = 'b'.repeat(100000);

        const start = Date.now();
        const result = safeCompare(string1, string2);
        const duration = Date.now() - start;

        expect(result).toBe(false);
        // Should return false quickly for different length strings
        expect(duration).toBeLessThan(100); // Should be very fast
      });

      it('should handle strings with different encodings correctly', () => {
        // Test with strings that might have different byte representations
        const string1 = 'café'; // Regular string
        const string2 = 'cafe\u0301'; // Composed differently but visually same

        const result = safeCompare(string1, string2);

        // These should be different as they have different byte representations
        expect(result).toBe(false);
      });
    });

    describe('Security Properties', () => {
      it('should return false immediately for different length strings (optimization)', () => {
        // Test that different length strings return false quickly
        // This is an important optimization for timing attack prevention
        const shortString = 'a';
        const longString = 'a'.repeat(1000);

        const start = performance.now();
        const result = safeCompare(shortString, longString);
        const duration = performance.now() - start;

        expect(result).toBe(false);
        // Should be very fast (no timing-safe comparison needed)
        expect(duration).toBeLessThan(1);
      });

      it('should handle timing-safe comparison for same-length strings', () => {
        // Test that same-length strings are compared safely
        // We can't spy on crypto.timingSafeEqual in ESM, but we can test behavior
        const string1 = 'abcdefgh';
        const string2 = 'ijklmnop';

        // Both strings are same length, should use timing-safe comparison
        const result = safeCompare(string1, string2);
        expect(result).toBe(false);
      });

      it('should be consistent in execution time for same-length strings', () => {
        // Test that timing is consistent for same-length comparisons
        const string1 = 'a'.repeat(100);
        const string2 = 'b'.repeat(100);

        // Multiple comparisons should have similar timing characteristics
        const times: number[] = [];

        for (let i = 0; i < 10; i++) {
          const start = performance.now();
          safeCompare(string1, string2);
          const duration = performance.now() - start;
          times.push(duration);
        }

        // All comparisons should be within reasonable range of each other
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        const timeDiff = maxTime - minTime;

        // Timing should be relatively consistent (within 10ms variance)
        expect(timeDiff).toBeLessThan(10);
      });

      it('should handle buffer conversion correctly', () => {
        // Test that the function works with various string types
        // indicating proper buffer conversion
        const normalString = 'test';
        const unicodeString = 'tëst';
        const emojiString = '🔐🔑';

        // All should work correctly
        expect(safeCompare(normalString, normalString)).toBe(true);
        expect(safeCompare(unicodeString, unicodeString)).toBe(true);
        expect(safeCompare(emojiString, emojiString)).toBe(true);

        // Cross-comparisons should work
        expect(safeCompare(normalString, unicodeString)).toBe(false);
        expect(safeCompare(normalString, emojiString)).toBe(false);
      });
    });

    describe('Performance Tests', () => {
      it('should perform well with identical strings', () => {
        const testString = 'performance-test-string-12345';

        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          safeCompare(testString, testString);
        }
        const duration = performance.now() - start;

        // Should complete 1000 comparisons in reasonable time
        expect(duration).toBeLessThan(100);
      });

      it('should perform well with different length strings', () => {
        const shortString = 'short';
        const longString = 'this is a much longer string for testing';

        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          safeCompare(shortString, longString);
        }
        const duration = performance.now() - start;

        // Should be very fast for different lengths (early return)
        expect(duration).toBeLessThan(50);
      });
    });

    describe('Real-world Use Cases', () => {
      it('should work correctly for password comparison', () => {
        const password = 'MySecurePassword123!';
        const correctPassword = 'MySecurePassword123!';
        const incorrectPassword = 'MySecurePassword124!';

        expect(safeCompare(password, correctPassword)).toBe(true);
        expect(safeCompare(password, incorrectPassword)).toBe(false);
      });

      it('should work correctly for token comparison', () => {
        const token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0';
        const validToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0';
        const invalidToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkxIn0';

        expect(safeCompare(token, validToken)).toBe(true);
        expect(safeCompare(token, invalidToken)).toBe(false);
      });

      it('should work correctly for API key comparison', () => {
        const apiKey = 'sk-1234567890abcdef1234567890abcdef12345678';
        const validApiKey = 'sk-1234567890abcdef1234567890abcdef12345678';
        const invalidApiKey = 'sk-1234567890abcdef1234567890abcdef12345679';

        expect(safeCompare(apiKey, validApiKey)).toBe(true);
        expect(safeCompare(apiKey, invalidApiKey)).toBe(false);
      });

      it('should work correctly for hash comparison', () => {
        const hash1 =
          'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
        const hash2 =
          'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
        const differentHash =
          'b665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';

        expect(safeCompare(hash1, hash2)).toBe(true);
        expect(safeCompare(hash1, differentHash)).toBe(false);
      });
    });
  });
});
