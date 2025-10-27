import { isGameOver, spawnInterval, setSpawnInterval } from './state';
import { SPAWN_INTERVAL_DECREASE } from './constants';
import { addCircle } from './bubbles';

// Add circles periodically with decreasing interval
export function scheduleNextSpawn() {
    setTimeout(() => {
        if (!isGameOver) {
            addCircle();
            // Decrease spawn interval (makes spawning faster)
            setSpawnInterval(Math.max(50, spawnInterval - SPAWN_INTERVAL_DECREASE)); // Min 50ms
        }
        scheduleNextSpawn(); // Schedule next spawn
    }, spawnInterval);
}
