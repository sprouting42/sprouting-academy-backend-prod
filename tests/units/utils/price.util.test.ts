import { describe, it, expect } from 'vitest';

import {
  calculateEffectivePrice,
  isInEarlyBirdPeriod,
  type EarlyBirdPriceData,
} from '@/utils/price.util';

describe('Price Utility', () => {
  const basePriceData: EarlyBirdPriceData = {
    normalPrice: 2000,
    earlyBirdPrice: 1500,
    earlyBirdPriceStartDate: new Date('2025-01-01'),
    earlyBirdPriceEndDate: new Date('2025-01-31'),
  };

  describe('calculateEffectivePrice', () => {
    it('should return normal price when early bird is not configured', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: null,
        earlyBirdPriceStartDate: null,
        earlyBirdPriceEndDate: null,
      };

      const result = calculateEffectivePrice(priceData);

      expect(result).toBe(2000);
    });

    it('should return normal price when earlyBirdPrice is null', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: null,
        earlyBirdPriceStartDate: new Date('2025-01-01'),
        earlyBirdPriceEndDate: new Date('2025-01-31'),
      };

      const result = calculateEffectivePrice(priceData);

      expect(result).toBe(2000);
    });

    it('should return normal price when earlyBirdPriceStartDate is null', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: null,
        earlyBirdPriceEndDate: new Date('2025-01-31'),
      };

      const result = calculateEffectivePrice(priceData);

      expect(result).toBe(2000);
    });

    it('should return normal price when earlyBirdPriceEndDate is null', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: new Date('2025-01-01'),
        earlyBirdPriceEndDate: null,
      };

      const result = calculateEffectivePrice(priceData);

      expect(result).toBe(2000);
    });

    it('should return normal price when early bird price is greater than or equal to normal price', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 2000,
        earlyBirdPriceStartDate: new Date('2025-01-01'),
        earlyBirdPriceEndDate: new Date('2025-01-31'),
      };

      const result = calculateEffectivePrice(priceData);

      expect(result).toBe(2000);
    });

    it('should return normal price when early bird price is greater than normal price', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 2500,
        earlyBirdPriceStartDate: new Date('2025-01-01'),
        earlyBirdPriceEndDate: new Date('2025-01-31'),
      };

      const result = calculateEffectivePrice(priceData);

      expect(result).toBe(2000);
    });

    it('should return normal price when start date is after end date', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: new Date('2025-01-31'),
        earlyBirdPriceEndDate: new Date('2025-01-01'),
      };

      const result = calculateEffectivePrice(priceData);

      expect(result).toBe(2000);
    });

    it('should return normal price when start date equals end date', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: new Date('2025-01-15'),
        earlyBirdPriceEndDate: new Date('2025-01-15'),
      };

      const result = calculateEffectivePrice(priceData);

      expect(result).toBe(2000);
    });

    it('should return early bird price when current date is within early bird period', () => {
      const currentDate = new Date('2025-01-15');

      const result = calculateEffectivePrice(basePriceData, currentDate);

      expect(result).toBe(1500);
    });

    it('should return early bird price when current date equals start date', () => {
      const currentDate = new Date('2025-01-01');

      const result = calculateEffectivePrice(basePriceData, currentDate);

      expect(result).toBe(1500);
    });

    it('should return early bird price when current date equals end date', () => {
      const currentDate = new Date('2025-01-31');

      const result = calculateEffectivePrice(basePriceData, currentDate);

      expect(result).toBe(1500);
    });

    it('should return normal price when current date is before start date', () => {
      const currentDate = new Date('2024-12-31');

      const result = calculateEffectivePrice(basePriceData, currentDate);

      expect(result).toBe(2000);
    });

    it('should return normal price when current date is after end date', () => {
      const currentDate = new Date('2025-02-01');

      const result = calculateEffectivePrice(basePriceData, currentDate);

      expect(result).toBe(2000);
    });

    it('should use current date when not provided', () => {
      const now = new Date();
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: new Date(now.getTime() - 86400000), // Yesterday
        earlyBirdPriceEndDate: new Date(now.getTime() + 86400000), // Tomorrow
      };

      const result = calculateEffectivePrice(priceData);

      expect(result).toBe(1500);
    });
  });

  describe('isInEarlyBirdPeriod', () => {
    it('should return false when early bird is not configured', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: null,
        earlyBirdPriceStartDate: null,
        earlyBirdPriceEndDate: null,
      };

      const result = isInEarlyBirdPeriod(priceData);

      expect(result).toBe(false);
    });

    it('should return false when earlyBirdPrice is null', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: null,
        earlyBirdPriceStartDate: new Date('2025-01-01'),
        earlyBirdPriceEndDate: new Date('2025-01-31'),
      };

      const result = isInEarlyBirdPeriod(priceData);

      expect(result).toBe(false);
    });

    it('should return false when earlyBirdPriceStartDate is null', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: null,
        earlyBirdPriceEndDate: new Date('2025-01-31'),
      };

      const result = isInEarlyBirdPeriod(priceData);

      expect(result).toBe(false);
    });

    it('should return false when earlyBirdPriceEndDate is null', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: new Date('2025-01-01'),
        earlyBirdPriceEndDate: null,
      };

      const result = isInEarlyBirdPeriod(priceData);

      expect(result).toBe(false);
    });

    it('should return false when start date is after end date', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: new Date('2025-01-31'),
        earlyBirdPriceEndDate: new Date('2025-01-01'),
      };

      const result = isInEarlyBirdPeriod(priceData);

      expect(result).toBe(false);
    });

    it('should return false when start date equals end date', () => {
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: new Date('2025-01-15'),
        earlyBirdPriceEndDate: new Date('2025-01-15'),
      };

      const result = isInEarlyBirdPeriod(priceData);

      expect(result).toBe(false);
    });

    it('should return true when current date is within early bird period', () => {
      const currentDate = new Date('2025-01-15');

      const result = isInEarlyBirdPeriod(basePriceData, currentDate);

      expect(result).toBe(true);
    });

    it('should return true when current date equals start date', () => {
      const currentDate = new Date('2025-01-01');

      const result = isInEarlyBirdPeriod(basePriceData, currentDate);

      expect(result).toBe(true);
    });

    it('should return true when current date equals end date', () => {
      const currentDate = new Date('2025-01-31');

      const result = isInEarlyBirdPeriod(basePriceData, currentDate);

      expect(result).toBe(true);
    });

    it('should return false when current date is before start date', () => {
      const currentDate = new Date('2024-12-31');

      const result = isInEarlyBirdPeriod(basePriceData, currentDate);

      expect(result).toBe(false);
    });

    it('should return false when current date is after end date', () => {
      const currentDate = new Date('2025-02-01');

      const result = isInEarlyBirdPeriod(basePriceData, currentDate);

      expect(result).toBe(false);
    });

    it('should use current date when not provided', () => {
      const now = new Date();
      const priceData: EarlyBirdPriceData = {
        normalPrice: 2000,
        earlyBirdPrice: 1500,
        earlyBirdPriceStartDate: new Date(now.getTime() - 86400000), // Yesterday
        earlyBirdPriceEndDate: new Date(now.getTime() + 86400000), // Tomorrow
      };

      const result = isInEarlyBirdPeriod(priceData);

      expect(result).toBe(true);
    });
  });
});
