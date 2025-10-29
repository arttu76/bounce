import Matter from 'matter-js';
import { MatterRender, MatterBody, MatterRunner } from './types';
import { WALL_THICKNESS } from './constants';
import { setupCustomBubbleRenderer } from './rendering';

// Get canvas
export const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Import Matter.js components
const { Engine, Render, World, Bodies, Runner } = Matter;

// Create engine
export const engine = Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 }
});

export let render: MatterRender;
export let ground: MatterBody;
export let wallLeft: MatterBody;
export let wallRight: MatterBody;
export let runner: MatterRunner;

// Initialize physics world
export function initPhysics(width: number, height: number) {
    // Clear existing world
    World.clear(engine.world, false);

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Create renderer
    if (render) {
        Render.stop(render);
        render.canvas.remove();
    }

    render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false,
            background: 'transparent'
        }
    });

    // Create ground and walls
    ground = Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2, width, WALL_THICKNESS, {
        isStatic: true,
        render: { fillStyle: '#000000' }
    });

    wallLeft = Bodies.rectangle(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height * 2, {
        isStatic: true,
        render: { fillStyle: '#000000' }
    });

    wallRight = Bodies.rectangle(width + WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height * 2, {
        isStatic: true,
        render: { fillStyle: '#000000' }
    });

    World.add(engine.world, [ground, wallLeft, wallRight]);

    // Setup custom bubble rendering with gradients and highlights
    setupCustomBubbleRenderer(render);

    // Run the renderer
    Render.run(render);

    // Start runner with fixed timestep if not already running
    if (!runner) {
        runner = Runner.create({
            // Fixed timestep: 60 FPS physics regardless of display refresh rate
            // This ensures consistent physics simulation speed across all machines
            delta: 1000 / 60, // 16.67ms per physics update (60 FPS)
            isFixed: true
        });
        Runner.run(runner, engine);
    }
}

// Get actual viewport dimensions accounting for mobile browser UI
export function getViewportDimensions() {
    let width = 0;
    let height = 0;

    // First check if canvas already has a display size (after layout)
    // This ensures canvas internal resolution matches its actual display size
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
        width = Math.round(rect.width);
        height = Math.round(rect.height);
    }
    // Fallback to viewport API for initial sizing before layout
    // Use visualViewport API on mobile for accurate dimensions
    else if (typeof window !== 'undefined' && window.visualViewport) {
        width = window.visualViewport.width;
        height = window.visualViewport.height;
    }
    // Fallback for desktop/Chromecast
    else {
        width = window.innerWidth;
        height = window.innerHeight;
    }

    // Log for debugging (helps diagnose blank screen issues)
    console.log('Viewport dimensions:', width, 'x', height);

    return { width, height };
}

// Handle window resize
export function handleResize() {
    const { width, height } = getViewportDimensions();
    initPhysics(width, height);
}
