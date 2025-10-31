import Matter from 'matter-js';
import { Particle } from './types';
import { engine } from './physics';
import { state } from './state';
import { DANGER_ZONE_THRESHOLD, DEATH_FADE_TO_WHITE_DURATION, DEATH_FADE_FROM_WHITE_DURATION, DEATH_FADE_TOTAL_DURATION, SHOCKWAVE_DURATION, GAME_OVER_CLICK_DELAY } from './constants';
import { calculateHighestConnectedBubble, returnParticleToPool } from './bubbles';
import { triggerGameOver } from './gameOver';
import { updateMaxChainDisplay, showRestartText } from './ui';
import { getDeathAnimationColor } from './rendering';

const { World, Body } = Matter;

// Main game loop with requestAnimationFrame timestamp for better performance
export function updateAnimations(timestamp?: number) {
    // Use requestAnimationFrame timestamp if available, otherwise fall back to Date.now()
    const now = timestamp ?? Date.now();
    state.currentTime = now;

    // Update death animation for bubbles using cached color interpolation (must run even during game over)
    state.circles.forEach(circle => {
        if (circle.deathStartTime !== undefined) {
            const elapsed = now - circle.deathStartTime;

            // Only animate if the wave has started
            if (elapsed >= 0) {
                // Mark as animated on first frame
                if (!circle.deathAnimated) {
                    circle.deathAnimated = true;
                }

                if (elapsed <= DEATH_FADE_TOTAL_DURATION) {
                    // Use cached color interpolation for performance
                    const color = getDeathAnimationColor(circle.color, elapsed);
                    circle.body.render.fillStyle = color;
                } else {
                    // Animation complete, ensure original color is set
                    circle.body.render.fillStyle = circle.color;
                }
            }
        }
    });

    // Update particle opacity and remove old ones using pooling (must run even during game over)
    const particlesToRemove: Particle[] = [];
    state.particles.forEach(particle => {
        const age = now - particle.createdAt;
        const lifeProgress = age / 1000; // 1 second lifetime

        if (lifeProgress >= 1) {
            particlesToRemove.push(particle);
        } else {
            // Fade opacity from 1 to 0 (performance: only update opacity, not scale)
            particle.body.render.opacity = 1 - lifeProgress;
        }
    });

    // Return old particles to pool for reuse
    particlesToRemove.forEach(particle => {
        returnParticleToPool(particle);
    });

    // Remove from particles array using Set for O(n) performance
    if (particlesToRemove.length > 0) {
        const toRemoveSet = new Set(particlesToRemove);
        state.particles = state.particles.filter(particle => !toRemoveSet.has(particle));
    }

    // Update and remove old shockwaves (must run even during game over)
    state.shockwaves = state.shockwaves.filter(shockwave => {
        const age = now - shockwave.createdAt;
        return age < SHOCKWAVE_DURATION;
    });

    // Check for game over
    if (state.isGameOver) {
        // Show restart text after delay
        const timeSinceGameOver = now - state.gameOverStartTime;
        if (timeSinceGameOver >= GAME_OVER_CLICK_DELAY) {
            showRestartText();
        }
        // Continue animation loop
        requestAnimationFrame(updateAnimations);
        return;
    }

    // Check for game over using new chain-based detection
    const highestConnectedPercentage = calculateHighestConnectedBubble();
    if (highestConnectedPercentage !== null && highestConnectedPercentage < 0) {
        // Game over: the lowest bubble connects to a bubble above the screen
        triggerGameOver();
    }

    // Toggle danger zone background animation based on percentage
    if (highestConnectedPercentage !== null && highestConnectedPercentage <= DANGER_ZONE_THRESHOLD) {
        document.body.classList.add('danger-zone');
    } else {
        document.body.classList.remove('danger-zone');
    }

    // Validate selected index
    if (state.selectedCircleIndex >= state.circles.length) {
        state.selectedCircleIndex = -1;
    }

    // Update HTML UI elements (max chain display updated when it changes in bubbles.ts)
    requestAnimationFrame(updateAnimations);
}
