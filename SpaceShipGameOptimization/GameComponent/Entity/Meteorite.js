import Entity from "./Entity.js";
import Explosion from "./Explosion.js";

/**
 * Represents a meteorite object in the game.
 * @extends Entity
 */
class Meteorite extends Entity {
    /**
     * Create a new meteorite.
     * @param {string} type - The type of meteorite (A or B).
     * @param {HTMLCanvasElement} canvas - The game canvas element.
     */
    constructor(type = "A", canvas) {
        super(
            "",
            0, 0,
            0, 0,
            canvas
        );

        this.type = type;         // Type of meteorite (A or B)
        this.width = 0;           // Width of the meteorite
        this.height = 0;          // Height of the meteorite
        this.speedX = 0;          // Horizontal speed of the meteorite
        this.speedY = 0;          // Vertical speed of the meteorite
        this.health = 0;          // Health points of the meteorite
        this.hasRotation = false; // Indicates if the meteorite rotates
        this.rotation = 0;        // Rotation angle of the meteorite

        // Initialize meteorite properties based on type
        switch (type) {
            case "A":
                this.width = 80;
                this.height = 50;
                this.speedX = -3.1 - Math.random() * 3;
                this.speedY = -1.5 + Math.random() * 3;
                this.image.src = "static/images/MeteoriteA.png";
                this.health = 1;
                break;
            case "B":
                this.width = 80;
                this.height = 80;
                this.speedX = -1 + Math.random() * 2;
                this.speedY = Math.random() < 0.5 ? 0.5 + Math.random() * 2 : -0.5 - Math.random() * 2;
                this.image.src = "static/images/MeteoriteB.png";
                this.health = 3;
                this.hasRotation = true;
                break;
            default:
                // Handle unknown type as type A
                this.width = 80;
                this.height = 50;
                this.speedX = -3.1 - Math.random() * 3;
                this.speedY = -1.5 + Math.random() * 3;
                this.image.src = "static/images/MeteoriteA.png";
                this.health = 1;
                break;
        }

        // Initialize initial position of meteorite based on type
        this.x = this.type === "A" ? canvas.width + 500 : Math.random() * (canvas.width);
        this.y = this.type === "A" ? Math.random() * (canvas.height - 50) : this.speedY > 0 ? -200 : canvas.height + 200;
    }

    /**
     * Update the position of the meteorite.
     * @returns {boolean} True if the meteorite is out of bounds and should be removed, false otherwise.
     */
    updatePosition() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.hasRotation) {
            this.rotation += 0.005;
        }

        return (this.type === "A" && this.x + this.width < 0) ||
            (this.type === "B" &&
                (
                    (this.y > this.canvas.height + 100 && this.speedY > 0) ||
                    (this.y < -100 && this.speedY < 0)
                )
            );
    }

    /**
     * Draw the meteorite on the canvas.
     */
    draw() {
        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        this.ctx.rotate(this.rotation);
        this.ctx.drawImage(
            this.image,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        this.ctx.restore();
    }

    /**
     * Explode the meteorite when hit by a missile A.
     * @param {Missile} missileA - The missile that hit the meteorite.
     * @param {Explosion[]} explosions - The array of explosions to add the new explosion.
     */
    explode(missileA, explosions) {
        // Add the explosion to the explosions array with a timestamp
        explosions.push(new Explosion(
            "B",
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
                this.health--;
                return missileA;
            }
        }

        return false;
    }
}

export default Meteorite;
