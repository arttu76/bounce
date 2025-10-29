import Matter from 'matter-js';
import { render, canvas, engine } from './physics';
import { state } from './state';
import { GAME_OVER_CLICK_DELAY, MAX_CHAIN_UI_OFFSET, SELECTION_RING_OFFSET, SHOCKWAVE_DURATION, SHOCKWAVE_MAX_SCALE, SHOCKWAVE_MAX_OPACITY, SHOCKWAVE_LINE_WIDTH_RATIO, SHOCKWAVE_BLUR } from './constants';
import { MatterRender, InputMethod } from './types';

// Helper function to get brightness of a color (0-255)
function getColorBrightness(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Use perceived brightness formula
    return (r * 0.299 + g * 0.587 + b * 0.114);
}

// Helper function to darken a color
function darkenColor(color: string, amount: number): string {
    // Parse hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Darken by reducing each channel
    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));

    return `rgb(${newR}, ${newG}, ${newB})`;
}

// Set up custom bubble rendering with gradients and specular highlights
export function setupCustomBubbleRenderer(renderer: MatterRender) {
    Matter.Events.on(renderer, 'afterRender', () => {
        const ctx = renderer.context;
        const bodies = Matter.Composite.allBodies(engine.world);

        // First, render all bubbles
        bodies.forEach(body => {
            // Only render circles (bubbles and particles), not rectangles (walls)
            // Check for circleRadius to identify circles, and fillStyle for the color
            if (body.circleRadius && body.render && body.render.fillStyle) {
                const pos = body.position;
                const radius = body.circleRadius;
                const baseColor = body.render.fillStyle;
                const opacity = body.render.opacity !== undefined ? body.render.opacity : 1;

                // Apply opacity if it's less than 1 (for fading particles)
                if (opacity < 1) {
                    ctx.save();
                    ctx.globalAlpha = opacity;
                }

                // Always render with gradients and highlights (including during death animation)
                // Create radial gradient for 3D effect - offset but NO white in main gradient
                const gradient = ctx.createRadialGradient(
                    pos.x - radius * 0.3, // Offset to top-left for lighting
                    pos.y - radius * 0.3,
                    radius * 0.1,
                    pos.x,
                    pos.y,
                    radius
                );

                // Detect if color is very bright (like white during death animation)
                const brightness = getColorBrightness(baseColor);
                // Scale darkening based on brightness: bright colors get less darkening
                // brightness ranges from 0-255, white is 255
                const darkenAmount = brightness > 200 ? 0.2 : 0.7;

                // Main gradient: only base color and darkened edges (no white!)
                gradient.addColorStop(0, baseColor);
                gradient.addColorStop(0.6, baseColor);
                gradient.addColorStop(1, darkenColor(baseColor, darkenAmount));

                // Draw the gradient bubble
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Add specular highlight with ADDITIVE BLENDING to prevent darkening
                ctx.save();
                ctx.globalCompositeOperation = 'lighter'; // Additive blending - only brightens!

                const highlightX = pos.x - radius * 0.35;
                const highlightY = pos.y - radius * 0.35;
                const highlightRadius = radius * 0.4;

                const highlightGradient = ctx.createRadialGradient(
                    highlightX,
                    highlightY,
                    0,
                    highlightX,
                    highlightY,
                    highlightRadius
                );
                highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                highlightGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
                highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.beginPath();
                ctx.arc(highlightX, highlightY, highlightRadius, 0, Math.PI * 2);
                ctx.fillStyle = highlightGradient;
                ctx.fill();

                ctx.restore(); // Restore normal blending

                // Restore opacity if it was modified
                if (opacity < 1) {
                    ctx.restore();
                }
            }
        });

        // After rendering bubbles, draw shockwaves and selection indicator
        drawShockwaves();

        // Only draw selection indicator on canvas (game over and max chain are HTML now)
        if (!state.isGameOver) {
            drawSelectionIndicator();
        }
    });
}

// Draw shockwave effects
export function drawShockwaves() {
    const ctx = render.context;
    const now = Date.now();

    state.shockwaves.forEach(shockwave => {
        const age = now - shockwave.createdAt;
        const progress = age / SHOCKWAVE_DURATION;

        if (progress >= 1) return; // Skip if animation complete

        // Calculate current radius (1.0x to SHOCKWAVE_MAX_SCALE)
        const currentScale = 1.0 + (progress * (SHOCKWAVE_MAX_SCALE - 1.0));
        const currentRadius = shockwave.radius * currentScale;

        // Calculate opacity (SHOCKWAVE_MAX_OPACITY to 0)
        const opacity = SHOCKWAVE_MAX_OPACITY * (1 - progress);

        // Calculate line width (20% of bubble radius)
        const lineWidth = shockwave.radius * SHOCKWAVE_LINE_WIDTH_RATIO;

        // Draw expanding ring with gradient for blur effect
        ctx.save();

        // Create radial gradient for soft edge
        const gradient = ctx.createRadialGradient(
            shockwave.x, shockwave.y, currentRadius - lineWidth / 2,
            shockwave.x, shockwave.y, currentRadius + lineWidth / 2
        );

        // Gradient: transparent -> white -> transparent (creates soft ring)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        // Draw the ring as a filled circle with gradient
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(shockwave.x, shockwave.y, currentRadius + lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

// Helper function to draw the MAX CHAIN display
function renderMaxChainText(ctx: CanvasRenderingContext2D, centerX: number) {
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
}

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
    const centerX = canvas.width - MAX_CHAIN_UI_OFFSET;
    renderMaxChainText(ctx, centerX);

    ctx.restore();
}

// Draw selection indicator
export function drawSelectionIndicator() {
    // Only show selection indicator if last input was keyboard
    if (state.lastInputMethod !== InputMethod.KEYBOARD) return;

    if (state.selectedCircleIndex >= 0 && state.selectedCircleIndex < state.circles.length) {
        const selectedCircle = state.circles[state.selectedCircleIndex];
        const ctx = render.context;
        const pos = selectedCircle.body.position;
        const selectionRadius = selectedCircle.initialRadius + SELECTION_RING_OFFSET;

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
    const centerX = canvas.width - MAX_CHAIN_UI_OFFSET;
    renderMaxChainText(ctx, centerX);
    ctx.restore();
}
