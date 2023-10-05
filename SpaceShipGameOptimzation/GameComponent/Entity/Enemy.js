import Entity from "./Entity.js";
import Explosion from "./Explosion.js";
import Missile from "./Missile.js";
import Shield from "./Shield.js";

/**
 * Represents an enemy in the game.
 * @extends Entity
 */
class Enemy extends Entity {
    /**
     * Create a new enemy.
     * @param {HTMLCanvasElement} canvas - The game canvas element.
     */
    constructor(canvas) {
        super(
            "static/images/SpacePirateShip.png",
            canvas.width + 100, Math.random() * canvas.height,
            90, 60,
            canvas
        );

        this.speed = 0.5;                                             // Movement speed of the enemy
        this.health = 5;                                              // Initial health points
        this.lastMissileBFiredTime = Date.now() + 1500;               // Cooldown timer for firing missiles
        this.targetX = canvas.width - 50;                             // Initial target X position
        this.targetY = Math.random() * (canvas.height - this.height); // Initial target Y position
        this.shield = new Shield(this, canvas);                       // Initial Shield
    }

    /**
     * Update the enemy's position.
     */
    updatePosition() {
        // If the enemy has reached its current target, generate a new random target
        if (Math.abs(this.y - this.targetY) < this.speed) {
            // Generate a new random targetY within canvas
            this.targetY = Math.random() * (this.canvas.height - this.height);
        }

        if (Math.abs(this.x - this.targetX) < this.speed) {
            // Generate a new random targetX on the right half of the screen
            this.targetX = this.canvas.width / 2 + Math.random() * (this.canvas.width / 2 - this.width);
        }

        this.moveToTarget();
    }

    /**
     * Move the enemy.
     */
    moveToTarget() {
        // Move the enemy towards its target
        if (this.y < this.targetY) {
            this.y += this.speed;
        } else if (this.y > this.targetY) {
            this.y -= this.speed;
        }

        if (this.x < this.targetX) {
            this.x += this.speed;
        } else if (this.x > this.targetX) {
            this.x -= this.speed;
        }
    }

    /**
     * Fire a missile B.
     * @param {Missile[]} missiles - The array of missiles to store the fired missile.
     */
    fire(missiles) {
        // Check if it's time for the enemy to fire missile B
        const currentTime = Date.now();
        if (currentTime - this.lastMissileBFiredTime > 3000) { // 3000 milliseconds (3 seconds) cooldown
            // Create and push a new missile B
            missiles.push(new Missile(
                "B",
                this.x, this.y + this.height / 2 - 8,
                this.canvas
            ));

            this.lastMissileBFiredTime = currentTime;
        }
    }

    /**
     * Explode the enemy when hit by a missile A.
     * @param {Missile} missileA - The missile that hit the enemy.
     * @param {Explosion[]} explosions - The array of explosions to add the new explosion.
     */
    explode(missileA, explosions) {
        // Add the explosion to the explosions array with a timestamp
        explosions.push(new Explosion(
            "A",
            missileA.x,
            missileA.y - 40,
            Date.now(),
            this.canvas
        ));
    }

    /**
     * Check for collisions with missile A and reduce health if a collision occurs.
     * @param {Missile[]} missilesA - The array of missile A objects.
     * @returns {Missile|false} The collided missile or false if no collision occurred.
     */
    checkCollisions(missilesA) {
        // Check for collisions with enemy missiles B
        for (const missileA of missilesA) {
            if (!missileA) continue;
            if (this.isCollideWith(missileA)) {
                if (!this.shield.active) {
                    this.health--;
                }
                return missileA;
            }
        }

        return false;
    }
}

export default Enemy;
