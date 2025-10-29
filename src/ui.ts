// UI management using HTML elements instead of canvas drawing
import { state } from './state';

// Get DOM elements
const maxChainDisplay = document.getElementById('max-chain-display');
const chainValueEl = maxChainDisplay?.querySelector('.chain-value');
const gameOverScreen = document.getElementById('game-over-screen');
const newHighScoreEl = document.getElementById('new-high-score');
const maxChainTextEl = gameOverScreen?.querySelector('.max-chain-text');
const highScoreTextEl = gameOverScreen?.querySelector('.high-score-text');
const restartTextEl = gameOverScreen?.querySelector('.restart-text');

// Update max chain display
export function updateMaxChainDisplay() {
    if (chainValueEl) {
        chainValueEl.textContent = state.maxChain.toString();
    }
}

// Show game over screen
export function showGameOver() {
    if (gameOverScreen) {
        gameOverScreen.style.display = 'flex';
    }

    // Update new high score indicator
    if (newHighScoreEl) {
        newHighScoreEl.style.display = state.isNewHighScore ? 'block' : 'none';
    }

    // Update max chain text
    if (maxChainTextEl) {
        maxChainTextEl.textContent = `Max chain: ${state.maxChain}`;
    }

    // Update high score text
    if (highScoreTextEl) {
        highScoreTextEl.textContent = `High score: ${state.highScore}`;
    }
}

// Hide game over screen
export function hideGameOver() {
    if (gameOverScreen) {
        gameOverScreen.style.display = 'none';
    }
    if (restartTextEl) {
        restartTextEl.style.display = 'none';
    }
}

// Show restart text after delay
export function showRestartText() {
    if (restartTextEl) {
        restartTextEl.style.display = 'block';
    }
}
