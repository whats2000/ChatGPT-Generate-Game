import Entity from "./Entity.js";
import Explosion from "./Explosion.js";
import Shield from "./Shield.js";
import Missile from "./Missile.js";

// GameComponent/SpaceShip.js
class SpaceShip extends Entity {
    constructor(canvas) {
        super(
            "static/images/SpaceShip.png",
            50, 50,
            90, 60,
            canvas
        );

        this.speed = 5;
        this.canFireMissile = true;
        this.upgrade = 3;
        this.minUpgrade = 3;
        this.maxUpgrade = 13;
        this.shield = new Shield(this, canvas);
    }

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
