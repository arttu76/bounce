import Matter from 'matter-js';
import { MatterRender, MatterBody, MatterRunner } from './types';
import { WALL_THICKNESS } from './constants';

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

    // Run the renderer
    Render.run(render);

    // Start runner if not already running
    if (!runner) {
        runner = Runner.create();
        Runner.run(runner, engine);
    }
}

// Handle window resize
export function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    initPhysics(width, height);
}
