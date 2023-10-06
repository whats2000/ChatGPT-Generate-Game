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

        this.speed = 5;                          // Movement speed of the spaceship
        this.lastMissileAFiredTime = Date.now(); // Cooldown timer for firing missiles
        this.upgrade = 3;                        // Current missile firing rate upgrade level
        this.minUpgrade = 3;                     // Minimum upgrade level
        this.maxUpgrade = 13;                    // Maximum upgrade level
        this.shield = new Shield(this, canvas);  // The spaceship's shield
    }

    /**
     * Update the position of the spaceship based on user input or mouse control.
     * @param {GameControl} gameControl - The game control object handling input.
     */
    updatePosition(gameControl) {
        let newX = this.x;
        let newY = this.y;

        if (!gameControl.useMouseControl) {
            // Handle movement based on keyboard input
            if (gameControl.keyStates.isArrowUpPressed) {
                newY -= this.speed;
            }
            if (gameControl.keyStates.isArrowDownPressed) {
                newY += this.speed;
            }
            if (gameControl.keyStates.isArrowLeftPressed) {
                newX -= this.speed;
            }
            if (gameControl.keyStates.isArrowRightPressed) {
                newX += this.speed;
            }
        } else {
            // Handle movement based on mouse control
            const playerCenterX = this.x + this.width / 2;
            const playerCenterY = this.y + this.height / 2;
            const deltaX = gameControl.currentMouseX - playerCenterX;
            const deltaY = gameControl.currentMouseY - playerCenterY;

            // Gradually update the player's position to the mouse location
            if (deltaX > this.speed || deltaX < -this.speed) {
                newX += deltaX > 0 ? this.speed : -this.speed;
            }
            if (deltaY > this.speed || deltaY < -this.speed) {
                newY += deltaY > 0 ? this.speed : -this.speed;
            }
        }

        // Ensure the player stays within the canvas bounds
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
        if (!isSpacePressed || this.lastMissileAFiredTime + 1000 / this.upgrade > Date.now()) return;

        missiles.push(new Missile(
            "A",
            this.x + this.width,
            this.y + this.height / 2 - 7,
            this.canvas
        ));

        this.lastMissileAFiredTime = Date.now();
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
