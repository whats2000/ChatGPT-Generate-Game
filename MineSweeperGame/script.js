/**
 * Class representing a Minesweeper game.
 */
class Minesweeper {
    /**
     * Create a Minesweeper game.
     * @param {number} rows - Number of rows in the board.
     * @param {number} cols - Number of columns in the board.
     * @param {number} mines - Number of mines in the board.
     */
    constructor(rows, cols, mines) {
        /** @private {number} */
        this.rows = rows; // Number of rows
        /** @private {number} */
        this.cols = cols; // Number of columns
        /** @private {number} */
        this.mines = mines; // Number of mines
        /** @private {boolean} */
        this.gameOver = false;  // Flag to track if the game is over
        /** @private {Array<Array<number>>} */
        this.board = []; // The game board
        // Initialize count of revealed squares
        /** @private {number} */
        this.revealedCount = 0;
        /** @private {HTMLElement} */
        this.table = document.getElementById('board'); // HTML table element for the board

        this.initBoard();
        this.renderBoard();
    }

    /**
     * Reset the game by reinitializing the board and game state.
     * @private
     */
    resetGame() {
        // Clear existing board
        this.board = [];
        this.table.innerHTML = '';

        // Reset revealed count
        this.revealedCount = 0;

        // Reset game-over flag
        this.gameOver = false;

        // Initialize new board and render it
        this.initBoard();
        this.renderBoard();
    }

    /**
     * Initialize the game board with zeros and place mines randomly.
     * @private
     */
    initBoard() {
        // Initialize board with zeros
        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(0);
            }
            this.board.push(row);
        }

        // Randomly place mines
        let placedMines = 0;
        while (placedMines < this.mines) {
            const x = Math.floor(Math.random() * this.rows);
            const y = Math.floor(Math.random() * this.cols);
            if (this.board[x][y] === 0) {
                this.board[x][y] = 2;
                placedMines++;
            }
        }
    }

    /**
     * Render the HTML table based on the board array.
     * @private
     */
    renderBoard() {
        for (let i = 0; i < this.rows; i++) {
            const tableRow = document.createElement('tr');
            for (let j = 0; j < this.cols; j++) {
                const tableCell = document.createElement('td');
                tableCell.className = 'dark-gray';
                tableCell.addEventListener('click', () => this.handleLeftClick(i, j));
                tableCell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(i, j, tableCell);
                });
                // Add middle-click event
                tableCell.addEventListener('mousedown', (e) => {
                    if (e.button === 1) {  // Middle click
                        e.preventDefault();
                        this.handleMiddleClick(i, j);
                    }
                });
                tableRow.appendChild(tableCell);
            }
            this.table.appendChild(tableRow);
        }
    }

    /**
     * Handle the left-click event on a cell.
     * @private
     * @param {number} x - The row index of the clicked cell.
     * @param {number} y - The column index of the clicked cell.
     */
    handleLeftClick(x, y) {
        // If the game is over, reset it before doing anything else
        if (this.gameOver) {
            this.resetGame();
            return;
        }

        const tableRow = this.table.rows[x];
        const tableCell = tableRow.cells[y];

        // Skip if the cell is flagged.
        if (tableCell.className === 'red') return;

        // If it's a bomb, end the game.
        if (this.board[x][y] === 2) {
            tableCell.className = 'yellow';
            this.showModal('Game Over');  // Show modal
            this.gameOver = true;  // Set game-over flag
            return;
        }

        // Reveal the square
        this.revealSquare(x, y);

        // Check for a win
        if (this.revealedCount === (this.rows * this.cols) - this.mines) {
            this.showModal('You Win!');  // Show modal
            this.gameOver = true;  // Set game-over flag
        }
    }

    /**
     * Reveal a square and its adjacent squares if it's empty.
     * @private
     * @param {number} x - The row index.
     * @param {number} y - The column index.
     */
    revealSquare(x, y) {
        if (x < 0 || x >= this.rows || y < 0 || y >= this.cols) return;

        const tableRow = this.table.rows[x];
        const tableCell = tableRow.cells[y];

        if (tableCell.className !== 'dark-gray') return;  // Already revealed or flagged

        // Count adjacent mines
        let mineCount = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const newX = x + dx, newY = y + dy;
                if (newX >= 0 && newX < this.rows && newY >= 0 && newY < this.cols) {
                    if (this.board[newX][newY] === 2) mineCount++;
                }
            }
        }

        if (mineCount > 0) {
            tableCell.textContent = `${mineCount}`;
            tableCell.className = 'light-gray';
        } else {
            tableCell.className = 'light-gray';
            // Recursively reveal adjacent squares
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    this.revealSquare(x + dx, y + dy);
                }
            }
        }

        this.revealedCount++;
    }

    /**
     * Handle the right-click event on a cell.
     * @private
     * @param {number} x - The row index of the clicked cell.
     * @param {number} y - The column index of the clicked cell.
     * @param {HTMLElement} tableCell - The clicked HTML cell element.
     */
    handleRightClick(x, y, tableCell) {
        // If the game is over, reset it before doing anything else
        if (this.gameOver) {
            this.resetGame();
            return;
        }

        if (tableCell.className === 'dark-gray') {
            tableCell.className = 'red';
        } else if (tableCell.className === 'red') {
            tableCell.className = 'dark-gray';
        }
    }

    /**
     * Handle the middle-click event on a cell.
     * @private
     * @param {number} x - The row index of the clicked cell.
     * @param {number} y - The column index of the clicked cell.
     */
    handleMiddleClick(x, y) {
        const tableRow = this.table.rows[x];
        const tableCell = tableRow.cells[y];

        // Count adjacent flags
        let flagCount = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const newX = x + dx, newY = y + dy;
                if (newX >= 0 && newX < this.rows && newY >= 0 && newY < this.cols) {
                    const adjacentCell = this.table.rows[newX].cells[newY];
                    if (adjacentCell.className === 'red') {
                        flagCount++;
                    }
                }
            }
        }

        // If the count of adjacent flags matches the number in the cell, reveal adjacent cells
        if (parseInt(tableCell.textContent, 10) === flagCount) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const newX = x + dx, newY = y + dy;
                    if (newX >= 0 && newX < this.rows && newY >= 0 && newY < this.cols) {
                        const adjacentCell = this.table.rows[newX].cells[newY];
                        if (adjacentCell.className !== 'red') {  // Skip flagged cells
                            this.handleLeftClick(newX, newY);
                        }

                        if (this.gameOver) return;
                    }
                }
            }
        }
    }

    /**
     * Show a modal popup with a message.
     * @private
     * @param {string} message - The message to display.
     */
    showModal(message) {
        const modal = document.getElementById('myModal');
        const span = document.getElementsByClassName('close')[0];
        const modalText = document.getElementById('modalText');

        modalText.innerHTML = message;
        modal.style.display = 'block';

        span.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
}

// Initialize the Minesweeper game with 16 rows, 16 columns, and 40 mines.
new Minesweeper(16, 16, 40);
