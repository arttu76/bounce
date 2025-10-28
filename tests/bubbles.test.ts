import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { state } from '../src/state';
import { areTouching, findConnectedCircles, findAllConnectedCircles } from '../src/bubbles';
import type { CircleData } from '../src/types';

// Mock Matter.js
jest.mock('matter-js');

describe('bubbles module', () => {
  beforeEach(() => {
    // Reset state before each test
    state.circles = [];
    state.particles = [];
    state.selectedCircleIndex = -1;
    state.maxChain = 0;
    state.nextColorIndex = 0;
  });

  describe('areTouching', () => {
    it('should return true when circles are touching', () => {
      const circle1: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle2: CircleData = {
        body: { position: { x: 150, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      // Distance is 50, radii sum is 100, plus 5 tolerance = 105
      expect(areTouching(circle1, circle2)).toBe(true);
    });

    it('should return false when circles are not touching', () => {
      const circle1: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle2: CircleData = {
        body: { position: { x: 300, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      // Distance is 200, radii sum is 100, plus 5 tolerance = 105
      expect(areTouching(circle1, circle2)).toBe(false);
    });

    it('should account for touch tolerance', () => {
      const circle1: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle2: CircleData = {
        body: { position: { x: 154, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      // Distance is 54, radii sum is 100, tolerance is 5, so 54 <= 105
      expect(areTouching(circle1, circle2)).toBe(true);
    });
  });

  describe('findConnectedCircles', () => {
    it('should find single circle when no other circles touch', () => {
      const circle1: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle2: CircleData = {
        body: { position: { x: 300, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      state.circles = [circle1, circle2];

      const connected = findConnectedCircles(circle1);
      expect(connected).toHaveLength(1);
      expect(connected[0]).toBe(circle1);
    });

    it('should find connected circles of same color', () => {
      const circle1: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle2: CircleData = {
        body: { position: { x: 150, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle3: CircleData = {
        body: { position: { x: 200, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      state.circles = [circle1, circle2, circle3];

      const connected = findConnectedCircles(circle1);
      expect(connected).toHaveLength(3);
      expect(connected).toContain(circle1);
      expect(connected).toContain(circle2);
      expect(connected).toContain(circle3);
    });

    it('should not include circles of different color', () => {
      const circle1: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle2: CircleData = {
        body: { position: { x: 150, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#00ff00' // Different color
      };

      state.circles = [circle1, circle2];

      const connected = findConnectedCircles(circle1);
      expect(connected).toHaveLength(1);
      expect(connected[0]).toBe(circle1);
    });

    it('should handle circular chains correctly', () => {
      const circle1: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle2: CircleData = {
        body: { position: { x: 150, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle3: CircleData = {
        body: { position: { x: 125, y: 140 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      state.circles = [circle1, circle2, circle3];

      const connected = findConnectedCircles(circle1);
      expect(connected).toHaveLength(3);
    });
  });

  describe('findAllConnectedCircles', () => {
    it('should find connected circles regardless of color', () => {
      const circle1: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const circle2: CircleData = {
        body: { position: { x: 150, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#00ff00' // Different color but touching
      };

      const circle3: CircleData = {
        body: { position: { x: 200, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#0000ff' // Different color but touching
      };

      state.circles = [circle1, circle2, circle3];

      const connected = findAllConnectedCircles(circle1);
      expect(connected).toHaveLength(3);
      expect(connected).toContain(circle1);
      expect(connected).toContain(circle2);
      expect(connected).toContain(circle3);
    });
  });
});
