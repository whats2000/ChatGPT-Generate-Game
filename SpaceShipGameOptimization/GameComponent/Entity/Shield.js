import Entity from "./Entity.js";
import GameSound from "../Game/GameSound.js";

/**
 * Represents a shield that can be activated by the player's spaceship.
 * @extends Entity
 */
class Shield extends Entity {
    /**
     * Create a new shield.
     * @param {Entity} owner - The entity that owns this shield.
     * @param {HTMLCanvasElement} canvas - The game canvas element.
     */
    constructor(owner, canvas) {
        // Calculate the shield size based on the owner's dimensions
        const shieldSize = Math.max(owner.width, owner.height) + 30;

        super(
            "static/images/shield.png",
            owner.x - 0.5 * (shieldSize - owner.width),
            owner.y - 0.5 * (shieldSize - owner.height),
            shieldSize,
            shieldSize,
            canvas
        );

        this.owner = owner;              // Reference to the entity that owns this shield
        this.shieldSize = shieldSize;    // Size of the shield
        this.active = false;             // Use a boolean to track the shield's state
        this.energy = 100;               // Initial shield energy
        this.maxEnergy = 100;            // Maximum shield energy
        this.costPerSecond = 10;         // Energy cost when the shield is active per second
        this.upgrade = 1;                // Shield upgrade level
        this.minUpgrade = 1;             // Minimum shield upgrade level
        this.maxUpgrade = 11;            // Maximum shield upgrade level
        this.lastActivationTime = 0;     // Timestamp of the last shield activation
        this.lastEnergyRechargeTime = 0; // Timestamp of the last energy recharge
    }

    /**
     * Activate the shield if there's enough energy.
     * @param {boolean} [playSound=true] - Whether to play the shield activation sound (default is true).
     */
    toggleShieldOn(playSound = true) {
        if (this.energy > 3) {
            if (!this.active && playSound) {
                GameSound.ShieldActiveSound.play(undefined, true);
            }
            // Activate the shield if there's enough energy
            this.active = true;
            this.lastActivationTime = Date.now();
        }
    }

    /**
     * Deactivate the shield.
     */
    toggleShieldOff() {
        this.active = false;
    }

    /**
     * Recharge the shield's energy by the specified amount, up to the maximum energy.
     * @param {number} amount - The amount of energy to recharge.
     */
    recharge(amount) {
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.energy + amount, this.maxEnergy);
        }
    }

    /**
     * Update the state of the shield, including energy consumption and recharge.
     */
    updateState() {
        this.x = this.owner.x - 0.5 * (this.shieldSize - this.owner.width);
        this.y = this.owner.y - 0.5 * (this.shieldSize - this.owner.height);
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.lastActivationTime;

        this.lastActivationTime = currentTime;

        if (this.active) {
            // Calculate the energy cost for the elapsed time with efficiency factor
            const energyCost = (elapsedTime / 1000) * this.costPerSecond * (1 - (this.upgrade - 1) / 11);

            // Check if there's enough energy to sustain the shield
            if (this.energy >= energyCost) {
                // Deduct the energy cost
                this.energy -= energyCost;
            } else {
                // Deactivate the shield if there's not enough energy
                this.active = false;
            }
        } else {
            // Implement shield energy recharge mechanism here
            // Recharge the shield 1 point every 1 second
            if (currentTime - this.lastEnergyRechargeTime >= 1000) {
                this.recharge(1);
                this.lastEnergyRechargeTime = currentTime;
            }
        }
    }

    /**
     * Draw the shield on the canvas if it's active.
     */
    draw() {
        if (this.active) {
            this.ctx.drawImage(
                this.image,
                this.x, this.y,
                this.shieldSize, this.shieldSize
            );
        }
    }
}

export default Shield;
