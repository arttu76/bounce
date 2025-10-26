"use strict";
const circles = [];
const particles = [];
let selectedCircleIndex = -1; // Index of currently selected circle
let lastInputTime = 0; // Timestamp of last input
const SELECTION_TIMEOUT = 3000; // Deselect after 3 seconds of no input
// Initialize the Cast Receiver SDK
// @ts-ignore - Types loaded from CDN
const context = cast.framework.CastReceiverContext.getInstance();
// @ts-ignore
const options = new cast.framework.CastReceiverOptions();
// Start the receiver
context.start(options);
// Get canvas
const canvas = document.getElementById('canvas');
// Matter.js is loaded globally from the script tag
// @ts-ignore - loaded as global from matter.min.js
const { Engine, Render, World, Bodies, Runner, Body } = Matter;
// Create engine
const engine = Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 }
});
let render;
let ground;
let wallLeft;
let wallRight;
let runner;
// Initialize physics world
function initPhysics(width, height) {
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
    const borderWidth = 6;
    // Physics body should include the full border (drawn outside the radius)
    const physicsRadius = visualRadius + borderWidth;
    // Random x position
    const x = physicsRadius + Math.random() * (width - physicsRadius * 2);
    // Start above the screen
    const y = -physicsRadius;
    // Random color: red, green, or blue
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    // Create circle body with random color
    const circle = Bodies.circle(x, y, physicsRadius, {
        restitution: 0.6,
        friction: 0.1,
        render: {
            fillStyle: color,
            strokeStyle: color,
            lineWidth: borderWidth
        }
    });
    World.add(engine.world, circle);
    // Track this circle
    circles.push({
        body: circle,
        createdAt: Date.now(),
        initialRadius: visualRadius,
        currentRadius: visualRadius,
        color: color
    });
}
// Handle window resize
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    initPhysics(width, height);
}
// Check if two circles are touching
function areTouching(circle1, circle2) {
    const pos1 = circle1.body.position;
    const pos2 = circle2.body.position;
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Two circles touch if distance between centers <= sum of radii
    return distance <= (circle1.currentRadius + circle2.currentRadius);
}
// Find all touching circles of the same color recursively
function findConnectedCircles(startCircle, visited) {
    if (visited.has(startCircle)) {
        return [];
    }
    visited.add(startCircle);
    const connected = [startCircle];
    // Find all circles that touch this one and have the same color
    circles.forEach(otherCircle => {
        if (otherCircle !== startCircle &&
            !visited.has(otherCircle) &&
            otherCircle.color === startCircle.color &&
            areTouching(startCircle, otherCircle)) {
            // Recursively find connected circles
            const moreConnected = findConnectedCircles(otherCircle, visited);
            connected.push(...moreConnected);
        }
    });
    return connected;
}
// Remove a circle and all touching circles of the same color
function removeConnectedCircles(clickedCircle) {
    const visited = new Set();
    const toRemove = findConnectedCircles(clickedCircle, visited);
    // Remove all connected circles
    toRemove.forEach(circleData => {
        const explosionCenter = circleData.body.position;
        // Spawn 33 particles with same color as the circle
        for (let i = 0; i < 33; i++) {
            const angle = (Math.PI * 2 * i) / 33;
            const speed = (5 + Math.random() * 10) / 3;
            const startX = explosionCenter.x + Math.cos(angle) * circleData.currentRadius;
            const startY = explosionCenter.y + Math.sin(angle) * circleData.currentRadius;
            const particleRadius = 2;
            const particle = Bodies.circle(startX, startY, particleRadius, {
                restitution: 0.3,
                friction: 0.05,
                render: {
                    fillStyle: circleData.color,
                    strokeStyle: circleData.color,
                    lineWidth: 1
                }
            });
            Body.setVelocity(particle, {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            });
            World.add(engine.world, particle);
            particles.push({
                body: particle,
                createdAt: Date.now(),
                initialRadius: particleRadius
            });
        }
        // Remove the circle from physics world
        World.remove(engine.world, circleData.body);
    });
    // Remove from circles array
    toRemove.forEach(circleData => {
        const index = circles.indexOf(circleData);
        if (index > -1) {
            circles.splice(index, 1);
            // Adjust selected index if needed
            if (selectedCircleIndex === index) {
                selectedCircleIndex = -1;
            }
            else if (selectedCircleIndex > index) {
                selectedCircleIndex--;
            }
        }
    });
}
// Select the middle circle
function selectMiddleCircle() {
    if (circles.length === 0) {
        selectedCircleIndex = -1;
        return;
    }
    // Find circle closest to center of screen
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let closestIndex = 0;
    let closestDistance = Number.MAX_VALUE;
    circles.forEach((circle, index) => {
        const dx = circle.body.position.x - centerX;
        const dy = circle.body.position.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });
    selectedCircleIndex = closestIndex;
    lastInputTime = Date.now();
}
// Navigate to nearest circle in specified direction
function navigateSelection(direction) {
    if (circles.length === 0)
        return;
    // If no circle selected, select middle one
    if (selectedCircleIndex === -1) {
        selectMiddleCircle();
        return;
    }
    const currentCircle = circles[selectedCircleIndex];
    if (!currentCircle) {
        selectMiddleCircle();
        return;
    }
    const currentPos = currentCircle.body.position;
    // Direction vector
    let dirX = 0;
    let dirY = 0;
    switch (direction) {
        case 'up':
            dirY = -1;
            break;
        case 'down':
            dirY = 1;
            break;
        case 'left':
            dirX = -1;
            break;
        case 'right':
            dirX = 1;
            break;
    }
    let bestIndex = -1;
    let bestScore = Number.MAX_VALUE;
    circles.forEach((circle, index) => {
        if (index === selectedCircleIndex)
            return;
        const pos = circle.body.position;
        const dx = pos.x - currentPos.x;
        const dy = pos.y - currentPos.y;
        // Check if circle is in the correct direction
        let isValidDirection = false;
        switch (direction) {
            case 'up':
                isValidDirection = dy < 0;
                break;
            case 'down':
                isValidDirection = dy > 0;
                break;
            case 'left':
                isValidDirection = dx < 0;
                break;
            case 'right':
                isValidDirection = dx > 0;
                break;
        }
        if (!isValidDirection)
            return;
        // Calculate distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Calculate how well aligned this circle is with the direction
        // Dot product with direction vector divided by distance
        const alignment = (dx * dirX + dy * dirY) / distance;
        // Score: prioritize alignment (inverse), then distance
        // Higher alignment (closer to 1) = better
        // Lower distance = better
        const score = distance * (2 - alignment);
        if (score < bestScore) {
            bestScore = score;
            bestIndex = index;
        }
    });
    if (bestIndex !== -1) {
        selectedCircleIndex = bestIndex;
        lastInputTime = Date.now();
    }
}
// Handle mouse/touch clicks on circles
canvas.addEventListener('click', (event) => {
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
            }
            else if (selectedCircleIndex >= 0 && selectedCircleIndex < circles.length) {
                removeConnectedCircles(circles[selectedCircleIndex]);
            }
            break;
    }
});
// Initialize
handleResize();
window.addEventListener('resize', handleResize);
// Interpolate between two colors
function lerpColor(color1, color2, t) {
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
    const toRemove = [];
    // Check for selection timeout
    if (selectedCircleIndex !== -1 && (now - lastInputTime) > SELECTION_TIMEOUT) {
        selectedCircleIndex = -1;
    }
    // Validate selected index
    if (selectedCircleIndex >= circles.length) {
        selectedCircleIndex = -1;
    }
    // No automatic animation logic anymore
    // Update particle colors, size, and remove old ones
    const particlesToRemove = [];
    particles.forEach(particle => {
        const age = now - particle.createdAt;
        const lifeProgress = age / 1000; // 1 second lifetime
        if (lifeProgress >= 1) {
            particlesToRemove.push(particle);
        }
        else {
            // Fade opacity from 1 to 0
            const opacity = 1 - lifeProgress;
            particle.body.render.opacity = opacity;
            // Shrink particle as it ages (from 1.0 to 0.1 of initial size)
            const targetScale = 1 - (lifeProgress * 0.9); // Scale from 1.0 to 0.1
            const currentRadius = particle.initialRadius * targetScale;
            const scaleFactor = currentRadius / (particle.body.circleRadius || particle.initialRadius);
            if (scaleFactor > 0.01) { // Prevent scaling to zero
                Body.scale(particle.body, scaleFactor, scaleFactor);
            }
        }
    });
    particlesToRemove.forEach(particle => {
        World.remove(engine.world, particle.body);
        const index = particles.indexOf(particle);
        if (index > -1) {
            particles.splice(index, 1);
        }
    });
    // Draw selection indicator
    if (selectedCircleIndex >= 0 && selectedCircleIndex < circles.length) {
        const selectedCircle = circles[selectedCircleIndex];
        const ctx = render.context;
        const pos = selectedCircle.body.position;
        const selectionRadius = selectedCircle.currentRadius + 15; // Offset from circle edge
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, selectionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff'; // White
        ctx.lineWidth = 5;
        ctx.stroke();
    }
    requestAnimationFrame(updateAnimations);
}
// Start animation loop
updateAnimations();
// Spawn initial 50 circles
for (let i = 0; i < 50; i++) {
    addCircle();
}
// Add circles periodically
setInterval(() => {
    addCircle();
}, 500); // Add a new circle every 500ms
