# Bounce - Color-Matching Bubble Game for Chromecast with Google TV

A physics-based bubble popping game featuring red, green, and blue bubbles. Built with TypeScript and Matter.js, deployable as both a web app and an Android TV app for Chromecast with Google TV.

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
│   ├── app.ts              # Main game logic with physics engine
│   ├── sender.ts           # Web-based sender for casting
│   ├── index.html          # Receiver HTML page
│   ├── sender.html         # Sender HTML page
│   └── styles.css          # Styling
├── dist/                   # Compiled JavaScript output (deployed to GitHub Pages)
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
├── tsconfig.receiver.json
└── tsconfig.sender.json
```

## Technologies

- **TypeScript**: Type-safe JavaScript development
- **Matter.js**: 2D physics engine for realistic animations
- **Google Cast SDK**: For casting functionality (web version)
- **Kotlin**: Android TV app wrapper with WebView
- **GitHub Pages**: Static hosting for web app

## Quick Start

### Web App Development

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Serve locally at http://localhost:22222
npm run serve

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
1. Build TypeScript to JavaScript
2. Commit changes to git
3. Push to GitHub (auto-deploys via GitHub Pages)

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

Key parameters in [src/app.ts](src/app.ts):

```typescript
// Bubble spawning
const SPAWN_INTERVAL = 500;     // milliseconds between spawns
const radius = width * (0.02 + Math.random() * 0.03); // 2%-5% of width

// Colors
const colors = ['#ff0000', '#00ff00', '#0000ff']; // red, green, blue

// Selection
const SELECTION_TIMEOUT = 3000; // ms before auto-deselect

// Explosion
const PARTICLE_COUNT = 33;      // particles per bubble
const PARTICLE_LIFETIME = 6000; // ms before particles disappear

// Touch detection
const TOUCH_TOLERANCE = 5;      // pixels
```

## NPM Scripts

### Web Development
- `npm run build` - Compile TypeScript and copy assets to dist/
- `npm run watch` - Watch mode for TypeScript compilation
- `npm run serve` - Serve dist/ locally on port 22222
- `npm run dev` - Build and serve in one command
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
Solution: GitHub Pages may take 1-2 minutes to update
Wait a moment and hard-refresh (Cmd+Shift+R)
```

**Problem**: TypeScript compilation errors
```
Solution: Clean and rebuild
rm -rf dist/
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

For older/slower devices, edit these values in [src/app.ts](src/app.ts):

```typescript
// Reduce particle count
const PARTICLE_COUNT = 20; // instead of 33

// Slow down spawn rate
const SPAWN_INTERVAL = 1000; // instead of 500

// Reduce maximum bubbles
if (circles.length > 50) {
    // Remove oldest bubble
}
```

## Repository Structure

- **`src/`** - TypeScript source code
- **`dist/`** - Compiled JavaScript (deployed to GitHub Pages)
- **`android-app/`** - Android TV wrapper app
- **`.claude/`** - Claude Code settings for automated permissions
- **`.github/`** - GitHub Pages workflow configuration

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
