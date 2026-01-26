
import {clamp} from './math';

describe('Math utilities', () => {
  describe('clamp', () => {
    it('should return the value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('should clamp to minimum when value is too low', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, 0, 10)).toBe(0);
      expect(clamp(1, 1, 10)).toBe(1);
      expect(clamp(1.001, 1, 10)).toBe(1.001);
      expect(clamp(0.9999, 1, 10)).toBe(1);
    });

    it('should clamp to maximum when value is too high', () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, 0, 10)).toBe(10);
      expect(clamp(10, 0, 10)).toBe(10);
      expect(clamp(9.999, 0, 10)).toBe(9.999);
      expect(clamp(10.001, 0, 10)).toBe(10);
    });

    it('should work with negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });
  });
});
