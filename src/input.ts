import { canvas } from './physics';
import { state } from './state';
import { GAME_OVER_CLICK_DELAY } from './constants';
import { restartGame } from './gameOver';
import { removeConnectedCircles } from './bubbles';
import { navigateSelection, selectMiddleCircle } from './selection';

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
                navigateSelection('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                navigateSelection('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                navigateSelection('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                navigateSelection('right');
                break;
            case 'Enter': // OK button
                event.preventDefault();
                if (state.selectedCircleIndex >= 0 && state.selectedCircleIndex < state.circles.length) {
                    removeConnectedCircles(state.circles[state.selectedCircleIndex]);
                }
                break;
            case ' ': // Space bar (alternative)
                event.preventDefault();
                if (state.selectedCircleIndex === -1) {
                    selectMiddleCircle();
                } else if (state.selectedCircleIndex >= 0 && state.selectedCircleIndex < state.circles.length) {
                    removeConnectedCircles(state.circles[state.selectedCircleIndex]);
                }
                break;
        }
    });
}
