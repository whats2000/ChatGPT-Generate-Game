class GameUpgrade {
    constructor(game, buttonId, progressBarId, costElementId, target, progressBarIncrement) {
        this.game = game;
        this.button = document.getElementById(buttonId);
        this.progressBar = document.getElementById(progressBarId);
        this.costElement = document.getElementById(costElementId);
        this.target = target;
        this.progressBarIncrement = progressBarIncrement;

        this.button.addEventListener('click', () => {
            this.performUpgrade();
        });
    }

    performUpgrade() {
        // Define the cost to upgrade
        const upgradeCost = 10 * (this.target.upgrade - this.target.minUpgrade + 1);

        // Check if the player has enough score and the upgrade is not at the maximum
        if (!(this.game.score >= upgradeCost && this.target.upgrade < this.target.maxUpgrade)) return;

        this.target.upgrade += 1;

        // Deduct the cost from the SpaceGame.score
        this.game.score -= upgradeCost;

        // Update the cost display
        this.costElement.textContent = upgradeCost < (this.target.maxUpgrade - this.target.minUpgrade) * 10 ?
            `Cost: ${upgradeCost + 10}` : `Max Level`;

        // Get the current width of the progress bar
        const currentWidth = parseFloat(getComputedStyle(this.progressBar).width);

        // Update the progress bar width
        this.progressBar.style.width = `${currentWidth + this.progressBarIncrement}px`;

        // Update the display
        this.game.scoreboardElement.textContent = "Score: " + this.game.score;
    }
}

export default GameUpgrade;
