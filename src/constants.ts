// Game constants
export const GAME_OVER_CLICK_DELAY = 2000; // Wait 2 seconds before accepting clicks to restart
export const INITIAL_SPAWN_INTERVAL = 500; // Starting spawn interval
export const SPAWN_INTERVAL_DECREASE = 2; // Decrease by 2ms each spawn
export const MIN_SPAWN_INTERVAL = 50; // Minimum spawn interval (ms)
export const COLORS = ['#ff0000', '#00ff00', '#0000ff']; // red, green, blue
export const WALL_THICKNESS = 50;
export const DANGER_ZONE_THRESHOLD = 20; // Percentage threshold for danger zone

// Physics and collision constants
export const TOUCH_TOLERANCE = 5; // Pixels of tolerance for circle touching detection
export const GROUND_TOLERANCE = 10; // Pixels of tolerance for ground collision detection

// Particle constants
export const PARTICLES_PER_BUBBLE = 33; // Number of particles spawned when a bubble pops
export const PARTICLE_RADIUS = 2; // Radius of explosion particles in pixels

// UI constants
export const MAX_CHAIN_UI_OFFSET = 200; // Pixels from right edge for MAX CHAIN display
export const SELECTION_RING_OFFSET = 15; // Pixels offset from bubble edge for selection indicator
