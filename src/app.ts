// Initialize the Cast Receiver SDK
// @ts-ignore - Types loaded from CDN
const context = cast.framework.CastReceiverContext.getInstance();
// @ts-ignore
const options = new cast.framework.CastReceiverOptions();

// Start the receiver
context.start(options);

// Get the circle element
const circle = document.getElementById('circle') as HTMLElement;

// Flash between yellow and red
let isYellow = true;

setInterval(() => {
    if (isYellow) {
        circle.style.backgroundColor = 'red';
    } else {
        circle.style.backgroundColor = 'yellow';
    }
    isYellow = !isYellow;
}, 500); // Flash every 500ms
