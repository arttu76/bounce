# Bounce - Physics Animation for Chromecast with Google TV

A physics-based animation app featuring falling circles, explosions, and particle effects. Built with TypeScript and Matter.js, deployable as both a web app and an Android TV app for Chromecast with Google TV.

## Features

- **Physics-based Animation**: Realistic gravity and collision detection using Matter.js
- **Dynamic Circles**: Randomly-sized circles that fall and bounce
- **Explosion Effects**: Circles animate and explode after 6 seconds, or when clicked
- **Particle System**: 50 green particles spawn from each explosion
- **Resolution Independent**: Automatically adapts to any screen size
- **Fullscreen Support**: Optimized for TV viewing experience

## Project Structure

```
/Users/arttu/cc/
├── src/
│   ├── app.ts              # Main receiver app with physics engine
│   ├── sender.ts           # Web-based sender for casting
│   ├── index.html          # Receiver HTML page
│   ├── sender.html         # Sender HTML page
│   └── styles.css          # Styling
├── dist/                   # Compiled JavaScript output
├── android-app/            # Android TV app wrapper
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/bounce/app/MainActivity.kt
│   │   │   └── res/
│   │   └── build.gradle
│   ├── build.gradle
│   ├── settings.gradle
│   └── README.md           # Android build & sideload instructions
├── package.json
├── tsconfig.receiver.json
└── tsconfig.sender.json
```

## Technologies

- **TypeScript**: Type-safe JavaScript development
- **Matter.js**: 2D physics engine for realistic animations
- **Google Cast SDK**: For casting functionality (web version)
- **Kotlin**: Android TV app wrapper
- **GitHub Pages**: Static hosting for web app

## Web App Development

### Prerequisites

- Node.js and npm
- Python 3 (for local dev server)

### Setup

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Serve locally
npm run serve
# App available at http://localhost:22222
```

### Deployment

The web app is hosted on GitHub Pages at: https://arttu76.github.io/bounce/

To deploy updates:
```bash
# Build the project
npm run build

# Commit and push to GitHub
git add dist/
git commit -m "Update build"
git push origin main
```

## Android TV App

### Why Android TV Instead of Cast Receiver?

Chromecast with Google TV is fundamentally different from original Chromecast devices:
- **Original Chromecast**: Uses Cast SDK, apps appear when casting from a sender
- **Chromecast with Google TV**: Android TV device that can run standalone apps

To have the app appear in the Chromecast app list (like YouTube, Pac-Man, etc.), you need an Android TV app, not a Cast receiver.

### Building the Android APK

See [android-app/README.md](android-app/README.md) for detailed instructions.

Quick summary:
```bash
# Install prerequisites
brew install openjdk@17
brew install --cask android-commandlinetools
brew install android-platform-tools

# Set up environment
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools

# Install SDK components
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Build APK
cd android-app
./gradlew assembleDebug

# APK created at: app/build/outputs/apk/debug/app-debug.apk
```

### Sideloading to Chromecast with Google TV

1. **Enable Developer Mode on Chromecast**:
   - Settings > System > About
   - Click "Android TV OS build" 7 times
   - Enable USB debugging and Wireless debugging in Developer options

2. **Discover Chromecast IP**:
   ```bash
   # Find Chromecast on network
   dns-sd -B _googlecast._tcp local.

   # Get IP address (example output: 172.20.10.7)
   dns-sd -G v4 <hostname>.local.
   ```

3. **Pair and Install**:
   ```bash
   # On Chromecast: Settings > Developer options > Wireless debugging > Pair device
   # Note the pairing code and port

   # Pair (replace code and port)
   adb pair <IP>:<PORT> <PAIRING_CODE>

   # Install APK
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Launch**: Find "Bounce" in your Chromecast app list

## How It Works

### Physics Engine

The app uses Matter.js for realistic 2D physics:
- **Gravity**: Circles fall naturally (scale: 0.001)
- **Collisions**: Circles bounce off each other and walls
- **Borders**: Physics bodies account for visual borders

### Circle Lifecycle

