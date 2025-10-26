// Initialize the Cast Receiver SDK
// @ts-ignore - Types loaded from CDN
const context = cast.framework.CastReceiverContext.getInstance();
// @ts-ignore
const options = new cast.framework.CastReceiverOptions();

// Start the receiver
context.start(options);

// Get canvas
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Matter.js is loaded globally from the script tag
// @ts-ignore - loaded as global from matter.min.js
const { Engine, Render, World, Bodies, Runner } = Matter;

// Create engine
const engine = Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 }
});

let render: import('matter-js').Render;
let ground: import('matter-js').Body;
let wallLeft: import('matter-js').Body;
let wallRight: import('matter-js').Body;
let runner: import('matter-js').Runner;

// Initialize physics world
function initPhysics(width: number, height: number) {
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
            background: '#000000'
        }
    });

    // Create ground and walls
    const wallThickness = 50;
    ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, {
        isStatic: true,
        render: { fillStyle: '#000000' }
    });

    wallLeft = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, {
        isStatic: true,
        render: { fillStyle: '#000000' }
    });

    wallRight = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, {
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

// Add a new falling circle
function addCircle() {
    const width = canvas.width;

    // Random size between 2% and 5% of screen width
    const radius = width * (0.02 + Math.random() * 0.03);

    // Random x position
    const x = radius + Math.random() * (width - radius * 2);

    // Start above the screen
    const y = -radius;

    // Create circle body
    const circle = Bodies.circle(x, y, radius, {
        restitution: 0.6,
        friction: 0.1,
        render: {
            fillStyle: '#ffffff'
        }
    });

    World.add(engine.world, circle);
}

// Handle window resize
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    initPhysics(width, height);
}

// Initialize
handleResize();
window.addEventListener('resize', handleResize);

// Add circles periodically
setInterval(() => {
    addCircle();
}, 1000); // Add a new circle every second
