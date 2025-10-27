import { CircleData, Particle } from './types';
import { INITIAL_SPAWN_INTERVAL } from './constants';

// Game state
export const circles: CircleData[] = [];
export const particles: Particle[] = [];
export let selectedCircleIndex: number = -1;

export let maxChain: number = 0;
export let highScore: number = 0;
export let isGameOver: boolean = false;
export let gameOverStartTime: number = 0;
export let isNewHighScore: boolean = false;

// Spawning state
export let nextColorIndex: number = 0;
export let spawnInterval: number = INITIAL_SPAWN_INTERVAL;

// Setters for state that needs to be modified from other modules
export function setSelectedCircleIndex(index: number) {
    selectedCircleIndex = index;
}

export function setMaxChain(value: number) {
    maxChain = value;
}

export function setHighScore(value: number) {
    highScore = value;
}

export function setIsGameOver(value: boolean) {
    isGameOver = value;
}

export function setGameOverStartTime(time: number) {
    gameOverStartTime = time;
}

export function setIsNewHighScore(value: boolean) {
    isNewHighScore = value;
}

export function setNextColorIndex(index: number) {
    nextColorIndex = index;
}

export function setSpawnInterval(interval: number) {
    spawnInterval = interval;
}
