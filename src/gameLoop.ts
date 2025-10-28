import Matter from 'matter-js';
import { Particle } from './types';
import { engine } from './physics';
import { state } from './state';
import { DANGER_ZONE_THRESHOLD, DEATH_FADE_TO_WHITE_DURATION, DEATH_FADE_FROM_WHITE_DURATION, DEATH_FADE_TOTAL_DURATION, SHOCKWAVE_DURATION } from './constants';
import { calculateHighestConnectedBubble } from './bubbles';
import { triggerGameOver } from './gameOver';
import { drawGameOver, drawSelectionIndicator, drawMaxChainDisplay, drawShockwaves } from './rendering';

const { World, Body } = Matter;

// Helper function to interpolate between two hex colors
function interpolateColor(color1: string, color2: string, progress: number): string {
    // Parse hex colors
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    // Interpolate
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Main game loop
export function updateAnimations() {
    const now = Date.now();

    // Update death animation for bubbles (must run even during game over)
    state.circles.forEach(circle => {
        if (circle.deathStartTime !== undefined) {
            const elapsed = now - circle.deathStartTime;

            // Only animate if the wave has started
            if (elapsed >= 0) {
                // Mark as animated on first frame
                if (!circle.deathAnimated) {
                    circle.deathAnimated = true;
                }

                if (elapsed <= DEATH_FADE_TO_WHITE_DURATION) {
                    // Phase 1: Fade from original color TO white (quick and dramatic)
                    const progress = elapsed / DEATH_FADE_TO_WHITE_DURATION;
                    const color = interpolateColor(circle.color, '#ffffff', progress);
                    circle.body.render.fillStyle = color;
                } else if (elapsed <= DEATH_FADE_TOTAL_DURATION) {
                    // Phase 2: Fade FROM white back to original color
                    const fadeFromWhiteElapsed = elapsed - DEATH_FADE_TO_WHITE_DURATION;
                    const progress = fadeFromWhiteElapsed / DEATH_FADE_FROM_WHITE_DURATION;
                    const color = interpolateColor('#ffffff', circle.color, progress);
                    circle.body.render.fillStyle = color;
                } else {
                    // Animation complete, ensure original color is set
                    circle.body.render.fillStyle = circle.color;
                }
            }
        }
    });

    // Update particle opacity and remove old ones (must run even during game over)
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

    // Remove old particles
    particlesToRemove.forEach(particle => {
        World.remove(engine.world, particle.body);
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
        // Continue to show game over screen
        drawGameOver();
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

    // Draw selection indicator
    drawSelectionIndicator();

    // Draw max chain display
    drawMaxChainDisplay();

    // Draw shockwave effects
    drawShockwaves();

    requestAnimationFrame(updateAnimations);
}
