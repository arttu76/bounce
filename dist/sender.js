"use strict";
// Replace this with your actual Application ID from Google Cast Developer Console
const APPLICATION_ID = '93C2108F';
// Display the app ID on the page
const appIdDisplay = document.getElementById('app-id-display');
if (appIdDisplay) {
    appIdDisplay.textContent = APPLICATION_ID;
}
// Status display
const statusElement = document.getElementById('status');
function updateStatus(message) {
    if (statusElement) {
        statusElement.textContent = message;
    }
    console.log('Status:', message);
}
// Initialize Cast API
window.__onGCastApiAvailable = function (isAvailable) {
    if (isAvailable) {
        initializeCastApi();
    }
    else {
        updateStatus('Cast API not available');
    }
};
function initializeCastApi() {
    updateStatus('Cast API loaded, initializing...');
    // Check if cast is actually available
    if (typeof cast === 'undefined' || !cast.framework) {
        updateStatus('Waiting for Cast SDK to load...');
        setTimeout(initializeCastApi, 100);
        return;
    }
    const castContext = cast.framework.CastContext.getInstance();
    castContext.setOptions({
        receiverApplicationId: APPLICATION_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
    // Show the cast button
    const castButton = document.getElementById('cast-button');
    if (castButton) {
        castButton.style.display = 'block';
    }
    // Listen for session state changes
    castContext.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
        switch (event.sessionState) {
            case cast.framework.SessionState.SESSION_STARTED:
                updateStatus('✅ Connected to Chromecast! Your receiver app should now be running.');
                onSessionStarted();
                break;
            case cast.framework.SessionState.SESSION_RESUMED:
                updateStatus('✅ Reconnected to existing session');
                onSessionStarted();
                break;
            case cast.framework.SessionState.SESSION_ENDED:
                updateStatus('❌ Disconnected from Chromecast');
                break;
        }
    });
    updateStatus('✨ Ready! Click the Cast button to connect to your Chromecast.');
}
function onSessionStarted() {
    const session = cast.framework.CastContext.getInstance().getCurrentSession();
    if (session) {
        console.log('Session started:', session);
        // You can send messages to your receiver app here
        // Example:
        // session.sendMessage('urn:x-cast:com.example.custom', { message: 'Hello from sender!' });
    }
}
