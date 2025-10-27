import { render, canvas } from './physics';
import { state } from './state';
import { GAME_OVER_CLICK_DELAY } from './constants';

// Draw game over screen
export function drawGameOver() {
    const ctx = render.context;
    ctx.save();

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw "New high score!" if achieved
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (state.isNewHighScore) {
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#FFD700'; // Gold/yellow color
        ctx.fillText('👑 New high score!', canvas.width / 2, canvas.height / 2 - 150);
    }

    // Draw "GAME OVER" in center
    ctx.font = 'bold 96px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

    // Draw max chain achieved this round
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Max chain: ${state.maxChain}`, canvas.width / 2, canvas.height / 2 + 30);

    // Draw high score
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`High score: ${state.highScore}`, canvas.width / 2, canvas.height / 2 + 80);

    // Draw "Click to restart" message after delay
    const timeSinceGameOver = Date.now() - state.gameOverStartTime;
    if (timeSinceGameOver >= GAME_OVER_CLICK_DELAY) {
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 150);
    }

    // Draw max chain in top right corner (same as during game)
    ctx.textAlign = 'center';
    const centerX = canvas.width - 200;

    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';
    ctx.fillText('MAX', centerX, 140);

    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CHAIN', centerX, 180);

    ctx.font = 'bold 96px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${state.maxChain}`, centerX, 220);

    ctx.restore();
}

// Draw selection indicator
export function drawSelectionIndicator() {
    if (state.selectedCircleIndex >= 0 && state.selectedCircleIndex < state.circles.length) {
        const selectedCircle = state.circles[state.selectedCircleIndex];
        const ctx = render.context;
        const pos = selectedCircle.body.position;
        const selectionRadius = selectedCircle.currentRadius + 15; // Offset from circle edge

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, selectionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff'; // White
        ctx.lineWidth = 5;
        ctx.stroke();
    }
}

// Draw max chain display in top right
export function drawMaxChainDisplay() {
    const ctx = render.context;
    ctx.save();
    ctx.textAlign = 'center';
    const centerX = canvas.width - 200; // Centered in top right area

    // Draw "MAX"
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';
    ctx.fillText('MAX', centerX, 140);

    // Draw "CHAIN"
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CHAIN', centerX, 180);

    // Draw chain number in BIG letters
    ctx.font = 'bold 96px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${state.maxChain}`, centerX, 220);

    ctx.restore();
}
