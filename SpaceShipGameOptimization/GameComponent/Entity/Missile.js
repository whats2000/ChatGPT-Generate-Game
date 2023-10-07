import Entity from "./Entity.js";
import GameSound from "../Game/GameSound.js";

/**
 * Represents a missile in the game.
 * @extends Entity
 */
class Missile extends Entity {
    /**
     * Create a new missile.
     * @param {string} type - The type of missile (A or B).
     * @param {number} x - The initial x-coordinate of the missile.
     * @param {number} y - The initial y-coordinate of the missile.
     * @param {HTMLCanvasElement} canvas - The game canvas element.
     */
    constructor(type = "A", x, y, canvas) {
        super(
            type === "A" ? "static/images/MissileA.png" : "static/images/MissileB.png",
            x, y,
            40, 16,
            canvas
        );

        this.type = type; // Type of missile (A or B)
        this.speed = 5;   // Speed of the missile

        // Play the launch sound for the missile type, if available
        if (Object.keys(GameSound.LaunchSound).includes(type)) {
            GameSound.LaunchSound[type].play(undefined, true);
        }
    }

    /**
     * Update the position of the missile based on its type.
     * @returns {boolean} True if the missile is out of bounds and should be removed, false otherwise.
     */
    updatePosition() {
        this.x += this.type === "A" ? this.speed : -this.speed;

        return (this.type === "A" && this.x > this.canvas.width) || (this.type === "B" && this.x < 0);
    }
}

export default Missile;
