import Matter from 'matter-js';
import { render, canvas, engine } from './physics';
import { state } from './state';
import { GAME_OVER_CLICK_DELAY, MAX_CHAIN_UI_OFFSET, SELECTION_RING_OFFSET, SHOCKWAVE_DURATION, SHOCKWAVE_MAX_SCALE, SHOCKWAVE_MAX_OPACITY, SHOCKWAVE_LINE_WIDTH_RATIO, SHOCKWAVE_BLUR, COLORS, DEATH_FADE_TO_WHITE_DURATION, DEATH_FADE_FROM_WHITE_DURATION } from './constants';
import { MatterRender, InputMethod } from './types';

// Color interpolation lookup table for death animations
// Pre-calculate all color interpolation steps for each color
const COLOR_INTERPOLATION_STEPS = 100; // 100 steps for smooth animation
const colorInterpolationCache: Map<string, string[]> = new Map();

// Initialize color interpolation cache for each game color
function initColorInterpolationCache() {
    COLORS.forEach(color => {
        const toWhite: string[] = [];
        const fromWhite: string[] = [];

        // Pre-calculate steps from color to white
        for (let i = 0; i <= COLOR_INTERPOLATION_STEPS; i++) {
            const progress = i / COLOR_INTERPOLATION_STEPS;
            toWhite.push(interpolateColorFast(color, '#ffffff', progress));
        }

        // Pre-calculate steps from white to color
        for (let i = 0; i <= COLOR_INTERPOLATION_STEPS; i++) {
            const progress = i / COLOR_INTERPOLATION_STEPS;
            fromWhite.push(interpolateColorFast('#ffffff', color, progress));
        }

        colorInterpolationCache.set(color, [...toWhite, ...fromWhite]);
    });
}

// Fast color interpolation using pre-parsed values
function interpolateColorFast(color1: string, color2: string, progress: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Get interpolated color from cache for death animation
export function getDeathAnimationColor(baseColor: string, elapsed: number): string {
    const cache = colorInterpolationCache.get(baseColor);
    if (!cache) return baseColor; // Fallback if color not in cache

    if (elapsed <= DEATH_FADE_TO_WHITE_DURATION) {
        // Phase 1: Fade to white
        const progress = elapsed / DEATH_FADE_TO_WHITE_DURATION;
        const index = Math.floor(progress * COLOR_INTERPOLATION_STEPS);
        return cache[Math.min(index, COLOR_INTERPOLATION_STEPS)];
    } else {
        // Phase 2: Fade from white
        const fadeFromWhiteElapsed = elapsed - DEATH_FADE_TO_WHITE_DURATION;
        const progress = fadeFromWhiteElapsed / DEATH_FADE_FROM_WHITE_DURATION;
        const index = Math.floor(progress * COLOR_INTERPOLATION_STEPS);
        return cache[COLOR_INTERPOLATION_STEPS + Math.min(index, COLOR_INTERPOLATION_STEPS)];
    }
}

// Initialize the cache when module loads
initColorInterpolationCache();

// Helper function to get brightness of a color (0-255)
export function getColorBrightness(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Use perceived brightness formula
    return (r * 0.299 + g * 0.587 + b * 0.114);
}

// Helper function to darken a color
export function darkenColor(color: string, amount: number): string {
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

// Create a cached sprite for a bubble with gradients and highlights
export function createBubbleSprite(radius: number, baseColor: string, darkenedColor: string, brightness: number): HTMLCanvasElement | OffscreenCanvas {
    // Use OffscreenCanvas if available for better performance
    const size = Math.ceil(radius * 2);
    const canvas = typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(size, size)
        : document.createElement('canvas');

    if (canvas instanceof HTMLCanvasElement) {
        canvas.width = size;
        canvas.height = size;
    }

    const ctx = canvas.getContext('2d')!;
    const centerX = radius;
    const centerY = radius;

    // Create radial gradient for 3D effect - offset but NO white in main gradient
    const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3, // Offset to top-left for lighting
        centerY - radius * 0.3,
        radius * 0.1,
        centerX,
        centerY,
        radius
    );

    // Main gradient: only base color and darkened edges (no white!)
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.6, baseColor);
    gradient.addColorStop(1, darkenedColor);

    // Draw the gradient bubble
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add specular highlight with ADDITIVE BLENDING to prevent darkening
    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; // Additive blending - only brightens!

    const highlightX = centerX - radius * 0.35;
    const highlightY = centerY - radius * 0.35;
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

    ctx.restore();

    return canvas;
}

