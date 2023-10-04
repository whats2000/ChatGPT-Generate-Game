import Entity from "./Entity.js";

const shieldActiveSound = new Howl({
    src: ['static/sound/ShieldActive.mp3']
}).volume(1);

// Shield.js
class Shield extends Entity{
    constructor(owner, canvas) {
        const shieldSize = Math.max(owner.width, owner.height) + 30;

        super(
            "static/images/shield.png",
            owner.x - 0.5 * (shieldSize - owner.width), owner.y  - 0.5 * (shieldSize - owner.height),
            shieldSize, shieldSize,
            canvas
        );

        this.owner = owner; // Reference to the entity that owns this shield
        this.shieldSize = shieldSize;
        this.active = false; // Use a boolean to track the shield's state
        this.energy = 100; // Initial shield energy
        this.maxEnergy = 100;
        this.costPerSecond = 10; // Energy cost when the shield is active
        this.efficiency = 1;
        this.maxShieldEfficiency = 10;
        this.lastActivationTime = 0;
        this.lastEnergyRechargeTime = 0;
    }

    toggleShieldOn() {
        if (!this.active) {
            shieldActiveSound.play(undefined, true);
        }
        if (this.energy > this.costPerSecond) {
            // Activate the shield if there's enough energy
            this.active = true;
            this.lastActivationTime = Date.now();
        }
    }

    toggleShieldOff() {
        this.active = false;
    }

    recharge(amount) {
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.energy + amount, this.maxEnergy);
        }
    }

    updateState() {
        this.x = this.owner.x - 0.5 * (this.shieldSize - this.owner.width);
        this.y = this.owner.y  - 0.5 * (this.shieldSize - this.owner.height);
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.lastActivationTime;

        this.lastActivationTime = currentTime;

        if (this.active) {
            // Calculate the energy cost for the elapsed time with efficiency factor
            const energyCost = (elapsedTime / 1000) * this.costPerSecond * (1 - (this.efficiency - 1) / 11);

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

    upgradeShieldEfficiency(score) {
        // Define the cost to upgrade
        const upgradeCost = 10 * this.efficiency;

        // Check if the player has enough score and the fire rate is not at the maximum
        if (score >= 10 * this.efficiency && this.efficiency <= this.maxShieldEfficiency) {
            this.efficiency += 1;
            // Return the cost to be deducted
            return upgradeCost;
        }

        // Return false if the upgrade cannot be performed
        return false;
    }

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
