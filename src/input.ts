import { canvas } from './physics';
import { circles, isGameOver, gameOverStartTime, selectedCircleIndex } from './state';
import { GAME_OVER_CLICK_DELAY } from './constants';
import { restartGame } from './gameOver';
import { removeConnectedCircles } from './bubbles';
import { navigateSelection, selectMiddleCircle } from './selection';

// Handle mouse/touch clicks on circles
export function setupInputHandlers() {
    canvas.addEventListener('click', (event) => {
        // Check if game over - restart if enough time has passed
        if (isGameOver) {
            const timeSinceGameOver = Date.now() - gameOverStartTime;
            if (timeSinceGameOver >= GAME_OVER_CLICK_DELAY) {
                restartGame();
            }
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Check if click hit any circle
        for (let i = circles.length - 1; i >= 0; i--) {
            const circleData = circles[i];
            const dx = circleData.body.position.x - mouseX;
            const dy = circleData.body.position.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= circleData.currentRadius) {
                // Explode immediately on click
                removeConnectedCircles(circleData);
                break; // Only explode one circle per click
            }
        }
    });

    // Handle keyboard/remote control input
    window.addEventListener('keydown', (event) => {
        // Check if game over - restart on any key if enough time has passed
        if (isGameOver) {
            const timeSinceGameOver = Date.now() - gameOverStartTime;
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
                if (selectedCircleIndex >= 0 && selectedCircleIndex < circles.length) {
                    removeConnectedCircles(circles[selectedCircleIndex]);
                }
                break;
            case ' ': // Space bar (alternative)
                event.preventDefault();
                if (selectedCircleIndex === -1) {
                    selectMiddleCircle();
                } else if (selectedCircleIndex >= 0 && selectedCircleIndex < circles.length) {
                    removeConnectedCircles(circles[selectedCircleIndex]);
                }
                break;
        }
    });
}
