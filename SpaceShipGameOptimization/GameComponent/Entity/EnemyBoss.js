import Enemy from "./Enemy.js";
import Explosion from "./Explosion.js";
import Missile from "./Missile.js";
import Shield from "./Shield.js";

/**
 * Represents a powerful enemy boss in the game.
 */
class EnemyBoss extends Enemy {
    /**
     * Create a new enemy boss.
     * @param {HTMLCanvasElement} canvas - The game canvas element.
     */
    constructor(canvas) {
        // Call the constructor of the parent class 'Enemy'
        super(canvas);

        // Set the boss's image, initial position, and size
        this.image.src = "static/images/SpacePirateBossShip.png";
        this.x = canvas.width + 400;                     // Initial X-coordinate off-screen
        this.y = 0.5 * canvas.height;                    // Initial Y-coordinate at the center of the canvas
        this.width = 300;                                // Width of the boss entity
        this.height = 270;                               // Height of the boss entity

        this.speed = 0.35;                               // Boss's movement speed
        this.health = 30;                                // Boss's initial health
        this.lastMissileBFiredTime = Date.now() + 5000;  // Initial missile firing time (5 seconds delay)
        this.targetX = canvas.width - 350;               // Initial target X position (right side of the canvas)
        this.targetY = 0.5 * canvas.height;              // Initial target Y position (center of the canvas)

        this.isInFight = false;                        // Flag to indicate if boss is in attack mode

        // Initialize the boss's shield and set its upgrade level to 6
        this.shield = new Shield(this, canvas);
        this.shield.upgrade = 7;
    }


    /**
     * Update the boss's position and behavior.
     * @param {SpaceShip} player - The player's spaceship for targeting.
     */
    updatePosition(player) {
        if (!this.isInFight) return;

        // Adjust the boss's target Y-coordinate based on the player's position
        this.targetY = player.y - 0.5 * this.height + 0.5 * player.height;

        // Activate the boss's shield if not active and health > 5
        if (!this.shield.active && this.health > 5) {
            this.shield.toggleShieldOn(false);
        }

        // Move the boss towards its target
        this.moveToTarget();
    }

    /**
     * Fire 5 missiles B with varying Y-coordinates.
     * @param {Missile[]} missiles - The array of missiles to store the fired missiles.
     */
    fire(missiles) {
        if (!this.isInFight) return;

        // Check if it's time for the enemy boss to fire missile B
        const currentTime = Date.now();
        if (currentTime - this.lastMissileBFiredTime > 3000) { // 3000 milliseconds (3 seconds) cooldown
            // Calculate the center Y-coordinate
            const centerY = this.y + this.height / 2 - 8;

            // Create and push 5 new missile B instances with varying Y-coordinates
            for (let i = -2; i <= 2; i++) {
                missiles.push(new Missile(
                    "B",
                    this.x + this.width - 50, centerY + i * 50,
                    this.canvas
                ));
            }

            this.lastMissileBFiredTime = currentTime;
        }
    }

    /**
     * Create a huge explosion when the boss is defeated.
     * @param {Explosion[]} explosions - The array of explosions to add the huge explosion to.
     */
    hugeExplosion(explosions) {
        const centerX = this.x + 0.5 * this.width;
        const centerY = this.y + 0.5 * this.height;
        const numExplosions = 20; // Number of explosions to create

        for (let i = 0; i < numExplosions; i++) {
            // Calculate the position of each explosion point around the boss
            const angle = (i / numExplosions) * 2 * Math.PI;
            const radius = Math.random() * this.width / 1.5;

            const explosionX = centerX + radius * Math.cos(angle);
            const explosionY = centerY + radius * Math.sin(angle);

            // Calculate different time delays for each explosion (in milliseconds)
            const delay = i * 50;

            setTimeout(() => {
                explosions.push(new Explosion("A", explosionX, explosionY, Date.now(), this.canvas));
            }, delay);
        }
    }

    /**
     * Reset the boss's attributes and position.
     */
    reset() {
        this.isInFight = false;

        // Reset the boss's position, missile firing time, health, shield, and shield energy
        this.x = this.canvas.width + 400;
        this.y = 0.5 * this.canvas.height;
        this.lastMissileBFiredTime = Date.now() + 5000;
        this.health = 30;
        this.targetX = this.canvas.width - 350;
        this.shield.energy = 100;
        this.shield.lastActivationTime = Date.now();
        this.shield.active = true;
    }

    /**
     * Resize the canvas to match the window's inner dimensions.
     * @public
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d");

        if (!this.isInFight) {
            this.x = window.innerWidth + 400;                // Resize X-coordinate off-screen
            this.y = 0.5 * window.innerHeight;               // Resize Y-coordinate at the center of the canvas
        }

        this.targetX = window.innerWidth - 350;          // Resize target X position (right side of the canvas)
        this.targetY = 0.5 * window.innerHeight;         // Resize target Y position (center of the canvas)
    }
}

export default EnemyBoss;
