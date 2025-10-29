// Main entry point that wires all modules together

import { initPhysics, handleResize, getViewportDimensions } from './physics';
import { setupInputHandlers } from './input';
import { updateAnimations } from './gameLoop';
import { scheduleNextSpawn } from './spawning';

// Initialize physics with correct viewport dimensions
const { width, height } = getViewportDimensions();
initPhysics(width, height);

// Listen to both window resize and mobile viewport changes
window.addEventListener('resize', handleResize);
if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
}

// Setup input event handlers
setupInputHandlers();

// Start the main game loop
updateAnimations();

// Start bubble spawning
scheduleNextSpawn();
