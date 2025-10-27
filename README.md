# Bounce - Color-Matching Bubble Game for Chromecast with Google TV

**🎮 Play now: https://arttu76.github.io/bounce/**

A physics-based bubble popping game featuring red, green, and blue bubbles. Built with TypeScript and Matter.js, bundled into a single-file web app and wrapped as an Android TV app for Chromecast with Google TV.

## Features

- **Physics-based Animation**: Realistic gravity and collision detection using Matter.js
- **Color-Matching Gameplay**: Pop bubbles to remove all connected same-color bubbles
- **Remote Control Support**: Navigate with D-pad, select with OK button
- **Auto-Selection**: Automatically selects nearest bubble after popping
- **Particle Effects**: 33 colored particles spawn from each explosion
- **Resolution Independent**: Automatically adapts to any screen size
- **Fullscreen Support**: Optimized for TV viewing experience
- **Bubble Counter**: Shows number of bubbles on screen in real-time

## How to Play

1. **Navigate**: Use arrow keys (or Chromecast remote D-pad) to select bubbles
2. **Pop**: Press Enter/Space (or Chromecast remote OK button) to pop selected bubble
3. **Match Colors**: All connected same-color bubbles pop together recursively
4. **Auto-Select**: After popping, the nearest bubble is automatically selected
5. **Goal**: Clear as many bubbles as possible!

## Project Structure

```
/Users/arttu/cc/
├── src/
│   ├── app.ts              # Main entry point
│   ├── physics.ts          # Physics engine setup
│   ├── bubbles.ts          # Bubble creation and management
│   ├── gameLoop.ts         # Animation loop
│   ├── input.ts            # Keyboard/remote input handling
│   ├── rendering.ts        # Canvas rendering
│   ├── selection.ts        # Bubble selection logic
│   ├── spawning.ts         # Bubble spawning
│   ├── gameOver.ts         # Game over logic
│   ├── state.ts            # Game state management
│   ├── constants.ts        # Configuration constants
│   ├── types.ts            # TypeScript type definitions
│   └── styles.css          # Styling
├── index.html              # HTML entry point
├── vite.config.ts          # Vite bundler configuration
├── dist/
│   └── index.html          # Single-file bundled output (9KB, deployed to GitHub Pages)
├── android-app/            # Android TV app wrapper
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/bounce/app/MainActivity.kt
│   │   │   └── res/
│   │   └── build.gradle.kts
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── README.md           # Android build & sideload instructions
├── package.json
└── tsconfig.json
```

## Technologies

- **TypeScript**: Type-safe JavaScript development
- **Matter.js**: 2D physics engine for realistic animations
- **Vite**: Modern bundler for optimized single-file output
- **Kotlin**: Android TV app wrapper with WebView
- **GitHub Pages**: Static hosting for web app

## Quick Start

### Web App Development

```bash
# Install dependencies
npm install

# Start development server with hot reload at http://localhost:5173
npm run dev

# Build optimized single-file HTML for production
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

### Android App Development

```bash
# Build and install APK to connected Chromecast
npm run android:deploy

# Just build APK
npm run android:build

# Just install existing APK
npm run android:install

# Check connected devices
npm run android:devices

# View WebView logs
npm run android:logcat

# Uninstall from device
npm run android:uninstall
```

## Deployment

### Web App (GitHub Pages)

The web app is hosted at: **https://arttu76.github.io/bounce/**

To deploy updates:
```bash
npm run deploy
```

This will:
1. Bundle all TypeScript/CSS into a single optimized HTML file (9KB)
2. Commit changes to git
3. Push to GitHub (auto-deploys via GitHub Actions)

### Android TV App

The Android app loads content from GitHub Pages, so:
- **Code changes**: Just run `npm run deploy` - no need to rebuild APK
- **Android wrapper changes**: Run `npm run android:deploy` to rebuild and install APK

## Android TV Setup

### Prerequisites

```bash
# Install Java 17
brew install openjdk@17

