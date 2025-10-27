import { COLORS } from './constants';
import { canvas, engine } from './physics';
import { circles, particles, nextColorIndex, setNextColorIndex, maxChain, setMaxChain } from './state';
import { selectNearestCircleToPosition } from './selection';
// @ts-ignore - loaded as global from matter.min.js
const { World, Bodies, Body } = Matter;
// Add a new falling circle
export function addCircle() {
    const width = canvas.width;
    // Random size between 2% and 5% of screen width
    const radius = width * (0.02 + Math.random() * 0.03);
    // Random x position
    const x = radius + Math.random() * (width - radius * 2);
    // Start above the screen
    const y = -radius;
    // Sequential color: red, green, blue, red, green, blue...
    const color = COLORS[nextColorIndex];
    setNextColorIndex((nextColorIndex + 1) % COLORS.length);
    // Create circle body with random color (no border)
    const circle = Bodies.circle(x, y, radius, {
        restitution: 0.6,
        friction: 0.1,
        render: {
            fillStyle: color
        }
    });
    World.add(engine.world, circle);
    // Track this circle
    circles.push({
        body: circle,
        createdAt: Date.now(),
        initialRadius: radius,
        currentRadius: radius,
        color: color
    });
}
// Check if two circles are touching
export function areTouching(circle1, circle2) {
    const pos1 = circle1.body.position;
    const pos2 = circle2.body.position;
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Two circles touch if distance between centers <= sum of radii (with small tolerance)
    return distance <= (circle1.currentRadius + circle2.currentRadius + 5); // Add 5px tolerance
}
// Find all touching circles using iterative flood-fill
// @param startCircle - The starting circle to search from
// @param colorFilter - Color filter: string = specific color, null = all colors, undefined = startCircle's color
export function findConnectedCircles(startCircle, colorFilter) {
    // Determine which circles to check based on color filter
    let circlesToCheck;
    if (colorFilter === null) {
        // null = check all colors
        circlesToCheck = circles;
    }
    else if (colorFilter === undefined) {
        // undefined = use startCircle's color (default behavior)
        circlesToCheck = circles.filter(c => c.color === startCircle.color);
    }
    else {
        // string = use specific color
        circlesToCheck = circles.filter(c => c.color === colorFilter);
    }
    const connected = new Set([startCircle]);
    const toCheck = [startCircle];
    // Iteratively find all touching bubbles
    while (toCheck.length > 0) {
        const current = toCheck.pop();
        // Find touching bubbles from the filtered pool
        circlesToCheck.forEach(otherCircle => {
            if (!connected.has(otherCircle) && areTouching(current, otherCircle)) {
                connected.add(otherCircle);
                toCheck.push(otherCircle);
            }
        });
    }
    return Array.from(connected);
}
// Helper: Find all physically connected circles regardless of color
export function findAllConnectedCircles(startCircle) {
    return findConnectedCircles(startCircle, null);
}
// Calculate the highest connected bubble from the lowest bubble
// Returns percentage: 0 = top of screen, 100 = bottom, negative = above top, null = no chain
export function calculateHighestConnectedBubble() {
    if (circles.length === 0)
        return null;
    // Find the lowest bubble (highest Y value since Y increases downward)
    let lowestBubble = null;
    let maxY = -Infinity;
    circles.forEach(circle => {
        if (circle.body.position.y > maxY) {
            maxY = circle.body.position.y;
            lowestBubble = circle;
        }
    });
    if (!lowestBubble)
        return null;
    // Find all connected circles (regardless of color)
    const connected = findAllConnectedCircles(lowestBubble);
    if (connected.length === 0)
        return null;
    // Find the highest bubble in the chain (lowest Y value)
    let minY = Infinity;
    connected.forEach(circle => {
        if (circle.body.position.y < minY) {
            minY = circle.body.position.y;
        }
    });
    // Calculate percentage
    // 0 = top of screen (y = 0)
    // 100 = bottom of screen (y = canvas.height)
    // negative = above top of screen (y < 0)
    const percentage = (minY / canvas.height) * 100;
    return percentage;
}
// Remove a circle and all touching circles of the same color
export function removeConnectedCircles(clickedCircle) {
    // Store position of clicked circle for selecting nearest after removal
    const clickedPosition = {
        x: clickedCircle.body.position.x,
        y: clickedCircle.body.position.y
    };
    const toRemove = findConnectedCircles(clickedCircle);
    // Update max chain for current round
    if (toRemove.length > maxChain) {
        setMaxChain(toRemove.length);
    }
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
                    fillStyle: circleData.color
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
        }
    });
    // Auto-select nearest bubble to where the popped bubble was
    selectNearestCircleToPosition(clickedPosition.x, clickedPosition.y);
}
