import Matter from 'matter-js';
import { CircleData, Particle } from './types';
import { COLORS, TOUCH_TOLERANCE, GROUND_TOLERANCE, PARTICLES_PER_BUBBLE, PARTICLE_RADIUS, DEATH_ANIMATION_DURATION, DEATH_FADE_TOTAL_DURATION, MIN_BUBBLE_SIZE_RATIO, MAX_BUBBLE_SIZE_RATIO } from './constants';
import { canvas, engine } from './physics';
import { state } from './state';
import { selectNearestCircleToPosition } from './selection';

const { World, Bodies, Body } = Matter;

// Add a new falling circle
export function addCircle() {
    const width = canvas.width;

    // Random size between MIN_BUBBLE_SIZE_RATIO and MAX_BUBBLE_SIZE_RATIO of screen width
    const radius = width * (MIN_BUBBLE_SIZE_RATIO + Math.random() * (MAX_BUBBLE_SIZE_RATIO - MIN_BUBBLE_SIZE_RATIO));

    // Random x position
    const x = radius + Math.random() * (width - radius * 2);

    // Start above the screen
    const y = -radius;

    // Sequential color: red, green, blue, red, green, blue...
    const color = COLORS[state.nextColorIndex];
    state.nextColorIndex = (state.nextColorIndex + 1) % COLORS.length;

    // Create circle body with random color (no border)
    // visible: false hides the default Matter.js rendering, our custom renderer will draw it
    const circle = Bodies.circle(x, y, radius, {
        restitution: 0.6,
        friction: 0.1,
        render: {
            fillStyle: color,
            visible: false
        }
    });

    World.add(engine.world, circle);

    // Track this circle
    state.circles.push({
        body: circle,
        createdAt: Date.now(),
        initialRadius: radius,
        color: color
    });
}

// Check if two circles are touching
export function areTouching(circle1: CircleData, circle2: CircleData): boolean {
    const pos1 = circle1.body.position;
    const pos2 = circle2.body.position;
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Two circles touch if distance between centers <= sum of radii (with small tolerance)
    return distance <= (circle1.initialRadius + circle2.initialRadius + TOUCH_TOLERANCE);
}

