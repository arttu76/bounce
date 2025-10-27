import { INITIAL_SPAWN_INTERVAL } from './constants';
// Game state
export const circles = [];
export const particles = [];
export let selectedCircleIndex = -1;
export let maxChain = 0;
export let highScore = 0;
export let isGameOver = false;
export let gameOverStartTime = 0;
export let isNewHighScore = false;
// Spawning state
export let nextColorIndex = 0;
export let spawnInterval = INITIAL_SPAWN_INTERVAL;
// Setters for state that needs to be modified from other modules
export function setSelectedCircleIndex(index) {
    selectedCircleIndex = index;
}
export function setMaxChain(value) {
    maxChain = value;
}
export function setHighScore(value) {
    highScore = value;
}
export function setIsGameOver(value) {
    isGameOver = value;
}
export function setGameOverStartTime(time) {
    gameOverStartTime = time;
}
export function setIsNewHighScore(value) {
    isNewHighScore = value;
}
export function setNextColorIndex(index) {
    nextColorIndex = index;
}
export function setSpawnInterval(interval) {
    spawnInterval = interval;
}
