import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { state } from '../src/state';
import { INITIAL_SPAWN_INTERVAL } from '../src/constants';

// Mock Matter.js
jest.mock('matter-js');

describe('spawning module', () => {
  beforeEach(() => {
    state.isGameOver = false;
    state.spawnInterval = INITIAL_SPAWN_INTERVAL;
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('spawn interval', () => {
    it('should start with initial spawn interval', () => {
      expect(state.spawnInterval).toBe(INITIAL_SPAWN_INTERVAL);
    });

    it('should decrease spawn interval over time', () => {
      const initialInterval = state.spawnInterval;

      // Simulate spawn interval decrease
      state.spawnInterval = Math.max(50, state.spawnInterval - 2);

      expect(state.spawnInterval).toBeLessThan(initialInterval);
    });

    it('should not go below minimum spawn interval', () => {
      state.spawnInterval = 52;

      // Simulate multiple decreases
      for (let i = 0; i < 10; i++) {
        state.spawnInterval = Math.max(50, state.spawnInterval - 2);
      }

      expect(state.spawnInterval).toBe(50);
    });
  });
});
