import { canvas } from './physics';
import { circles, selectedCircleIndex, setSelectedCircleIndex } from './state';

// Find and select nearest circle to a given position
export function selectNearestCircleToPosition(x: number, y: number) {
    if (circles.length === 0) {
        setSelectedCircleIndex(-1);
        return;
    }

    let closestIndex = 0;
    let closestDistance = Number.MAX_VALUE;

    circles.forEach((circle, index) => {
        const dx = circle.body.position.x - x;
        const dy = circle.body.position.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    setSelectedCircleIndex(closestIndex);
}

// Select the middle circle
export function selectMiddleCircle() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    selectNearestCircleToPosition(centerX, centerY);
}

// Navigate to nearest circle in specified direction
export function navigateSelection(direction: 'up' | 'down' | 'left' | 'right') {
    if (circles.length === 0) return;

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
        if (index === selectedCircleIndex) return;

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

        if (!isValidDirection) return;

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
        setSelectedCircleIndex(bestIndex);
    }
}