# Install Android tools
brew install --cask android-commandlinetools
brew install android-platform-tools

# Set up environment (add to ~/.zshrc or ~/.bashrc)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools

# Install SDK components
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### Enable Developer Mode on Chromecast

1. Settings > System > About
2. Click "Android TV OS build" 7 times to enable Developer options
3. Settings > System > Developer options
4. Enable "USB debugging" and "Wireless debugging"

### Connect via ADB

```bash
# Find Chromecast on network
dns-sd -B _googlecast._tcp local.

# Get IP address (e.g., 172.20.10.7)
dns-sd -G v4 <hostname>.local.

# On Chromecast: Settings > Developer options > Wireless debugging > Pair device
# Note the pairing code and port

# Pair with Chromecast (replace IP, port, and code)
adb pair 172.20.10.7:37759 123456

# Device auto-connects after pairing
adb devices
```

### Build and Install

```bash
# Build and install in one command
npm run android:deploy

# Or manually:
npm run android:build
npm run android:install
```

### Launch the App

Find "Bounce" in your Chromecast app list!

## Game Mechanics

### Bubble Spawning

- New bubbles spawn every 500ms at the top of the screen
- Random size: 2%-5% of screen width
- Random color: red, green, or blue
- Bubbles fall with realistic gravity and bounce physics

### Selection & Navigation

- **Initial Selection**: Press any arrow key to select the middle bubble
- **D-pad Navigation**: Arrows select nearest bubble in that direction
- **Smart Algorithm**: Uses dot product alignment to find best match
- **Auto-Deselect**: Selection clears after 3 seconds of inactivity
- **Visual Indicator**: White circle around selected bubble

### Popping Bubbles

1. Press OK button (Enter/Space) to pop selected bubble
2. Algorithm finds all connected same-color bubbles using flood-fill:
   - Pre-filters bubbles by color for efficiency
   - Checks if bubbles are touching (with 5px tolerance)
   - Recursively finds all connected bubbles
3. All connected bubbles explode with particle effects
4. Nearest remaining bubble is automatically selected

### Particle Effects

- 33 particles spawn from each popped bubble
- Particles inherit the bubble's color
- Spread in circular pattern with random velocities
- Apply outward force to nearby bubbles
- Fade out over 6 seconds

## Configuration

Key parameters in [src/constants.ts](src/constants.ts):

```typescript
// Game timing
export const GAME_OVER_CLICK_DELAY = 2000;  // ms before restart allowed
export const INITIAL_SPAWN_INTERVAL = 500;   // ms between bubble spawns
export const SPAWN_INTERVAL_DECREASE = 2;    // ms to decrease each spawn

// Colors
export const COLORS = ['#ff0000', '#00ff00', '#0000ff']; // red, green, blue

// Physics
export const WALL_THICKNESS = 50;            // pixels

// Danger zone
export const DANGER_ZONE_THRESHOLD = 20;     // % from top to trigger warning
```

## NPM Scripts

### Web Development
- `npm run build` - Bundle with Vite to create single-file dist/index.html
- `npm run dev` - Start Vite dev server with hot reload
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and push to GitHub Pages

### Android Development
- `npm run android:build` - Build debug APK
- `npm run android:install` - Install APK to connected device
- `npm run android:deploy` - Build and install in one command
- `npm run android:devices` - List connected ADB devices
- `npm run android:logcat` - View WebView debug logs
- `npm run android:uninstall` - Remove app from device

## Technical Implementation

### Flood-Fill Algorithm

The color-matching algorithm uses an optimized iterative flood-fill:

```typescript
function findConnectedCircles(startCircle: CircleData): CircleData[] {
    // 1. Pre-filter by color (performance optimization)
    const sameColorCircles = circles.filter(c => c.color === startCircle.color);

    // 2. Iterative flood-fill with queue
    const connected = new Set<CircleData>([startCircle]);
    const toCheck: CircleData[] = [startCircle];

    while (toCheck.length > 0) {
        const current = toCheck.pop()!;

        // 3. Find touching bubbles
        sameColorCircles.forEach(otherCircle => {
            if (!connected.has(otherCircle) && areTouching(current, otherCircle)) {
                connected.add(otherCircle);
                toCheck.push(otherCircle);
            }
        });
    }

    return Array.from(connected);
}
```

