// Main entry point that wires all modules together

import { initPhysics, handleResize, getViewportDimensions } from './physics';
import { setupInputHandlers } from './input';
import { updateAnimations } from './gameLoop';
import { scheduleNextSpawn } from './spawning';

let initAttempts = 0;

// Show debug info on screen
function showDebugInfo(message: string) {
    const debugEl = document.getElementById('debug-info');
    if (debugEl) {
        debugEl.textContent = message;
    }
    console.log(message);
}

// Show error on screen
function showError(message: string) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div style="color: #ff4444; font-size: 18px;">Error</div>
            <div style="margin-top: 10px;">${message}</div>
            <div style="font-size: 12px; margin-top: 10px; color: #888;">Check console for details</div>
        `;
    }
    console.error(message);
}

// Hide loading indicator
function hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

// Initialize the app once DOM is ready and canvas has dimensions
function initApp() {
    try {
        initAttempts++;
        showDebugInfo(`Initializing... (attempt ${initAttempts})`);

        // Get viewport dimensions (ensure non-zero)
        const { width, height } = getViewportDimensions();

        // Validate dimensions
        if (width <= 0 || height <= 0) {
            console.error('Invalid dimensions:', width, height);

            // Give up after 50 attempts (5 seconds)
            if (initAttempts > 50) {
                showError(`Failed to get valid screen dimensions after ${initAttempts} attempts. Size: ${width}x${height}`);
                return;
            }

            // Retry after a short delay
            showDebugInfo(`Waiting for valid dimensions... (${width}x${height})`);
            setTimeout(initApp, 100);
            return;
        }

        showDebugInfo(`Starting with ${width}x${height}...`);

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

        // Hide loading indicator after successful init
        setTimeout(hideLoading, 500);

        console.log('✅ Bounce initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError(`Initialization failed: ${error}`);
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    showDebugInfo('Waiting for DOM...');
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already ready
    initApp();
}
