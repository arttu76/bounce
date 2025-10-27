// Main entry point that wires all modules together

import { initPhysics, handleResize } from './physics';
import { setupInputHandlers } from './input';
import { updateAnimations } from './gameLoop';
import { scheduleNextSpawn } from './spawning';

// Initialize physics and window resize handling
initPhysics(window.innerWidth, window.innerHeight);
window.addEventListener('resize', handleResize);

// Setup input event handlers
setupInputHandlers();

// Start the main game loop
updateAnimations();

// Start bubble spawning
scheduleNextSpawn();
