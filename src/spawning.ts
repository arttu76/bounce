import { state } from './state';
import { SPAWN_INTERVAL_DECREASE, MIN_SPAWN_INTERVAL } from './constants';
import { addCircle } from './bubbles';

// Add circles periodically with decreasing interval
export function scheduleNextSpawn() {
    setTimeout(() => {
        if (!state.isGameOver) {
            addCircle();
            // Decrease spawn interval (makes spawning faster)
            state.spawnInterval = Math.max(MIN_SPAWN_INTERVAL, state.spawnInterval - SPAWN_INTERVAL_DECREASE);
        }
        scheduleNextSpawn(); // Schedule next spawn
    }, state.spawnInterval);
}
