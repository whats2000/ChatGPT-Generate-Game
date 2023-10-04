import Entity from "./Entity.js";

const LaunchSound = {
    "A": new Howl({
        src: ['static/sound/MissileLaunchA.mp3']
    }).volume(1),
    "B": new Howl({
        src: ['static/sound/MissileLaunchB.mp3']
    }).volume(1)
}

class Missile extends Entity {
    constructor(type = "A", x, y, canvas) {
        super(
            type === "A" ? "static/images/MissileA.png" : "static/images/MissileB.png",
            x, y,
            40, 16,
            canvas
        );

        this.type = type;
        this.speed = 5;

        if (Object.keys(LaunchSound).includes(type)) {
            LaunchSound[type].play(undefined, true);
        }
    }

    updatePosition() {
        this.x += this.type === "A" ? this.speed : -this.speed;

        return (this.type === "A" && this.x > this.canvas.width) || (this.type === "B" && this.x < 0);
    }

    draw() {
            this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

export default Missile;