### Navigation Algorithm

Uses vector math for directional navigation:

```typescript
function navigateSelection(direction: 'up' | 'down' | 'left' | 'right') {
    // 1. Direction vector
    const dirVector = { x: 0, y: 0 };
    // (set based on direction)

    // 2. Score each bubble using alignment and distance
    const alignment = (dx * dirVector.x + dy * dirVector.y) / distance;
    const score = distance * (2 - alignment);

    // 3. Select bubble with best score
}
```

### WebView Optimization

The Android app is configured for optimal performance:

```kotlin
// No caching - always load fresh content from GitHub Pages
settings.cacheMode = WebSettings.LOAD_NO_CACHE
webView.clearCache(true)
webView.clearHistory()

// Only essential settings enabled
settings.javaScriptEnabled = true
settings.loadWithOverviewMode = true
settings.useWideViewPort = true

// Hardware acceleration for smooth animations
webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
```

## Troubleshooting

### Web App Issues

**Problem**: Changes not appearing after deployment
```
Solution: GitHub Actions may take 1-2 minutes to build and deploy
Wait a moment and hard-refresh (Cmd+Shift+R)
Check Actions tab on GitHub for build status
```

**Problem**: Build errors
```
Solution: Clean install and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

### Android App Issues

**Problem**: App shows old version
```
Solution: The Android app now forces no-cache mode
Just close and reopen the app to get the latest version
```

**Problem**: Can't pair with Chromecast
```
Solution: Make sure wireless debugging is enabled:
Settings > Developer options > Wireless debugging > Pair device
Use the pairing code and port shown on screen
```

**Problem**: Build fails with Java error
```
Solution: Ensure Java 17 is in PATH
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
java -version  # Should show Java 17
```

**Problem**: ADB device not found
```
Solution: Check device is paired and connected
npm run android:devices
If not listed, pair again using wireless debugging
```

### Gameplay Issues

**Problem**: Navigation selects wrong bubble
```
Solution: The algorithm prioritizes alignment with direction
If bubbles are far apart, it may not always pick the visually "nearest" one
This is intentional to prevent diagonal jumps
```

**Problem**: Touching bubbles don't pop together
```
Solution: Bubbles must be truly touching (within 5px)
Physics may push them slightly apart
The algorithm accounts for 5px tolerance
```

## Performance Optimization

For older/slower devices, edit these values:

**[src/constants.ts](src/constants.ts)**:
```typescript
// Slow down spawn rate
export const INITIAL_SPAWN_INTERVAL = 1000; // instead of 500
export const SPAWN_INTERVAL_DECREASE = 1;   // instead of 2
```

**[src/bubbles.ts](src/bubbles.ts)**:
```typescript
// Reduce particle count in removeConnectedCircles()
for (let i = 0; i < 20; i++) { // instead of 33
```

## Repository Structure

- **`src/`** - Modular TypeScript source code
- **`dist/`** - Single-file bundled output (deployed to GitHub Pages)
- **`android-app/`** - Android TV wrapper app
- **`index.html`** - HTML entry point for Vite
- **`vite.config.ts`** - Vite bundler configuration
- **`.claude/`** - Claude Code settings for automated permissions
- **`.github/`** - GitHub Actions workflow for automated deployment

## No Sensitive Data

This repository contains no sensitive data:
- No API keys
- No authentication tokens
- No environment files
- No private credentials
- WebView loads public GitHub Pages URL only

## License

This is a personal project. Use and modify as you wish.

## Acknowledgments

- **Matter.js** - Excellent 2D physics engine
- **Google Cast SDK** - Casting capabilities
- **Android TV** - TV app platform
- **GitHub Pages** - Free static hosting
