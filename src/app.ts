// Type imports at the top
type MatterRender = import('matter-js').Render;
type MatterBody = import('matter-js').Body;
type MatterRunner = import('matter-js').Runner;

// Track circles with metadata
interface CircleData {
    body: MatterBody;
    createdAt: number;
    initialRadius: number;
    currentRadius: number;
    animationStartTime?: number;
}

interface Particle {
    body: MatterBody;
    createdAt: number;
}

const circles: CircleData[] = [];
const particles: Particle[] = [];

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
const { Engine, Render, World, Bodies, Runner, Body } = Matter;

// Create engine
const engine = Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 }
});

let render: MatterRender;
let ground: MatterBody;
let wallLeft: MatterBody;
let wallRight: MatterBody;
let runner: MatterRunner;

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
    const visualRadius = width * (0.02 + Math.random() * 0.03);
    const borderWidth = 2;

    // Physics body should include the border
    const physicsRadius = visualRadius + borderWidth / 2;

    // Random x position
    const x = physicsRadius + Math.random() * (width - physicsRadius * 2);

    // Start above the screen
    const y = -physicsRadius;

    // Create circle body with white fill and white outline
    const circle = Bodies.circle(x, y, physicsRadius, {
        restitution: 0.6,
        friction: 0.1,
        render: {
            fillStyle: '#ffffff',
            strokeStyle: '#ffffff',
            lineWidth: borderWidth
        }
    });

    World.add(engine.world, circle);

    // Track this circle (store visual radius for consistent sizing)
    circles.push({
        body: circle,
        createdAt: Date.now(),
        initialRadius: visualRadius,
        currentRadius: visualRadius
    });
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

// Interpolate between two colors
function lerpColor(color1: string, color2: string, t: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Update animations
function updateAnimations() {
    const now = Date.now();
    const toRemove: CircleData[] = [];

    circles.forEach(circleData => {
        if (circleData.animationStartTime) {
            const elapsed = now - circleData.animationStartTime;
            const progress = Math.min(elapsed / 6000, 1); // 6 seconds

            if (progress >= 1) {
                // Animation complete, mark for removal
                toRemove.push(circleData);
            } else {
                // Update circle size (grow to 125% of initial size)
                const newRadius = circleData.initialRadius * (1 + progress * 0.25);
                const scaleFactor = newRadius / circleData.currentRadius;
                Body.scale(circleData.body, scaleFactor, scaleFactor);
                circleData.currentRadius = newRadius;

                // Update colors
                const fillColor = lerpColor('#ffffff', '#000000', progress);
                const strokeColor = lerpColor('#ffffff', '#00ff00', progress);

                circleData.body.render.fillStyle = fillColor;
                circleData.body.render.strokeStyle = strokeColor;
            }
        }
    });

    // Remove completed animations with explosion effect
    toRemove.forEach(circleData => {
        const explosionCenter = circleData.body.position;
        const explosionRadius = circleData.currentRadius * 10; // Affect circles within 10x radius
        const explosionForce = 12.0; // Base force strength (2x original)

        // Spawn 100 green particles
        for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 * i) / 100; // Evenly distributed around circle
            const speed = 3 + Math.random() * 5; // Random speed between 3-8

            // Start particles at the circle's edge
            const startX = explosionCenter.x + Math.cos(angle) * circleData.currentRadius;
            const startY = explosionCenter.y + Math.sin(angle) * circleData.currentRadius;

            const particle = Bodies.circle(startX, startY, 2, {
                restitution: 0.6,
                friction: 0.01,
                render: {
                    fillStyle: '#00ff00',
                    strokeStyle: '#00ff00',
                    lineWidth: 0
                }
            });

            // Set initial velocity outward
            Body.setVelocity(particle, {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            });

            World.add(engine.world, particle);
            particles.push({
                body: particle,
                createdAt: Date.now()
            });
        }

        // Apply outward velocity to nearby circles
        circles.forEach(otherCircle => {
            if (otherCircle !== circleData && !otherCircle.animationStartTime) {
                const dx = otherCircle.body.position.x - explosionCenter.x;
                const dy = otherCircle.body.position.y - explosionCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < explosionRadius && distance > 0) {
                    // Force falls off with distance
                    const forceMagnitude = explosionForce * (1 - distance / explosionRadius);

                    // Normalize direction and apply force
                    const forceX = (dx / distance) * forceMagnitude;
                    const forceY = (dy / distance) * forceMagnitude;

                    Body.setVelocity(otherCircle.body, {
                        x: otherCircle.body.velocity.x + forceX,
                        y: otherCircle.body.velocity.y + forceY
                    });
                }
            }
        });

        World.remove(engine.world, circleData.body);
        const index = circles.indexOf(circleData);
        if (index > -1) {
            circles.splice(index, 1);
        }
    });

    // Update particle colors and remove old ones
    const particlesToRemove: Particle[] = [];
    particles.forEach(particle => {
        const age = now - particle.createdAt;
        const lifeProgress = age / 5000; // 5 second lifetime

        if (lifeProgress >= 1) {
            particlesToRemove.push(particle);
        } else {
            // Fade from green to black
            const color = lerpColor('#00ff00', '#000000', lifeProgress);
            particle.body.render.fillStyle = color;
            particle.body.render.strokeStyle = color;
        }
    });

    particlesToRemove.forEach(particle => {
        World.remove(engine.world, particle.body);
        const index = particles.indexOf(particle);
        if (index > -1) {
            particles.splice(index, 1);
        }
    });

    requestAnimationFrame(updateAnimations);
}

// Start animation loop
updateAnimations();

// Every 6 seconds, select 8-16 oldest circles to animate
setInterval(() => {
    // Find circles not already animating
    const nonAnimating = circles.filter(c => !c.animationStartTime);

    if (nonAnimating.length > 0) {
        // Sort by creation time (oldest first)
        nonAnimating.sort((a, b) => a.createdAt - b.createdAt);

        // Select random number between 8 and 16 (or all if less than 8)
        const count = Math.min(
            Math.floor(8 + Math.random() * 9), // 8-16
            nonAnimating.length
        );

        // Start animation for selected circles
        for (let i = 0; i < count; i++) {
            nonAnimating[i].animationStartTime = Date.now();
        }
    }
}, 6000);

// Spawn initial 50 circles
for (let i = 0; i < 50; i++) {
    addCircle();
}

// Add circles periodically
setInterval(() => {
    addCircle();
}, 500); // Add a new circle every 500ms
