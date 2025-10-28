import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { state } from '../src/state';
import { triggerGameOver, restartGame } from '../src/gameOver';

// Mock Matter.js
jest.mock('matter-js');

describe('gameOver module', () => {
  beforeEach(() => {
    state.isGameOver = false;
    state.gameOverStartTime = 0;
    state.maxChain = 0;
    state.highScore = 0;
    state.isNewHighScore = false;
    state.circles = [];
    state.particles = [];
    state.selectedCircleIndex = -1;
  });

  describe('triggerGameOver', () => {
    it('should set game over state', () => {
      triggerGameOver();
      expect(state.isGameOver).toBe(true);
      expect(state.gameOverStartTime).toBeGreaterThan(0);
    });

    it('should not trigger twice', () => {
      triggerGameOver();
      const firstTime = state.gameOverStartTime;

      triggerGameOver();
      expect(state.gameOverStartTime).toBe(firstTime);
    });

    it('should set new high score when max chain exceeds high score', () => {
      state.maxChain = 10;
      state.highScore = 5;

      triggerGameOver();
      expect(state.highScore).toBe(10);
      expect(state.isNewHighScore).toBe(true);
    });

    it('should not set new high score when max chain does not exceed high score', () => {
      state.maxChain = 5;
      state.highScore = 10;

      triggerGameOver();
      expect(state.highScore).toBe(10);
      expect(state.isNewHighScore).toBe(false);
    });

    it('should remove danger zone animation', () => {
      document.body.classList.add('danger-zone');

      triggerGameOver();
      expect(document.body.classList.contains('danger-zone')).toBe(false);
    });
  });

  describe('restartGame', () => {
    beforeEach(() => {
      // Set up game over state
      state.isGameOver = true;
      state.gameOverStartTime = 1000;
      state.maxChain = 10;
      state.highScore = 10;
      state.isNewHighScore = true;
    });

    it('should reset game state', () => {
      restartGame();

      expect(state.isGameOver).toBe(false);
      // gameOverStartTime is not reset by restartGame, it persists
      expect(state.gameOverStartTime).toBe(1000);
      expect(state.maxChain).toBe(0);
      expect(state.isNewHighScore).toBe(false);
      expect(state.circles).toHaveLength(0);
      expect(state.particles).toHaveLength(0);
      expect(state.selectedCircleIndex).toBe(-1);
    });

    it('should preserve high score', () => {
      state.highScore = 15;

      restartGame();
      expect(state.highScore).toBe(15);
    });

    it('should remove danger zone animation', () => {
      document.body.classList.add('danger-zone');

      restartGame();
      expect(document.body.classList.contains('danger-zone')).toBe(false);
    });
  });
});
