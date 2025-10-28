import { describe, it, expect, beforeEach } from '@jest/globals';
import { getViewportDimensions } from '../src/physics';

describe('physics module', () => {
  describe('getViewportDimensions', () => {
    beforeEach(() => {
      // Reset visualViewport
      delete (window as any).visualViewport;
    });

    it('should use visualViewport dimensions when available', () => {
      (window as any).visualViewport = {
        width: 1440,
        height: 900
      };

      const dimensions = getViewportDimensions();
      expect(dimensions.width).toBe(1440);
      expect(dimensions.height).toBe(900);
    });

    it('should fallback to window dimensions when visualViewport not available', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 1080 });

      const dimensions = getViewportDimensions();
      expect(dimensions.width).toBe(1920);
      expect(dimensions.height).toBe(1080);
    });

    it('should return correct dimensions for mobile with browser UI', () => {
      (window as any).visualViewport = {
        width: 390,
        height: 750 // Smaller than window due to browser UI
      };

      Object.defineProperty(window, 'innerWidth', { writable: true, value: 390 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 844 });

      const dimensions = getViewportDimensions();
      expect(dimensions.width).toBe(390);
      expect(dimensions.height).toBe(750);
    });
  });
});
