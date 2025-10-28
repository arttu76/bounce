// Type imports
export type MatterRender = import('matter-js').Render;
export type MatterBody = import('matter-js').Body;
export type MatterRunner = import('matter-js').Runner;

// Input method enum
export enum InputMethod {
    MOUSE = 'mouse',
    KEYBOARD = 'keyboard'
}

// Track circles with metadata
export interface CircleData {
    body: MatterBody;
    createdAt: number;
    initialRadius: number;
    color: string; // '#ff0000', '#00ff00', or '#0000ff'
    deathAnimated?: boolean; // tracks if bubble has started the death animation
    deathStartTime?: number; // when the bubble's death animation should start
    deathWave?: number; // BFS distance from highest bubble (for debugging)
}

export interface Particle {
    body: MatterBody;
    createdAt: number;
    initialRadius: number;
}

export interface Shockwave {
    x: number;
    y: number;
    radius: number; // Initial radius of the bubble
    createdAt: number;
}
