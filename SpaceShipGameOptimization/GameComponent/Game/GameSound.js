/**
 * A utility class for controlling audio volume with smooth transitions.
 * @extends {Howl}
 */
class GameSound extends Howl {
    /**
     * Create a background music Howl instance.
     * @type {GameSound}
     */
    static BackgroundMusic = new GameSound({
        src: ['static/sound/BackgroundMusic.mp3'],
        loop: true,
        volume: 0.8
    });

    /**
     * Create a boss background music Howl instance.
     * @type {GameSound}
     */
    static BossBackgroundMusic = new GameSound({
        src: ['static/sound/BossBackgroundMusic.mp3'],
        loop: true,
        volume: 0
    });

    /**
     * Create a warning sound Howl instance.
     * @type {GameSound}
     */
    static WarningSound = new GameSound({
        src: ['static/sound/Warning.mp3'],
        volume: 1
    });

    /**
     * Create missiles launch sound.
     * @type {Object.<string, GameSound>}
     */
    static LaunchSound = {
        "A": new GameSound({
            src: ['static/sound/MissileLaunchA.mp3'],
            volume: 0.2
        }),
        "B": new GameSound({
            src: ['static/sound/MissileLaunchB.mp3'],
            volume: 0.5
        })
    };

    /**
     * Create explosion sound.
     * @type {Object.<string, GameSound>}
     */
    static ExplosionSound = {
        "A": new GameSound({
            src: ['static/sound/ExplosionA.mp3'],
            volume: 0.2
        }),
        "B": new GameSound({
            src: ['static/sound/ExplosionB.mp3'],
            volume: 0.2
        }),
        "C": new GameSound({
            src: ['static/sound/PlayerCrash.mp3'],
            volume: 1
        })
    };

    /**
     * Create a Howl instance for the shield active sound.
     * @type {GameSound}
     */
    static shieldActiveSound = new GameSound({
        src: ['static/sound/ShieldActive.mp3'],
        volume: 1
    });

    /**
     * Decreases the volume of a Howl instance over a specified duration to a target volume.
     * @param {number} duration - The duration of the volume transition in milliseconds.
     * @param {number} targetVolume - The target volume to reach.
     */
    decreaseVolume(duration, targetVolume) {
        let currentVolume = this.volume();

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
                this.volume(currentVolume);
            } else {
                clearInterval(interval);
                if (targetVolume === 0) {
                    this.stop();
                }
            }
        }, 1000 / 60); // Update volume approximately 60 times per second for smooth transition
    }

    /**
     * Increases the volume of a Howl instance over a specified duration to a target volume.
     * @param {number} duration - The duration of the volume transition in milliseconds.
     * @param {number} targetVolume - The target volume to reach.
     */
    increaseVolume(duration, targetVolume) {
        let currentVolume = this.volume();

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
                this.volume(currentVolume);
            } else {
                clearInterval(interval);
            }
        }, 1000 / 60); // Update volume approximately 60 times per second for smooth transition
    }

    /**
     * Play a sound or resume previous playback.
     * @param  {string/number} sprite   Sprite name for sprite playback or sound id to continue previous.
     * @param  {boolean} internal Internal Use: true prevents event firing.
     * @return {number}          Sound ID.
     */
    play(sprite, internal) {
        super.play(sprite, internal);
    }

    /**
     * Get/set the global volume for all sounds.
     * @param {number|undefined} vol - Optional. Volume from 0.0 to 1.0. If provided and within the valid range,
     * it sets the volume. If `undefined`, it returns the current volume.
     * @returns {Howler|number} - If `vol` is `undefined`, returns the current volume. Otherwise, returns the Howler instance
     * for chaining methods.
     */
    volume(vol) {
        if (typeof vol === 'number' && vol >= 0 && vol <= 1.0) {
            // Volume is within the valid range, set it
            super.volume(vol);
        }
        // Return the current volume even if it's out of range or not a number
        return super.volume();
    }
}

export default GameSound;
