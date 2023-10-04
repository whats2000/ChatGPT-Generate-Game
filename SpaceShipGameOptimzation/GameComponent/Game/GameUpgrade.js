class GameUpgrade {
    constructor(game, buttonId, progressBarId, costElementId, maxUpgrade, progressBarIncrement, upgradeFunction) {
        this.game = game;
        this.button = document.getElementById(buttonId);
        this.progressBar = document.getElementById(progressBarId);
        this.costElement = document.getElementById(costElementId);
        this.maxUpgrade = maxUpgrade;
        this.progressBarIncrement = progressBarIncrement;
        this.upgradeFunction = upgradeFunction; // Store the upgrade function

        this.button.addEventListener('click', () => {
            this.performUpgrade();
        });
    }

    performUpgrade() {
        // Call the specified upgrade function and get the cost
        const upgradeCost = this.upgradeFunction();

        console.log(this.maxUpgrade, upgradeCost)

        if (upgradeCost !== false) {
            // Deduct the cost from the SpaceGame.score
            this.game.score -= upgradeCost;

            // Update the cost display
            this.costElement.textContent = upgradeCost < this.maxUpgrade ? `Cost: ${upgradeCost}` : `Max Level`;

            // Get the current width of the progress bar
            const currentWidth = parseFloat(getComputedStyle(this.progressBar).width);

            // Update the progress bar width
            this.progressBar.style.width = `${currentWidth + this.progressBarIncrement}px`;

            // Update the display
            this.game.scoreboardElement.textContent = "Score: " + this.game.score;
        }
    }
}

export default GameUpgrade;
