import Entity from "./Entity.js";
import Explosion from "./Explosion.js";
import Missile from "./Missile.js";

// GameComponent/Enemy.js
class Enemy extends Entity {
    constructor(canvas) {
        super(
            "static/images/SpacePirateShip.png",
            canvas.width + 100, Math.random() * canvas.height,
            90, 60,
            canvas
        );

        this.speed = 0.5;
        this.health = 5;
        this.lastMissileBFiredTime = Date.now() + 1500;
        this.targetX = canvas.width - 50;
        this.targetY = Math.random() * (canvas.height - this.height);
    }

    updatePosition() {
        // If the enemy has reached its current target, generate a new random target
        if (Math.abs(this.y - this.targetY) < this.speed) {
            this.targetY = Math.random() * (this.canvas.height - this.height);
        }

        if (Math.abs(this.x - this.targetX) < this.speed) {
            // Generate a new random targetX on the right half of the screen
            this.targetX = this.canvas.width / 2 + Math.random() * (this.canvas.width / 2 - this.width);
        }

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

    fire(missiles) {
        // Check if it's time for the enemy to fire missile B
        const currentTime = Date.now();
        if (currentTime - this.lastMissileBFiredTime > 3000) { // 3000 milliseconds (3 seconds) cooldown
            // Create and push a new missile B
            missiles.push(new Missile(
                "B",
                this.x, this.y + this.height / 2 - 7,
                this.canvas
            ));

            this.lastMissileBFiredTime = currentTime;
        }
    }

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

    checkCollisions(missilesA) {
        // Check for collisions with enemy missiles B
        for (const missileA of missilesA) {
            if (!missileA) continue;
            if (this.isCollideWith(missileA)) {
                this.health--;
                return missileA;
            }
        }

        return false;
    }
}

export default Enemy;
