// Game constants
export const GAME_OVER_CLICK_DELAY = 2000; // Wait 2 seconds before accepting clicks to restart
export const INITIAL_SPAWN_INTERVAL = 500; // Starting spawn interval
export const SPAWN_INTERVAL_DECREASE = 2; // Decrease by 2ms each spawn
export const MIN_SPAWN_INTERVAL = 50; // Minimum spawn interval (ms)
export const COLORS = ['#ff0000', '#00ff00', '#0000ff']; // red, green, blue
export const WALL_THICKNESS = 50;
export const DANGER_ZONE_THRESHOLD = 20; // Percentage threshold for danger zone

// Bubble size constants
export const MIN_BUBBLE_SIZE_RATIO = 0.02; // Minimum bubble radius as ratio of screen width (2%)
export const MAX_BUBBLE_SIZE_RATIO = 0.05; // Maximum bubble radius as ratio of screen width (5%)

// Physics and collision constants
export const TOUCH_TOLERANCE = 5; // Pixels of tolerance for circle touching detection
export const GROUND_TOLERANCE = 10; // Pixels of tolerance for ground collision detection

// Particle constants
export const PARTICLES_PER_BUBBLE = 33; // Number of particles spawned when a bubble pops
export const PARTICLE_RADIUS = 2; // Radius of explosion particles in pixels

// UI constants
export const MAX_CHAIN_UI_OFFSET = 200; // Pixels from right edge for MAX CHAIN display
export const SELECTION_RING_OFFSET = 15; // Pixels offset from bubble edge for selection indicator

// Death animation constants
export const DEATH_ANIMATION_DURATION = 2000; // Total duration of cascading death animation (ms)
export const DEATH_FADE_TO_WHITE_DURATION = 100; // Duration for each bubble's original -> white fade (ms) - quick and dramatic
export const DEATH_FADE_FROM_WHITE_DURATION = 400; // Duration for each bubble's white -> original color fade (ms)
export const DEATH_FADE_TOTAL_DURATION = DEATH_FADE_TO_WHITE_DURATION + DEATH_FADE_FROM_WHITE_DURATION; // Total per-bubble animation time

// Shockwave effect constants
export const SHOCKWAVE_DURATION = 300; // Duration of shockwave expansion animation (ms) - twice as fast
export const SHOCKWAVE_MAX_SCALE = 1.5; // Maximum scale (1.5 = 150% of original radius)
export const SHOCKWAVE_MAX_OPACITY = 0.1; // Starting opacity (10% white)
export const SHOCKWAVE_LINE_WIDTH_RATIO = 0.4; // Line width as ratio of bubble radius (40%) - twice as thick
export const SHOCKWAVE_BLUR = 10; // Blur amount in pixels
