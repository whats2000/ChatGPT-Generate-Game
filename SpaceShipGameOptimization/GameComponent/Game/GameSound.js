/**
 * A utility class for controlling audio volume with smooth transitions.
 */
class GameSound {
    /**
     * Decreases the volume of a Howl instance over a specified duration to a target volume.
     * @param {Howl} howlInstance - The Howl instance to adjust the volume of.
     * @param {number} duration - The duration of the volume transition in milliseconds.
     * @param {number} targetVolume - The target volume to reach.
     */
    static decreaseVolume(howlInstance, duration, targetVolume) {
        let currentVolume = howlInstance.volume();

        // Calculate the number of intervals based on duration
        const numIntervals = duration / (1000 / 60);

        // Calculate the step for each interval
        const step = (currentVolume - targetVolume) / numIntervals;

        const interval = setInterval(() => {
            if (currentVolume > targetVolume) {
                currentVolume -= step;
                if (currentVolume < targetVolume) {
                    currentVolume = targetVolume;
                }
                howlInstance.volume(currentVolume);
            } else {
                clearInterval(interval);
                if (targetVolume === 0) {
                    howlInstance.stop();
                }
            }
        }, 1000 / 60); // Update volume approximately 60 times per second for smooth transition
    }

    /**
     * Increases the volume of a Howl instance over a specified duration to a target volume.
     * @param {Howl} howlInstance - The Howl instance to adjust the volume of.
     * @param {number} duration - The duration of the volume transition in milliseconds.
     * @param {number} targetVolume - The target volume to reach.
     */
    static increaseVolume(howlInstance, duration, targetVolume) {
        let currentVolume = howlInstance.volume();

        // Calculate the number of intervals based on duration
        const numIntervals = duration / (1000 / 60);

        // Calculate the step for each interval
        const step = (targetVolume - currentVolume) / numIntervals;

        const interval = setInterval(() => {
            if (currentVolume < targetVolume) {
                currentVolume += step;
                if (currentVolume > targetVolume) {
                    currentVolume = targetVolume;
                }
                howlInstance.volume(currentVolume);
            } else {
                clearInterval(interval);
            }
        }, 1000 / 60); // Update volume approximately 60 times per second for smooth transition
    }
}

export default GameSound;
