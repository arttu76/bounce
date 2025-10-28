// Mock Matter.js for testing

const mockBody = {
  position: { x: 100, y: 100 },
  velocity: { x: 0, y: 0 },
  angle: 0,
  circleRadius: 50,
  render: {
    fillStyle: '#ff0000',
    opacity: 1
  }
};

const mockEngine = {
  world: {
    bodies: []
  },
  gravity: { x: 0, y: 1, scale: 0.001 }
};

const mockRender = {
  canvas: {
    remove: jest.fn()
  },
  context: {
    fillStyle: '#000000',
    strokeStyle: '#ffffff',
    lineWidth: 1,
    font: '16px Arial',
    textAlign: 'left',
    textBaseline: 'top',
    globalAlpha: 1,
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
  },
  options: {
    width: 1920,
    height: 1080
  }
};

const Matter = {
  Engine: {
    create: jest.fn(() => mockEngine),
    update: jest.fn()
  },
  Render: {
    create: jest.fn(() => mockRender),
    run: jest.fn(),
    stop: jest.fn()
  },
  World: {
    add: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn()
  },
  Bodies: {
    circle: jest.fn((x, y, radius, options) => ({
      ...mockBody,
      position: { x, y },
      circleRadius: radius,
      render: { ...mockBody.render, ...options?.render }
    })),
    rectangle: jest.fn((x, y, width, height, options) => ({
      ...mockBody,
      position: { x, y },
      width,
      height,
      isStatic: options?.isStatic || false,
      render: { ...mockBody.render, ...options?.render }
    }))
  },
  Body: {
    setVelocity: jest.fn((body, velocity) => {
      body.velocity = velocity;
    }),
    scale: jest.fn()
  },
  Runner: {
    create: jest.fn(() => ({})),
    run: jest.fn()
  }
};

export default Matter;
