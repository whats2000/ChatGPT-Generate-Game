import Entity from "./Entity.js";
import Explosion from "./Explosion.js";

class Meteorite extends Entity {
    constructor(type = "A", canvas) {
        super(
            "",
            0, 0,
            0, 0,
            canvas
        );

        this.type = type;
        this.width = 0;
        this.height = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.health = 0;
        this.hasRotation = false;
        this.rotation = 0;

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
                // Handle unknown type
                break;
        }

        this.x = this.type === "A" ? canvas.width + 500 : Math.random() * (canvas.width);
        this.y = this.type === "A" ? Math.random() * (canvas.height - 50) : this.speedY > 0 ? -200 : canvas.height + 200;
    }

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