1. **Spawn**: New circle every 500ms (random size: 5%-15% of screen width)
2. **Fall**: Affected by gravity, bounces when hitting ground/walls
3. **Age**: After 6 seconds, oldest circles (8-16 at a time) begin animation
4. **Animation**: Over 6 seconds:
   - Size grows to 125% of initial
   - Color fades from white to black
   - Border animates from white to green
5. **Explosion**: Circle explodes (or can be clicked to explode immediately)
   - Spawns 50 green particles in circular pattern
   - Applies outward force to nearby circles
   - Particles fade and shrink over 6 seconds

### Resolution Independence

The app adapts to any screen size:
- Window resize listener updates canvas and physics world
- All calculations use current window dimensions
- Circles, particles, and forces scale proportionally

## Configuration

Key parameters in [src/app.ts](src/app.ts):

```typescript
// Circle spawning
const SPAWN_INTERVAL = 500; // milliseconds
const MIN_SIZE = 0.05;       // 5% of screen width
const MAX_SIZE = 0.15;       // 15% of screen width

// Animation timing
const ANIMATION_START = 6000;  // ms before animation starts
const ANIMATION_DURATION = 6000; // ms for animation

// Explosion
const PARTICLE_COUNT = 50;      // particles per explosion
const EXPLOSION_FORCE = 6.0;    // force applied to nearby circles
const PARTICLE_LIFETIME = 6000; // ms before particles disappear
```

## Updating the Web App

After making changes to the source code:

```bash
# 1. Build
npm run build

# 2. Test locally
npm run serve

# 3. Deploy to GitHub Pages
git add dist/
git commit -m "Your change description"
git push origin main
```

Changes are immediately reflected in the Android TV app (no need to rebuild/reinstall APK) since it loads the web app from GitHub Pages.

## Development Tips

### Testing Locally

Use the sender page to test the receiver:
1. Build and serve: `npm run build && npm run serve`
2. Open sender page: http://localhost:22222/sender.html
3. Load receiver in iframe for quick testing

### Debugging

- **Web app**: Use Chrome DevTools
- **Android TV app**:
  ```bash
  adb logcat | grep bounce
  ```

### Hot Reload

For rapid development, edit TypeScript files and rebuild:
```bash
# Watch mode (requires additional setup)
tsc --watch --project tsconfig.receiver.json
```

## Technical Details

### TypeScript Configuration

Two separate TypeScript configs to avoid module conflicts:
- `tsconfig.receiver.json`: For Cast receiver app (uses global Matter.js)
- `tsconfig.sender.json`: For sender app (uses global Cast SDK)

### Android WebView Configuration

The Android app uses a fullscreen WebView with:
- JavaScript enabled
- Hardware acceleration
- DOM storage enabled
- Network security config for HTTPS

### GitHub Pages Deployment

The `dist/` directory is deployed to GitHub Pages:
- Branch: main
- Path: /dist
- URL: https://arttu76.github.io/bounce/

## Troubleshooting

### Build Errors

**Problem**: Java version mismatch
```
Solution: Ensure Java 17 is in PATH
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

**Problem**: Android SDK not found
```
Solution: Create local.properties:
echo "sdk.dir=/opt/homebrew/share/android-commandlinetools" > android-app/local.properties
```

### ADB Connection Issues

**Problem**: Connection refused on port 5555
```
Solution: Use wireless debugging pairing instead:
1. Settings > Developer options > Wireless debugging > Pair device
2. adb pair <IP>:<PORT> <CODE>
3. Device auto-connects, no need for adb connect
```

**Problem**: Can't find Chromecast IP
```
Solution: Use dns-sd:
dns-sd -B _googlecast._tcp local.
dns-sd -G v4 <hostname>.local.
```

### Runtime Issues

**Problem**: WebView shows blank screen
```
Solution: Check network connection and verify URL is accessible:
https://arttu76.github.io/bounce/index.html
```

**Problem**: Particles lag on TV
```
Solution: Reduce particle count in src/app.ts (currently 50)
```

## Performance Optimization

For older/slower devices:
- Reduce particle count (currently 50)
- Increase spawn interval (currently 500ms)
- Reduce maximum circles on screen
- Disable particle effects entirely

## License

This is a personal project. Use and modify as you wish.

## Acknowledgments

- Matter.js for the excellent 2D physics engine
- Google Cast SDK for casting capabilities
- Android TV platform for TV app support
