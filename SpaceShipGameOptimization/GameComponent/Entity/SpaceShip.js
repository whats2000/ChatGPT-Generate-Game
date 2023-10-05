import Entity from "./Entity.js";
import Explosion from "./Explosion.js";
import Shield from "./Shield.js";
import Missile from "./Missile.js";

/**
 * Represents the player's spaceship in the game.
 * @extends Entity
 */
class SpaceShip extends Entity {
    /**
     * Create a new spaceship.
     * @param {HTMLCanvasElement} canvas - The game canvas element.
     */
    constructor(canvas) {
        super(
            "static/images/SpaceShip.png",
            50, 50,
            90, 60,
            canvas
        );

        this.speed = 5;                         // Movement speed of the spaceship
        this.canFireMissile = true;             // Flag to control missile firing rate
        this.upgrade = 3;                       // Current missile firing rate upgrade level
        this.minUpgrade = 3;                    // Minimum upgrade level
        this.maxUpgrade = 13;                   // Maximum upgrade level
        this.shield = new Shield(this, canvas); // The spaceship's shield
    }

    /**
     * Update the position of the spaceship based on user input.
     * @param {boolean} isArrowUpPressed - Whether the "Arrow Up" key is pressed.
     * @param {boolean} isArrowDownPressed - Whether the "Arrow Down" key is pressed.
     * @param {boolean} isArrowLeftPressed - Whether the "Arrow Left" key is pressed.
     * @param {boolean} isArrowRightPressed - Whether the "Arrow Right" key is pressed.
     */
    updatePosition(isArrowUpPressed, isArrowDownPressed, isArrowLeftPressed, isArrowRightPressed) {
        let newX = this.x;
        let newY = this.y;

        if (isArrowUpPressed) {
            newY -= this.speed;
        }
        if (isArrowDownPressed) {
            newY += this.speed;
        }
        if (isArrowLeftPressed) {
            newX -= this.speed;
        }
        if (isArrowRightPressed) {
            newX += this.speed;
        }

        if (newX >= 0 && newX + this.width <= this.canvas.width) {
            this.x = newX;
        }
        if (newY >= 0 && newY + this.height <= this.canvas.height) {
            this.y = newY;
        }
    }

    /**
     * Fire a missile if conditions allow.
     * @param {boolean} isSpacePressed - Whether the "Space" key is pressed.
     * @param {Missile[]} missiles - The array of missiles to store the fired missile.
     */
    fire(isSpacePressed, missiles) {
        if (!isSpacePressed || !this.canFireMissile) return;

        missiles.push(new Missile(
            "A",
            this.x + this.width,
            this.y + this.height / 2 - 7,
            this.canvas
        ));

        this.canFireMissile = false;

        setTimeout(() => {
            this.canFireMissile = true;
        }, 1000 / this.upgrade);
    }

    /**
     * Explode the spaceship.
     * @param {Explosion[]} explosions - The array of explosions to add the new explosion.
     */
    explode(explosions) {
        // Add the explosion to the explosions array with a timestamp
        explosions.push(new Explosion(
            "C",
            this.x - 20,
            this.y - 20,
            Date.now(),
            this.canvas
        ));
    }

    /**
     * Check for collisions with various game objects.
     * @param {Meteorite[]} meteorites - The array of meteorite objects.
     * @param {Missile[]} missilesB - The array of missile B objects.
     * @param {Enemy[]} enemies - The array of enemy objects.
     * @returns {boolean} True if a collision occurs, false otherwise.
     */
    checkCollisions(
        meteorites,
        missilesB,
        enemies
    ) {
        if (this.shield.active) return false; // Skip collisions when the shield is active

        // Check for collisions with meteorites
        for (const meteorite of meteorites) {
            if (this.isCollideWith(meteorite)) {
                return true;
            }
        }

        // Check for collisions with enemy missiles B
        for (const missileB of missilesB) {
            if (this.isCollideWith(missileB)) {
                return true;
            }
        }

        // Check for collisions with enemies
        for (const enemy of enemies) {
            if (this.isCollideWith(enemy)) {
                return true;
            }
        }

        return false;
    }
}

export default SpaceShip;
