import { describe, it, expect } from 'vitest';

import { LogLevel } from '@/enums/log.enum';
import { SortOrder } from '@/enums/pagination.enum';

describe('LogLevel Enum', () => {
  describe('Enum Values', () => {
    it('should have ERROR value', () => {
      expect(LogLevel.ERROR).toBe('error');
    });

    it('should have WARN value', () => {
      expect(LogLevel.WARN).toBe('warn');
    });

    it('should have INFO value', () => {
      expect(LogLevel.INFO).toBe('info');
    });

    it('should have DEBUG value', () => {
      expect(LogLevel.DEBUG).toBe('debug');
    });

    it('should have QUERY value', () => {
      expect(LogLevel.QUERY).toBe('query');
    });
  });

  describe('Enum Usage', () => {
    it('should support comparison', () => {
      const level: LogLevel = LogLevel.INFO;

      expect(level === LogLevel.INFO).toBe(true);
    });

    it('should support switch statements', () => {
      const getLogLevelPriority = (level: LogLevel): number => {
        switch (level) {
          case LogLevel.ERROR:
            return 0;
          case LogLevel.WARN:
            return 1;
          case LogLevel.INFO:
            return 2;
          case LogLevel.DEBUG:
            return 3;
          case LogLevel.QUERY:
            return 4;
        }
      };

      expect(getLogLevelPriority(LogLevel.ERROR)).toBe(0);
      expect(getLogLevelPriority(LogLevel.WARN)).toBe(1);
      expect(getLogLevelPriority(LogLevel.INFO)).toBe(2);
      expect(getLogLevelPriority(LogLevel.DEBUG)).toBe(3);
      expect(getLogLevelPriority(LogLevel.QUERY)).toBe(4);
    });

    it('should work in arrays', () => {
      const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO];

      expect(levels).toContain(LogLevel.ERROR);
      expect(levels).toContain(LogLevel.WARN);
      expect(levels).toContain(LogLevel.INFO);
      expect(levels).toHaveLength(3);
    });

    it('should work as object keys', () => {
      const logColors: Record<LogLevel, string> = {
        [LogLevel.ERROR]: 'red',
        [LogLevel.WARN]: 'yellow',
        [LogLevel.INFO]: 'blue',
        [LogLevel.DEBUG]: 'gray',
        [LogLevel.QUERY]: 'green',
      };

      expect(logColors[LogLevel.ERROR]).toBe('red');
      expect(logColors[LogLevel.WARN]).toBe('yellow');
      expect(logColors[LogLevel.INFO]).toBe('blue');
    });
  });

  describe('Type Safety', () => {
    it('should be type-safe', () => {
      const level: LogLevel = LogLevel.ERROR;

      expect(typeof level).toBe('string');
    });

    it('should support string values', () => {
      const errorString: string = LogLevel.ERROR;

      expect(errorString).toBe('error');
    });
  });

  describe('All Values', () => {
    it('should have all expected log levels', () => {
      const allLevels = Object.values(LogLevel);

      expect(allLevels).toContain('error');
      expect(allLevels).toContain('warn');
      expect(allLevels).toContain('info');
      expect(allLevels).toContain('debug');
      expect(allLevels).toContain('query');
      expect(allLevels).toHaveLength(5);
    });

    it('should have all expected log level keys', () => {
      const allKeys = Object.keys(LogLevel);

      expect(allKeys).toContain('ERROR');
      expect(allKeys).toContain('WARN');
      expect(allKeys).toContain('INFO');
      expect(allKeys).toContain('DEBUG');
      expect(allKeys).toContain('QUERY');
    });
  });
});

describe('SortOrder Enum', () => {
  describe('Enum Values', () => {
    it('should have ASC value', () => {
      expect(SortOrder.ASC).toBe('asc');
    });

    it('should have DESC value', () => {
      expect(SortOrder.DESC).toBe('desc');
    });
  });

  describe('Enum Usage', () => {
    it('should support comparison', () => {
      const order: SortOrder = SortOrder.ASC;

      expect(order === SortOrder.ASC).toBe(true);
    });

    it('should support switch statements', () => {
      const getOrderSymbol = (order: SortOrder): string => {
        switch (order) {
          case SortOrder.ASC:
            return '↑';
          case SortOrder.DESC:
            return '↓';
        }
      };

      expect(getOrderSymbol(SortOrder.ASC)).toBe('↑');
      expect(getOrderSymbol(SortOrder.DESC)).toBe('↓');
    });

    it('should work in arrays', () => {
      const orders = [SortOrder.ASC, SortOrder.DESC];

      expect(orders).toContain(SortOrder.ASC);
      expect(orders).toContain(SortOrder.DESC);
      expect(orders).toHaveLength(2);
    });

    it('should work as object keys', () => {
      const orderLabels: Record<SortOrder, string> = {
        [SortOrder.ASC]: 'Ascending',
        [SortOrder.DESC]: 'Descending',
      };

      expect(orderLabels[SortOrder.ASC]).toBe('Ascending');
      expect(orderLabels[SortOrder.DESC]).toBe('Descending');
    });

    it('should toggle between values', () => {
      const toggleOrder = (current: SortOrder): SortOrder => {
        return current === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
      };

      expect(toggleOrder(SortOrder.ASC)).toBe(SortOrder.DESC);
      expect(toggleOrder(SortOrder.DESC)).toBe(SortOrder.ASC);
    });
  });

  describe('Type Safety', () => {
    it('should be type-safe', () => {
      const order: SortOrder = SortOrder.ASC;

      expect(typeof order).toBe('string');
    });

    it('should support string values', () => {
      const ascString: string = SortOrder.ASC;

      expect(ascString).toBe('asc');
    });
  });

  describe('All Values', () => {
    it('should have all expected sort orders', () => {
      const allOrders = Object.values(SortOrder);

      expect(allOrders).toContain('asc');
      expect(allOrders).toContain('desc');
      expect(allOrders).toHaveLength(2);
    });

    it('should have all expected sort order keys', () => {
      const allKeys = Object.keys(SortOrder);

      expect(allKeys).toContain('ASC');
      expect(allKeys).toContain('DESC');
    });
  });

  describe('Sorting Integration', () => {
    it('should work with array sorting', () => {
      const items = [3, 1, 4, 1, 5, 9, 2, 6];

      const sortWithOrder = (order: SortOrder) => {
        return [...items].sort((a, b) => {
          return order === SortOrder.ASC ? a - b : b - a;
        });
      };

      const sortedAsc = sortWithOrder(SortOrder.ASC);
      const sortedDesc = sortWithOrder(SortOrder.DESC);

      expect(sortedAsc).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
      expect(sortedDesc).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
    });

    it('should determine sort direction', () => {
      const getSortMultiplier = (order: SortOrder): number => {
        return order === SortOrder.ASC ? 1 : -1;
      };

      expect(getSortMultiplier(SortOrder.ASC)).toBe(1);
      expect(getSortMultiplier(SortOrder.DESC)).toBe(-1);
    });
  });
});
