import { canvas } from './physics';
import { state } from './state';
import { GAME_OVER_CLICK_DELAY } from './constants';
import { restartGame } from './gameOver';
import { removeConnectedCircles, addCircle } from './bubbles';
import { navigateSelection, selectMiddleCircle } from './selection';
import { InputMethod } from './types';

// Convert screen coordinates to canvas coordinates
// Accounts for canvas display size vs internal resolution
function getCanvasCoordinates(clientX: number, clientY: number): { x: number, y: number } {
    const rect = canvas.getBoundingClientRect();

    // Get the scale ratio between display size and canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Convert client coordinates to canvas coordinates with scaling
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
}

// Handle click/touch on canvas
function handleCanvasInteraction(clientX: number, clientY: number) {
    // Mark as mouse input method
    state.lastInputMethod = InputMethod.MOUSE;
    state.selectedCircleIndex = -1; // Deselect when using mouse

    // Check if game over - restart if enough time has passed
    if (state.isGameOver) {
        const timeSinceGameOver = Date.now() - state.gameOverStartTime;
        if (timeSinceGameOver >= GAME_OVER_CLICK_DELAY) {
            restartGame();
        }
        return;
    }

    const { x: canvasX, y: canvasY } = getCanvasCoordinates(clientX, clientY);

    // Check if click hit any circle
    for (let i = state.circles.length - 1; i >= 0; i--) {
        const circleData = state.circles[i];
        const dx = circleData.body.position.x - canvasX;
        const dy = circleData.body.position.y - canvasY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= circleData.initialRadius) {
            // Explode immediately on click
            removeConnectedCircles(circleData);
            break; // Only explode one circle per click
        }
    }
}

// Handle clicks on game over screen
function handleGameOverClick() {
    if (state.isGameOver) {
        const timeSinceGameOver = Date.now() - state.gameOverStartTime;
        if (timeSinceGameOver >= GAME_OVER_CLICK_DELAY) {
            restartGame();
        }
    }
}

// Handle mouse/touch clicks on circles
export function setupInputHandlers() {
    // Mouse click handler (desktop)
    canvas.addEventListener('click', (event) => {
        handleCanvasInteraction(event.clientX, event.clientY);
    });

    // Touch handler (mobile)
    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent mouse events from firing
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            handleCanvasInteraction(touch.clientX, touch.clientY);
        }
    });

    // Game over screen click handler
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
        gameOverScreen.addEventListener('click', handleGameOverClick);
        gameOverScreen.addEventListener('touchstart', (event) => {
            event.preventDefault();
            handleGameOverClick();
        });
    }

    // Handle keyboard/remote control input
    window.addEventListener('keydown', (event) => {
        // Check if game over - restart on any key if enough time has passed
        if (state.isGameOver) {
            const timeSinceGameOver = Date.now() - state.gameOverStartTime;
            if (timeSinceGameOver >= GAME_OVER_CLICK_DELAY) {
                event.preventDefault();
                restartGame();
            }
            return;
        }

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                state.lastInputMethod = InputMethod.KEYBOARD; // Mark as keyboard input
                navigateSelection('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                state.lastInputMethod = InputMethod.KEYBOARD; // Mark as keyboard input
                navigateSelection('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                state.lastInputMethod = InputMethod.KEYBOARD; // Mark as keyboard input
                navigateSelection('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                state.lastInputMethod = InputMethod.KEYBOARD; // Mark as keyboard input
                navigateSelection('right');
                break;
            case 'Enter': // OK button
                event.preventDefault();
                state.lastInputMethod = InputMethod.KEYBOARD; // Mark as keyboard input
                if (state.selectedCircleIndex >= 0 && state.selectedCircleIndex < state.circles.length) {
                    removeConnectedCircles(state.circles[state.selectedCircleIndex]);
                }
                break;
            case ' ': // Space bar (alternative)
                event.preventDefault();
                state.lastInputMethod = InputMethod.KEYBOARD; // Mark as keyboard input
                if (state.selectedCircleIndex === -1) {
                    selectMiddleCircle();
                } else if (state.selectedCircleIndex >= 0 && state.selectedCircleIndex < state.circles.length) {
                    removeConnectedCircles(state.circles[state.selectedCircleIndex]);
                }
                break;
            case 'p':
            case 'P':
                // Testing: spawn 20 circles immediately
                event.preventDefault();
                for (let i = 0; i < 20; i++) {
                    addCircle();
                }
                break;
        }
    });
}
