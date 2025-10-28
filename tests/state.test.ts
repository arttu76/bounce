import { describe, it, expect, beforeEach } from '@jest/globals';
import { state } from '../src/state';
import { INITIAL_SPAWN_INTERVAL } from '../src/constants';

describe('state module', () => {
  beforeEach(() => {
    // Reset state to initial values
    state.circles = [];
    state.particles = [];
    state.selectedCircleIndex = -1;
    state.maxChain = 0;
    state.highScore = 0;
    state.isGameOver = false;
    state.gameOverStartTime = 0;
    state.isNewHighScore = false;
    state.nextColorIndex = 0;
    state.spawnInterval = INITIAL_SPAWN_INTERVAL;
  });

  describe('initial state', () => {
    it('should have empty circles array', () => {
      expect(state.circles).toEqual([]);
    });

    it('should have empty particles array', () => {
      expect(state.particles).toEqual([]);
    });

    it('should have no selection', () => {
      expect(state.selectedCircleIndex).toBe(-1);
    });

    it('should have zero max chain', () => {
      expect(state.maxChain).toBe(0);
    });

    it('should have zero high score', () => {
      expect(state.highScore).toBe(0);
    });

    it('should not be in game over state', () => {
      expect(state.isGameOver).toBe(false);
    });

    it('should have zero game over start time', () => {
      expect(state.gameOverStartTime).toBe(0);
    });

    it('should not have new high score', () => {
      expect(state.isNewHighScore).toBe(false);
    });

    it('should start with first color index', () => {
      expect(state.nextColorIndex).toBe(0);
    });

    it('should have initial spawn interval', () => {
      expect(state.spawnInterval).toBe(INITIAL_SPAWN_INTERVAL);
    });
  });

  describe('state mutations', () => {
    it('should allow adding circles', () => {
      const mockCircle = {
        body: { position: { x: 100, y: 100 } } as any,
        createdAt: Date.now(),
        initialRadius: 50,
        color: '#ff0000'
      };

      state.circles.push(mockCircle);
      expect(state.circles).toHaveLength(1);
      expect(state.circles[0]).toBe(mockCircle);
    });

    it('should allow updating max chain', () => {
      state.maxChain = 10;
      expect(state.maxChain).toBe(10);
    });

    it('should allow cycling color index', () => {
      state.nextColorIndex = 1;
      expect(state.nextColorIndex).toBe(1);

      state.nextColorIndex = (state.nextColorIndex + 1) % 3;
      expect(state.nextColorIndex).toBe(2);
    });

    it('should allow updating spawn interval', () => {
      state.spawnInterval = 400;
      expect(state.spawnInterval).toBe(400);
    });
  });
});
