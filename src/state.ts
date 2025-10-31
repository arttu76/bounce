import { CircleData, Particle, Shockwave, InputMethod } from './types';
import { INITIAL_SPAWN_INTERVAL } from './constants';

// Game state object
export const state = {
    // Collections
    circles: [] as CircleData[],
    particles: [] as Particle[],
    shockwaves: [] as Shockwave[],

    // Selection
    selectedCircleIndex: -1,
    lastInputMethod: InputMethod.MOUSE, // Track input method for showing selection indicator

    // Score tracking
    maxChain: 0,
    highScore: 0,

    // Game over state
    isGameOver: false,
    gameOverStartTime: 0,
    isNewHighScore: false,

    // Spawning state
    nextColorIndex: 0,
    spawnInterval: INITIAL_SPAWN_INTERVAL,

    // Performance tracking
    currentTime: Date.now(), // Updated by requestAnimationFrame for consistent timing

    // Particle pooling
    particlePool: [] as Particle[]
};

// Helper function to update state (optional, for convenience)
export function updateState(updates: Partial<typeof state>) {
    Object.assign(state, updates);
}
