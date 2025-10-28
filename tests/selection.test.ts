import { describe, it, expect, beforeEach } from '@jest/globals';
import { state } from '../src/state';
import { navigateSelection, selectMiddleCircle, selectNearestCircleToPosition } from '../src/selection';
import type { CircleData } from '../src/types';

describe('selection module', () => {
  beforeEach(() => {
    state.circles = [];
    state.selectedCircleIndex = -1;
  });

  describe('navigateSelection', () => {
    it('should select middle circle when no selection exists', () => {
      const circles: CircleData[] = [
        { body: { position: { x: 100, y: 100 } } as any, createdAt: Date.now(), initialRadius: 50, color: '#ff0000' },
        { body: { position: { x: 200, y: 200 } } as any, createdAt: Date.now(), initialRadius: 50, color: '#00ff00' },
        { body: { position: { x: 300, y: 300 } } as any, createdAt: Date.now(), initialRadius: 50, color: '#0000ff' }
      ];
      state.circles = circles;

      navigateSelection('right');
      expect(state.selectedCircleIndex).toBeGreaterThanOrEqual(0);
      expect(state.selectedCircleIndex).toBeLessThan(circles.length);
    });

    it('should navigate to the right correctly', () => {
      const leftCircle: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const rightCircle: CircleData = {
        body: { position: { x: 200, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#00ff00'
      };

      state.circles = [leftCircle, rightCircle];
      state.selectedCircleIndex = 0;

      navigateSelection('right');
      expect(state.selectedCircleIndex).toBe(1);
    });

    it('should navigate up correctly', () => {
      const bottomCircle: CircleData = {
        body: { position: { x: 100, y: 200 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const topCircle: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#00ff00'
      };

      state.circles = [bottomCircle, topCircle];
      state.selectedCircleIndex = 0;

      navigateSelection('up');
      expect(state.selectedCircleIndex).toBe(1);
    });

    it('should navigate down correctly', () => {
      const topCircle: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const bottomCircle: CircleData = {
        body: { position: { x: 100, y: 200 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#00ff00'
      };

      state.circles = [topCircle, bottomCircle];
      state.selectedCircleIndex = 0;

      navigateSelection('down');
      expect(state.selectedCircleIndex).toBe(1);
    });

    it('should navigate left correctly', () => {
      const rightCircle: CircleData = {
        body: { position: { x: 200, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const leftCircle: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#00ff00'
      };

      state.circles = [rightCircle, leftCircle];
      state.selectedCircleIndex = 0;

      navigateSelection('left');
      expect(state.selectedCircleIndex).toBe(1);
    });
  });

  describe('selectMiddleCircle', () => {
    it('should select circle closest to screen center', () => {
      const farCircle: CircleData = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const centerCircle: CircleData = {
        body: { position: { x: 960, y: 540 } } as any, // Near 1920x1080 center
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#00ff00'
      };

      state.circles = [farCircle, centerCircle];

      selectMiddleCircle();
      expect(state.selectedCircleIndex).toBe(1);
    });

    it('should clear selection if no circles exist', () => {
      state.circles = [];
      state.selectedCircleIndex = 0;

      selectMiddleCircle();
      expect(state.selectedCircleIndex).toBe(-1);
    });
  });

  describe('selectNearestCircleToPosition', () => {
    it('should select nearest circle to given position', () => {
      const farCircle: CircleData = {
        body: { position: { x: 500, y: 500 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      const nearCircle: CircleData = {
        body: { position: { x: 150, y: 150 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#00ff00'
      };

      state.circles = [farCircle, nearCircle];

      selectNearestCircleToPosition(100, 100);
      expect(state.selectedCircleIndex).toBe(1);
    });

    it('should clear selection if no circles exist', () => {
      state.circles = [];
      state.selectedCircleIndex = 0;

      selectNearestCircleToPosition(100, 100);
      expect(state.selectedCircleIndex).toBe(-1);
    });
  });
});
