// Type imports
export type MatterRender = import('matter-js').Render;
export type MatterBody = import('matter-js').Body;
export type MatterRunner = import('matter-js').Runner;

// Track circles with metadata
export interface CircleData {
    body: MatterBody;
    createdAt: number;
    initialRadius: number;
    color: string; // '#ff0000', '#00ff00', or '#0000ff'
}

export interface Particle {
    body: MatterBody;
    createdAt: number;
    initialRadius: number;
}