// Set up custom bubble rendering with cached sprites for performance
export function setupCustomBubbleRenderer(renderer: MatterRender) {
    Matter.Events.on(renderer, 'afterRender', () => {
        const ctx = renderer.context;

        // Render all bubbles using cached sprites or fallback to gradient rendering
        state.circles.forEach(circle => {
            const pos = circle.body.position;
            const radius = circle.initialRadius;
            const baseColor = circle.body.render.fillStyle || circle.color;
            const opacity = circle.body.render.opacity !== undefined ? circle.body.render.opacity : 1;

            // Check if bubble is in viewport (with margin for partial visibility)
            const margin = radius;
            if (pos.x + margin < 0 || pos.x - margin > canvas.width ||
                pos.y + margin < 0 || pos.y - margin > canvas.height) {
                return; // Skip offscreen bubbles
            }

            // Apply opacity if it's less than 1 (for fading particles)
            if (opacity < 1) {
                ctx.save();
                ctx.globalAlpha = opacity;
            }

            // If color changed (death animation), or no sprite cached, render with gradients
            if (baseColor !== circle.color || !circle.cachedSprite) {
                // Re-render with current color for death animation
                const brightness = circle.cachedBrightness ?? getColorBrightness(baseColor);
                const darkenAmount = brightness > 200 ? 0.2 : 0.7;
                const darkenedColor = darkenColor(baseColor, darkenAmount);

                // Create radial gradient for 3D effect
                const gradient = ctx.createRadialGradient(
                    pos.x - radius * 0.3,
                    pos.y - radius * 0.3,
                    radius * 0.1,
                    pos.x,
                    pos.y,
                    radius
                );

                gradient.addColorStop(0, baseColor);
                gradient.addColorStop(0.6, baseColor);
                gradient.addColorStop(1, darkenedColor);

                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Add specular highlight
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';

                const highlightX = pos.x - radius * 0.35;
                const highlightY = pos.y - radius * 0.35;
                const highlightRadius = radius * 0.4;

                const highlightGradient = ctx.createRadialGradient(
                    highlightX, highlightY, 0,
                    highlightX, highlightY, highlightRadius
                );
                highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                highlightGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
                highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.beginPath();
                ctx.arc(highlightX, highlightY, highlightRadius, 0, Math.PI * 2);
                ctx.fillStyle = highlightGradient;
                ctx.fill();

                ctx.restore();
            } else {
                // Use cached sprite for maximum performance
                ctx.drawImage(
                    circle.cachedSprite as any,
                    pos.x - radius,
                    pos.y - radius
                );
            }

            // Restore opacity if it was modified
            if (opacity < 1) {
                ctx.restore();
            }
        });

        // Render particles with culling
        state.particles.forEach(particle => {
            const pos = particle.body.position;
            const radius = particle.initialRadius;
            const opacity = particle.body.render.opacity !== undefined ? particle.body.render.opacity : 1;

            // Cull particles outside visible area
            if (pos.x + radius < 0 || pos.x - radius > canvas.width ||
                pos.y + radius < 0 || pos.y - radius > canvas.height) {
                return; // Skip offscreen particles
            }

            const baseColor = particle.body.render.fillStyle;

            if (opacity < 1) {
                ctx.save();
                ctx.globalAlpha = opacity;
            }

            // Particles use simple rendering (they're small)
            const gradient = ctx.createRadialGradient(
                pos.x - radius * 0.3,
                pos.y - radius * 0.3,
                radius * 0.1,
                pos.x,
                pos.y,
                radius
            );

            const brightness = getColorBrightness(baseColor);
            const darkenAmount = brightness > 200 ? 0.2 : 0.7;

            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.6, baseColor);
            gradient.addColorStop(1, darkenColor(baseColor, darkenAmount));

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            if (opacity < 1) {
                ctx.restore();
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

// Draw shockwave effects with optimized rendering
export function drawShockwaves() {
    const ctx = render.context;
    const now = state.currentTime;

    state.shockwaves.forEach(shockwave => {
        const age = now - shockwave.createdAt;
        const progress = age / SHOCKWAVE_DURATION;

        if (progress >= 1) return; // Skip if animation complete

        // Cull offscreen shockwaves
        const maxRadius = shockwave.radius * SHOCKWAVE_MAX_SCALE * 1.5;
        if (shockwave.x + maxRadius < 0 || shockwave.x - maxRadius > canvas.width ||
            shockwave.y + maxRadius < 0 || shockwave.y - maxRadius > canvas.height) {
            return; // Skip offscreen shockwaves
        }

        // Calculate current radius (1.0x to SHOCKWAVE_MAX_SCALE)
        const currentScale = 1.0 + (progress * (SHOCKWAVE_MAX_SCALE - 1.0));
        const currentRadius = shockwave.radius * currentScale;

        // Calculate opacity (SHOCKWAVE_MAX_OPACITY to 0)
        const opacity = SHOCKWAVE_MAX_OPACITY * (1 - progress);

        // Calculate line width (40% of bubble radius)
        const lineWidth = shockwave.radius * SHOCKWAVE_LINE_WIDTH_RATIO;

        // Draw expanding ring with gradient for blur effect
        ctx.save();

        // Create radial gradient for soft edge (still needed for smooth visual)
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
    const timeSinceGameOver = state.currentTime - state.gameOverStartTime;
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
