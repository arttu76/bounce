import { describe, it, expect } from '@jest/globals';
import {
  GAME_OVER_CLICK_DELAY,
  INITIAL_SPAWN_INTERVAL,
  SPAWN_INTERVAL_DECREASE,
  MIN_SPAWN_INTERVAL,
  COLORS,
  WALL_THICKNESS,
  DANGER_ZONE_THRESHOLD,
  TOUCH_TOLERANCE,
  GROUND_TOLERANCE,
  PARTICLES_PER_BUBBLE,
  PARTICLE_RADIUS,
  MAX_CHAIN_UI_OFFSET,
  SELECTION_RING_OFFSET
} from '../src/constants';

describe('constants', () => {
  describe('Game timing constants', () => {
    it('should have correct game over click delay', () => {
      expect(GAME_OVER_CLICK_DELAY).toBe(2000);
    });

    it('should have correct initial spawn interval', () => {
      expect(INITIAL_SPAWN_INTERVAL).toBe(500);
    });

    it('should have correct spawn interval decrease', () => {
      expect(SPAWN_INTERVAL_DECREASE).toBe(2);
    });

    it('should have correct minimum spawn interval', () => {
      expect(MIN_SPAWN_INTERVAL).toBe(50);
    });
  });

  describe('Color constants', () => {
    it('should have exactly 3 colors', () => {
      expect(COLORS).toHaveLength(3);
    });

    it('should have valid hex colors', () => {
      COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should have red, green, and blue colors', () => {
      expect(COLORS).toContain('#ff0000');
      expect(COLORS).toContain('#00ff00');
      expect(COLORS).toContain('#0000ff');
    });
  });

  describe('Physics constants', () => {
    it('should have correct wall thickness', () => {
      expect(WALL_THICKNESS).toBe(50);
    });

    it('should have correct touch tolerance', () => {
      expect(TOUCH_TOLERANCE).toBe(5);
    });

    it('should have correct ground tolerance', () => {
      expect(GROUND_TOLERANCE).toBe(10);
    });
  });

  describe('Particle constants', () => {
    it('should have correct particles per bubble', () => {
      expect(PARTICLES_PER_BUBBLE).toBe(33);
    });

    it('should have correct particle radius', () => {
      expect(PARTICLE_RADIUS).toBe(2);
    });
  });

  describe('UI constants', () => {
    it('should have correct danger zone threshold', () => {
      expect(DANGER_ZONE_THRESHOLD).toBe(20);
    });

    it('should have correct max chain UI offset', () => {
      expect(MAX_CHAIN_UI_OFFSET).toBe(200);
    });

    it('should have correct selection ring offset', () => {
      expect(SELECTION_RING_OFFSET).toBe(15);
    });
  });
});
