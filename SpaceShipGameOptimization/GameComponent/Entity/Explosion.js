import GameSound from "../Game/GameSound.js";

const explosionImage = new Image();
explosionImage.src = "static/images/Explosion.png"; // Path to the explosion image

/**
 * Represents an explosion effect in the game.
 */
class Explosion {
    /**
     * Create a new explosion.
     * @param {string} type - The type of explosion (A, B, or C).
     * @param {number} x - The x-coordinate of the explosion's position.
     * @param {number} y - The y-coordinate of the explosion's position.
     * @param {number} timestamp - The timestamp when the explosion was created.
     * @param {HTMLCanvasElement} canvas - The game canvas element.
     */
    constructor(type = "A", x, y, timestamp, canvas) {
        this.x = x;                                  // X-coordinate of the explosion's position
        this.y = y;                                  // Y-coordinate of the explosion's position
        this.timestamp = timestamp;                  // Timestamp when the explosion was created
        this.ctx = canvas.getContext("2d"); // 2D rendering context of the canvas

        // Play the explosion sound if the type is valid
        if (Object.keys(GameSound.ExplosionSound).includes(type)) {
            GameSound.ExplosionSound[type].play(undefined, true);
        }
    }

    /**
     * Check if the explosion has expired (older than 250 milliseconds).
     * @returns {boolean} True if the explosion has expired, false otherwise.
     */
    isExpired() {
        return Date.now() - this.timestamp > 250;
    }

    /**
     * Draw the explosion on the canvas.
     */
    draw() {
        const currentTime = Date.now();

        if (this.isExpired()) {
            return; // Skip drawing if the explosion has expired
        }

        // Draw the explosion image with scaling based on time elapsed since creation
        this.ctx.drawImage(
            explosionImage,
            this.x + (100 - 100 * (currentTime - this.timestamp) / 250) / 2,
            this.y + (100 - 100 * (currentTime - this.timestamp) / 250) / 2,
            100 * (currentTime - this.timestamp) / 250,
            100 * (currentTime - this.timestamp) / 250
        );
    }
}

export default Explosion;
