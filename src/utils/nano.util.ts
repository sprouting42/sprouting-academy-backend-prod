import { customAlphabet, nanoid } from 'nanoid';

/**
 * Utility class for generating Nano IDs
 */
export class NanoUtil {
  /**
   * Generates a Nano ID with optional custom length
   * @param length - Optional length of the ID (default: 21)
   * @returns Generated Nano ID
   */
  static generateId(length?: number): string {
    if (length !== undefined && length > 0) {
      const customNanoId = customAlphabet(
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        length,
      );
      return customNanoId();
    }
    return nanoid();
  }
}
