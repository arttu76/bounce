import { engine } from './physics';
import {
    circles,
    particles,
    isGameOver,
    maxChain,
    highScore,
    setIsGameOver,
    setGameOverStartTime,
    setIsNewHighScore,
    setSelectedCircleIndex,
    setMaxChain,
    setSpawnInterval,
    setNextColorIndex,
    setHighScore
} from './state';
import { INITIAL_SPAWN_INTERVAL } from './constants';

// @ts-ignore - loaded as global from matter.min.js
const { World } = Matter;

// Trigger game over
export function triggerGameOver() {
    if (isGameOver) return; // Already in game over state
    setIsGameOver(true);
    setGameOverStartTime(Date.now());

    // Remove danger zone animation when game is over
    document.body.classList.remove('danger-zone');

    // Check if current round achieved new high score
    if (maxChain > highScore) {
        setHighScore(maxChain);
        setIsNewHighScore(true);
    } else {
        setIsNewHighScore(false);
    }
}

// Restart the game
export function restartGame() {
    // Remove all circles
    circles.forEach(circle => {
        World.remove(engine.world, circle.body);
    });
    circles.length = 0;

    // Remove all particles
    particles.forEach(particle => {
        World.remove(engine.world, particle.body);
    });
    particles.length = 0;

    // Reset game state
    setIsGameOver(false);
    setSelectedCircleIndex(-1);
    setMaxChain(0); // Reset max chain for new round
    setIsNewHighScore(false);
    // Keep highScore - it persists across games

    // Remove danger zone animation
    document.body.classList.remove('danger-zone');

    // Reset spawning state
    setSpawnInterval(INITIAL_SPAWN_INTERVAL);
    setNextColorIndex(0);

    // Don't spawn initial circles - let them accumulate naturally from the interval
}
