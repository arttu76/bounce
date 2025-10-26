// Declare Matter.js as a global variable loaded from script tag
import * as MatterJS from 'matter-js';

declare global {
    const Matter: typeof MatterJS;
}

export {};
