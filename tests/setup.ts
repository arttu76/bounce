// Test setup file
import '@jest/globals';

// Mock canvas element
const mockCanvas = {
  getContext: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 })),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    setTransform: jest.fn()
  })),
  width: 1920,
  height: 1080,
  getBoundingClientRect: jest.fn(() => ({
    left: 0,
    top: 0,
    right: 1920,
    bottom: 1080,
    width: 1920,
    height: 1080,
    x: 0,
    y: 0,
    toJSON: () => ({})
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

// Mock document.getElementById
global.document.getElementById = jest.fn(() => mockCanvas as any);

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
Object.defineProperty(window, 'innerHeight', { writable: true, value: 1080 });

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

// Mock Date.now for consistent testing
let mockNow = 1000000000000;
const originalDateNow = Date.now;
Date.now = jest.fn(() => mockNow);

// Export helper to control mock time
(global as any).setMockTime = (time: number) => {
  mockNow = time;
};

(global as any).resetMockTime = () => {
  mockNow = 1000000000000;
};
