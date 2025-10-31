import Matter from 'matter-js';
import { engine } from './physics';
import { state } from './state';
import { INITIAL_SPAWN_INTERVAL, DEATH_ANIMATION_DURATION } from './constants';
import { setupDeathAnimation } from './bubbles';
import { showGameOver, hideGameOver, updateMaxChainDisplay } from './ui';

const { World } = Matter;

// Trigger game over
export function triggerGameOver() {
    if (state.isGameOver) return; // Already in game over state

    // Setup the cascading death animation (2 second duration)
    setupDeathAnimation();

    // Remove danger zone animation when game is over
    document.body.classList.remove('danger-zone');

    // Check if current round achieved new high score
    const isNewHighScore = state.maxChain > state.highScore;
    if (isNewHighScore) {
        state.highScore = state.maxChain;
    }

    // Update state
    // Delay gameOverStartTime to allow death animation to complete
    Object.assign(state, {
        isGameOver: true,
        gameOverStartTime: state.currentTime + DEATH_ANIMATION_DURATION,
        isNewHighScore
    });

    // Show game over UI after death animation completes
    setTimeout(() => {
        showGameOver();
    }, DEATH_ANIMATION_DURATION);
}

// Restart the game
export function restartGame() {
    // Remove all circles
    state.circles.forEach(circle => {
        World.remove(engine.world, circle.body);
    });
    state.circles.length = 0;

    // Remove all particles
    state.particles.forEach(particle => {
        World.remove(engine.world, particle.body);
    });
    state.particles.length = 0;

    // Remove all shockwaves
    state.shockwaves.length = 0;

    // Remove danger zone animation
    document.body.classList.remove('danger-zone');

    // Hide game over UI
    hideGameOver();

    // Reset game state
    Object.assign(state, {
        isGameOver: false,
        selectedCircleIndex: -1,
        maxChain: 0,
        isNewHighScore: false,
        spawnInterval: INITIAL_SPAWN_INTERVAL,
        nextColorIndex: 0
    });
    // Note: highScore persists across games

    // Update UI to reflect reset
    updateMaxChainDisplay();

    // Don't spawn initial circles - let them accumulate naturally from the interval
}
