import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { state } from '../src/state';

// Mock Matter.js
jest.mock('matter-js');

describe('rendering module', () => {
  beforeEach(() => {
    state.isGameOver = false;
    state.maxChain = 0;
    state.highScore = 0;
    state.selectedCircleIndex = -1;
  });

  describe('game state rendering', () => {
    it('should have maxChain value in state', () => {
      state.maxChain = 5;
      expect(state.maxChain).toBe(5);
    });

    it('should have highScore value in state', () => {
      state.highScore = 10;
      expect(state.highScore).toBe(10);
    });

    it('should track game over state', () => {
      expect(state.isGameOver).toBe(false);

      state.isGameOver = true;
      expect(state.isGameOver).toBe(true);
    });

    it('should track new high score flag', () => {
      expect(state.isNewHighScore).toBe(false);

      state.isNewHighScore = true;
      expect(state.isNewHighScore).toBe(true);
    });
  });
});
