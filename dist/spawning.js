import { state } from './state';
import { SPAWN_INTERVAL_DECREASE } from './constants';
import { addCircle } from './bubbles';
// Add circles periodically with decreasing interval
export function scheduleNextSpawn() {
    setTimeout(() => {
        if (!state.isGameOver) {
            addCircle();
            // Decrease spawn interval (makes spawning faster)
            state.spawnInterval = Math.max(50, state.spawnInterval - SPAWN_INTERVAL_DECREASE); // Min 50ms
        }
        scheduleNextSpawn(); // Schedule next spawn
    }, state.spawnInterval);
}
