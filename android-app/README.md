# Bounce Android TV App

Android TV app wrapper for the Bounce web application.

## Prerequisites

- JDK 17 or higher
- ADB (Android Debug Bridge) for sideloading

### Installing JDK 17 on macOS

```bash
# Check current Java version
java -version

# Install JDK 17 using Homebrew
brew install openjdk@17

# Add to PATH (add this to your ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Reload shell or source the profile
source ~/.zshrc  # or source ~/.bash_profile

# Verify installation
java -version  # Should show version 17.x.x
```

### Installing ADB on macOS

```bash
# Using Homebrew
brew install android-platform-tools

# Verify installation
adb --version
```

## Building the APK (Command Line)

No Android Studio required! Build directly from terminal:

```bash
# 1. Install Android command-line tools
brew install --cask android-commandlinetools

# 2. Set up Android SDK environment (add to ~/.zshrc or ~/.bash_profile)
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# 3. Accept licenses and install required SDK components
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 4. Build the APK
cd /Users/arttu/cc/android-app
./gradlew assembleDebug

# APK will be created at:
# app/build/outputs/apk/debug/app-debug.apk
```

The build process will download Gradle and compile the Android app (may take a few minutes on first run).

### Alternative: Using Android Studio

1. Open Android Studio
2. Select "Open an Existing Project"
3. Navigate to `/Users/arttu/cc/android-app/` and open it
4. Wait for Gradle sync to complete
5. Build: Menu > Build > Build Bundle(s) / APK(s) > Build APK(s)

## Sideloading to Chromecast with Google TV

### Enable Developer Options on Chromecast

1. On your Chromecast with Google TV, go to Settings
2. Navigate to System > About
3. Scroll down to "Android TV OS build"
4. Click on it 7 times until you see "You are now a developer"
5. Go back to Settings > System > Developer options
6. Enable "USB debugging"

### Connect and Install via ADB

#### Option 1: ADB over network (wireless)

1. On Chromecast: Settings > System > Developer options > Enable "Network debugging"
2. Note the IP address shown on screen (e.g., 192.168.1.100)
3. On your computer, open terminal:
   ```bash
   # Connect to Chromecast (replace with your IP)
   adb connect 192.168.1.100:5555

   # Verify connection
   adb devices

   # Install the APK
   adb install /Users/arttu/cc/android-app/app/build/outputs/apk/debug/app-debug.apk
   ```

#### Option 2: ADB over USB

1. Connect USB cable from computer to Chromecast
2. On your computer, open terminal:
   ```bash
   # Verify connection
   adb devices

   # Install the APK
   adb install /Users/arttu/cc/android-app/app/build/outputs/apk/debug/app-debug.apk
   ```

### Launch the App

After installation, the "Bounce" app will appear in your Apps list on Chromecast with Google TV.

## Updating the App

To update after making changes to the web app:

1. The app loads https://arttu76.github.io/bounce/index.html
2. Simply update your GitHub Pages deployment
3. Changes will be reflected automatically when the app is relaunched
4. No need to rebuild or reinstall the Android app

## Troubleshooting

### ADB not found
Add Android SDK platform-tools to your PATH:
```bash
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
```

### Connection refused
- Ensure both computer and Chromecast are on the same network
- Verify USB debugging is enabled
- Try disconnecting and reconnecting: `adb disconnect` then `adb connect IP:5555`

### App won't install
- Uninstall previous version: `adb uninstall com.bounce.app`
- Then try installing again

### App crashes on launch
- Check logs: `adb logcat | grep bounce`
- Verify the web app URL is accessible from the device's browser