// Find all touching circles using iterative flood-fill
// @param startCircle - The starting circle to search from
// @param colorFilter - Color filter: string = specific color, null = all colors, undefined = startCircle's color
export function findConnectedCircles(startCircle: CircleData, colorFilter?: string | null): CircleData[] {
    // Determine which circles to check based on color filter
    let circlesToCheck: CircleData[];

    if (colorFilter === null) {
        // null = check all colors
        circlesToCheck = state.circles;
    } else if (colorFilter === undefined) {
        // undefined = use startCircle's color (default behavior)
        circlesToCheck = state.circles.filter(c => c.color === startCircle.color);
    } else {
        // string = use specific color
        circlesToCheck = state.circles.filter(c => c.color === colorFilter);
    }

    const connected = new Set<CircleData>([startCircle]);
    const toCheck: CircleData[] = [startCircle];

    // Iteratively find all touching bubbles
    while (toCheck.length > 0) {
        const current = toCheck.pop()!;

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
export function findAllConnectedCircles(startCircle: CircleData): CircleData[] {
    return findConnectedCircles(startCircle, null);
}

// Calculate the highest connected bubble from the lowest bubble
// Returns percentage: 0 = top of screen, 100 = bottom, negative = above top, null = no chain
export function calculateHighestConnectedBubble(): number | null {
    if (state.circles.length === 0) return null;

    // Find the lowest bubble (highest Y value since Y increases downward)
    let lowestBubble: CircleData | null = null;
    let maxY = -Infinity;

    state.circles.forEach(circle => {
        if (circle.body.position.y > maxY) {
            maxY = circle.body.position.y;
            lowestBubble = circle;
        }
    });

    // Type guard: lowestBubble is definitely not null here
    if (!lowestBubble) return null;
    const bubble: CircleData = lowestBubble;

    // Only check for game over if the lowest bubble is actually touching or very close to the ground
    // A bubble touches the ground when: position.y + radius >= canvas.height
    // Use a small tolerance to account for bubbles slightly above ground
    const bubbleBottomEdge = bubble.body.position.y + bubble.initialRadius;
    const isGrounded = bubbleBottomEdge >= canvas.height - GROUND_TOLERANCE;

    if (!isGrounded) {
        // Lowest bubble is not on the ground - ignore floating bubbles
        return null;
    }

    // Find all connected circles (regardless of color)
    const connected = findAllConnectedCircles(bubble);

    if (connected.length === 0) return null;

    // Find the highest bubble in the chain (lowest Y value)
    let minY = Infinity;
    connected.forEach(circle => {
        if (circle.body.position.y < minY) {
            minY = circle.body.position.y;
        }
    });

    // Calculate the maximum possible bubble radius (slack for game over)
    const maxBubbleRadius = canvas.width * MAX_BUBBLE_SIZE_RATIO;

    // Calculate percentage with slack
    // 0 = danger zone threshold (y = -maxBubbleRadius, one max bubble above screen)
    // 100 = bottom of screen (y = canvas.height)
    // negative = above the slack threshold (game over condition)
    const adjustedY = minY + maxBubbleRadius; // Shift coordinate system by maxBubbleRadius
    const percentage = (adjustedY / canvas.height) * 100;

    return percentage;
}

// Setup the cascading death animation starting from the highest bubble
export function setupDeathAnimation(): void {
    if (state.circles.length === 0) return;

    // Find the lowest grounded bubble (same logic as calculateHighestConnectedBubble)
    let lowestBubble: CircleData | null = null;
    let maxY = -Infinity;

    state.circles.forEach(circle => {
        if (circle.body.position.y > maxY) {
            maxY = circle.body.position.y;
            lowestBubble = circle;
        }
    });

    if (!lowestBubble) return;

    // Type assertion to help TypeScript understand lowestBubble is not null
    const bubble: CircleData = lowestBubble;

    // Check if it's actually grounded
    const bubbleBottomEdge = bubble.body.position.y + bubble.initialRadius;
    const isGrounded = bubbleBottomEdge >= canvas.height - GROUND_TOLERANCE;

    if (!isGrounded) return;

    // Get all connected bubbles
    const connectedBubbles = findAllConnectedCircles(bubble);
    if (connectedBubbles.length === 0) return;

    // Find the highest bubble (minimum Y) - this is our starting point
    let highestBubble: CircleData | null = null;
    let minY = Infinity;

    connectedBubbles.forEach(circle => {
        if (circle.body.position.y < minY) {
            minY = circle.body.position.y;
            highestBubble = circle;
        }
    });

    if (!highestBubble) return;

    // Type assertion to help TypeScript
    const startBubble: CircleData = highestBubble;

    // Calculate distance from highest bubble to each connected bubble
    const highestPos = startBubble.body.position;
    let maxDistance = 0;

    const distanceMap = new Map<CircleData, number>();

    connectedBubbles.forEach(bubble => {
        const pos = bubble.body.position;
        const dx = pos.x - highestPos.x;
        const dy = pos.y - highestPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        distanceMap.set(bubble, distance);
        maxDistance = Math.max(maxDistance, distance);
    });

    // Calculate timing based on distance
    const currentTime = Date.now();
    const availableTime = DEATH_ANIMATION_DURATION - DEATH_FADE_TOTAL_DURATION;

    // Assign death start times to all bubbles based on their distance
    connectedBubbles.forEach(bubble => {
        const distance = distanceMap.get(bubble) ?? 0;

        // Normalize distance to 0-1 range and map to delay time
        const normalizedDistance = maxDistance > 0 ? distance / maxDistance : 0;
        const delay = normalizedDistance * availableTime;

        bubble.deathStartTime = currentTime + delay;
        bubble.deathWave = undefined; // No longer needed
        bubble.deathAnimated = false;
    });
}

// Remove a circle and all touching circles of the same color
export function removeConnectedCircles(clickedCircle: CircleData) {
    // Store position of clicked circle for selecting nearest after removal
    const clickedPosition = {
        x: clickedCircle.body.position.x,
        y: clickedCircle.body.position.y
    };

    const toRemove = findConnectedCircles(clickedCircle);

    // Update max chain for current round
    if (toRemove.length > state.maxChain) {
        state.maxChain = toRemove.length;
    }

    // Remove all connected circles
    toRemove.forEach(circleData => {
        const explosionCenter = circleData.body.position;

        // Create shockwave effect
        state.shockwaves.push({
            x: explosionCenter.x,
            y: explosionCenter.y,
            radius: circleData.initialRadius,
            createdAt: Date.now()
        });

        // Spawn particles with same color as the circle
        for (let i = 0; i < PARTICLES_PER_BUBBLE; i++) {
            const angle = (Math.PI * 2 * i) / PARTICLES_PER_BUBBLE;
            const speed = (5 + Math.random() * 10) / 3;

            const startX = explosionCenter.x + Math.cos(angle) * circleData.initialRadius;
            const startY = explosionCenter.y + Math.sin(angle) * circleData.initialRadius;

            const particle = Bodies.circle(startX, startY, PARTICLE_RADIUS, {
                restitution: 0.3,
                friction: 0.05,
                render: {
                    fillStyle: circleData.color,
                    visible: false
                }
            });

            Body.setVelocity(particle, {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            });

            World.add(engine.world, particle);
            state.particles.push({
                body: particle,
                createdAt: Date.now(),
                initialRadius: PARTICLE_RADIUS
            });
        }

        // Remove the circle from physics world
        World.remove(engine.world, circleData.body);
    });

    // Remove from circles array using Set for O(n) performance
    const toRemoveSet = new Set(toRemove);
    state.circles = state.circles.filter(circle => !toRemoveSet.has(circle));

    // Auto-select nearest bubble to where the popped bubble was
    selectNearestCircleToPosition(clickedPosition.x, clickedPosition.y);
}
