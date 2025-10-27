import { CircleData, Particle } from './types';
import { INITIAL_SPAWN_INTERVAL } from './constants';

// Game state object
export const state = {
    // Collections
    circles: [] as CircleData[],
    particles: [] as Particle[],

    // Selection
    selectedCircleIndex: -1,

    // Score tracking
    maxChain: 0,
    highScore: 0,

    // Game over state
    isGameOver: false,
    gameOverStartTime: 0,
    isNewHighScore: false,

    // Spawning state
    nextColorIndex: 0,
    spawnInterval: INITIAL_SPAWN_INTERVAL
};

// Helper function to update state (optional, for convenience)
export function updateState(updates: Partial<typeof state>) {
    Object.assign(state, updates);
}
