// Main entry point that wires all modules together

import { initPhysics, handleResize, getViewportDimensions } from './physics';
import { setupInputHandlers } from './input';
import { updateAnimations } from './gameLoop';
import { scheduleNextSpawn } from './spawning';

// Initialize the app once DOM is ready and canvas has dimensions
function initApp() {
    try {
        // Get viewport dimensions (ensure non-zero)
        const { width, height } = getViewportDimensions();

        // Validate dimensions
        if (width <= 0 || height <= 0) {
            console.error('Invalid dimensions:', width, height);
            // Retry after a short delay
            setTimeout(initApp, 100);
            return;
        }

        // Initialize physics with correct viewport dimensions
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
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already ready
    initApp();
}
