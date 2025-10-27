import { engine } from './physics';
import { isGameOver, particles, selectedCircleIndex, setSelectedCircleIndex, circles } from './state';
import { DANGER_ZONE_THRESHOLD } from './constants';
import { calculateHighestConnectedBubble } from './bubbles';
import { triggerGameOver } from './gameOver';
import { drawGameOver, drawSelectionIndicator, drawMaxChainDisplay } from './rendering';
// @ts-ignore - loaded as global from matter.min.js
const { World, Body } = Matter;
// Main game loop
export function updateAnimations() {
    const now = Date.now();
    // Check for game over
    if (isGameOver) {
        // Skip rest of updates during game over
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
    }
    else {
        document.body.classList.remove('danger-zone');
    }
    // Validate selected index
    if (selectedCircleIndex >= circles.length) {
        setSelectedCircleIndex(-1);
    }
    // Update particle colors, size, and remove old ones
    const particlesToRemove = [];
    particles.forEach(particle => {
        const age = now - particle.createdAt;
        const lifeProgress = age / 1000; // 1 second lifetime
        if (lifeProgress >= 1) {
            particlesToRemove.push(particle);
        }
        else {
            // Fade opacity from 1 to 0
            const opacity = 1 - lifeProgress;
            particle.body.render.opacity = opacity;
            // Shrink particle as it ages (from 1.0 to 0.1 of initial size)
            const targetScale = 1 - (lifeProgress * 0.9); // Scale from 1.0 to 0.1
            const currentRadius = particle.initialRadius * targetScale;
            const scaleFactor = currentRadius / (particle.body.circleRadius || particle.initialRadius);
            if (scaleFactor > 0.01) { // Prevent scaling to zero
                Body.scale(particle.body, scaleFactor, scaleFactor);
            }
        }
    });
    particlesToRemove.forEach(particle => {
        World.remove(engine.world, particle.body);
        const index = particles.indexOf(particle);
        if (index > -1) {
            particles.splice(index, 1);
        }
    });
    // Draw selection indicator
    drawSelectionIndicator();
    // Draw max chain display
    drawMaxChainDisplay();
    requestAnimationFrame(updateAnimations);
}
