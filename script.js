const rows = 102;
const cols = 102;
let grid = createGrid(rows, cols);
let nextGrid = createGrid(rows, cols);
let interval;
let currentRuleSet = 1; // Initialize with a default rule set
let maxStates = 50; // Default value for Rule Set 3

const game = document.getElementById('game');
const ruleSetSelector = document.getElementById('rule-select');
const rule3Settings = document.getElementById('rule3-settings');
const maxStatesInput = document.getElementById('max-states');

// Create the grid
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => {
            cell.classList.toggle('alive');
            grid[row][col] = grid[row][col] ? 0 : 1;
        });
        game.appendChild(cell);
    }
}

document.getElementById('start').addEventListener('click', startGame);
document.getElementById('stop').addEventListener('click', stopGame);
document.getElementById('clear').addEventListener('click', clearGrid);
document.getElementById('random').addEventListener('click', randomizeGrid);

ruleSetSelector.addEventListener('change', function() {
    currentRuleSet = parseInt(this.value); // Update the current rule set
    updateRuleSetUI();

    if (interval) {
        stopGame();
        updateGrid(); // Ensure the grid updates immediately with the new rules
        startGame();
    } else {
        updateGrid(); // Update grid even if the game is stopped
    }
});

maxStatesInput.addEventListener('change', (e) => {
    maxStates = parseInt(e.target.value);
    if (interval) {
        stopGame();
        startGame();
    }
});

function updateRuleSetUI() {
    if (currentRuleSet === 3) {
        rule3Settings.style.display = 'block';
    } else {
        rule3Settings.style.display = 'none';
    }
}

function startGame() {
    if (interval) clearInterval(interval);
    interval = setInterval(runGame, 100);
}

function stopGame() {
    clearInterval(interval);
    interval = null;
}

function clearGrid() {
    stopGame();
    grid = createGrid(rows, cols);
    updateGrid();
}

function randomizeGrid() {
    grid = createRandomGrid(rows, cols);
    updateGrid();
}

function createGrid(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function createRandomGrid(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0).map(() => Math.random() > 0.7 ? 1 : 0));
}

function runGame() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            applyRules(row, col);
        }
    }

    // Swap grids
    [grid, nextGrid] = [nextGrid, grid];
    updateGrid();
}

function applyRules(row, col) {
    const aliveNeighbors = countAliveNeighbors(row, col);

    switch (currentRuleSet) {
        case 1:
            applyRuleSet1(row, col, aliveNeighbors);
            break;
        case 2:
            applyRuleSet2(row, col, aliveNeighbors);
            break;
        case 3:
            applyRuleSet3(row, col, aliveNeighbors);
            break;
        case 4:
            applyRuleSet4(row, col, aliveNeighbors);
            break;
        case 5:
            applyRuleSet5(row, col, aliveNeighbors);
            break;
        case 6:
            applyRuleSet6(row, col, aliveNeighbors);
            break;
        case 7:
            applyRuleSet7(row, col, aliveNeighbors);
            break;
        case 8:
            applyRuleSet8(row, col, aliveNeighbors);
            break;
        case 9:
            applyRuleSet9(row, col, aliveNeighbors);
            break;
        case 10:
            applyRuleSet10(row, col, aliveNeighbors);
            break;
        case 11:
            applyRuleSet11(row, col, aliveNeighbors);
            break;
        case 12:
            applyRuleSet12(row, col, aliveNeighbors);
            break;
        case 13:
            applyRuleSet13(row, col, aliveNeighbors);
            break;
        case 14:
            applyRuleSet14(row, col, aliveNeighbors);
            break;
        case 15:
            applyRuleSet14(row, col, aliveNeighbors);
            break;
    }
}

// Original Life (B3/S23)
function applyRuleSet1(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 1;
        }
    } else {
        if (aliveNeighbors === 3) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

// Brian's Brain
function applyRuleSet2(row, col, aliveNeighbors) {
    if (grid[row][col] === 0 && aliveNeighbors === 2) {
        nextGrid[row][col] = 1; // Turn on
    } else if (grid[row][col] === 1) {
        nextGrid[row][col] = 2; // Dying state
    } else if (grid[row][col] === 2) {
        nextGrid[row][col] = 0; // Turn off
    } else {
        nextGrid[row][col] = grid[row][col];
    }
}

// Belousov-Zhabotinsky
function applyRuleSet3(row, col, aliveNeighbors) {
    const n = maxStates; // Use the user-defined maxStates
    const g = 1; // Growth factor

    if (grid[row][col] === n) {
        nextGrid[row][col] = 0; // Infected becomes healthy
    } else if (grid[row][col] > 0 && grid[row][col] < n) {
        const avgNeighbors = getAverageNeighborState(row, col);
        nextGrid[row][col] = Math.min(n, Math.floor(avgNeighbors + g));
    } else {
        const infectedNeighbors = countInfectedNeighbors(row, col);
        nextGrid[row][col] = Math.floor(infectedNeighbors / 8 * n);
    }
}

// HighLife (B36/S23)
function applyRuleSet4(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 1;
        }
    } else {
        if (aliveNeighbors === 3 || aliveNeighbors === 6) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

// Day & Night (B3678/S34678)
function applyRuleSet5(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 1;
        }
    } else {
        if (aliveNeighbors === 3 || aliveNeighbors === 4 || aliveNeighbors === 6 || aliveNeighbors === 7 || aliveNeighbors === 8) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

// Seeds (B2/S)
function applyRuleSet6(row, col, aliveNeighbors) {
    if (grid[row][col] === 0 && aliveNeighbors === 2) {
        nextGrid[row][col] = 1; // Birth
    } else {
        nextGrid[row][col] = 0; // Death
    }
}

// 7 States with Moore Neighborhood
function applyRuleSet7(row, col, aliveNeighbors) {
    const state = grid[row][col];

    if (state === 6 || aliveNeighbors < 2) {
        nextGrid[row][col] = 0;
    } else if (aliveNeighbors === state) {
        nextGrid[row][col] = state;
    } else if (aliveNeighbors > state) {
        nextGrid[row][col] = (state + 1) % 7;
    } else {
        nextGrid[row][col] = (state - 1 + 7) % 7;
    }
}

// Diamoeba (B35678/S5678)
function applyRuleSet8(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        if (aliveNeighbors < 5 || aliveNeighbors > 8) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 1;
        }
    } else {
        if (aliveNeighbors === 3 || aliveNeighbors === 5 || aliveNeighbors === 6 || aliveNeighbors === 7 || aliveNeighbors === 8) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

// 2x2 (B36/S125)
function applyRuleSet9(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        if (aliveNeighbors < 1 || aliveNeighbors > 5) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 1;
        }
    } else {
        if (aliveNeighbors === 3 || aliveNeighbors === 6) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

// Move (B368/S245)
function applyRuleSet10(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        if (aliveNeighbors < 2 || aliveNeighbors > 5) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 1;
        }
    } else {
        if (aliveNeighbors === 3 || aliveNeighbors === 6 || aliveNeighbors === 8) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

// Amoeba (B357/S1358)
function applyRuleSet11(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        if (aliveNeighbors < 1 || aliveNeighbors > 8) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 1;
        }
    } else {
        if (aliveNeighbors === 3 || aliveNeighbors === 5 || aliveNeighbors === 7) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

// Replicator (B1357/S1357)
function applyRuleSet12(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        if (aliveNeighbors < 1 || aliveNeighbors > 7) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 1;
        }
    } else {
        if (aliveNeighbors === 1 || aliveNeighbors === 3 || aliveNeighbors === 5 || aliveNeighbors === 7) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

// 3-State Life (B2/S02-3)
function applyRuleSet13(row, col, aliveNeighbors) {
    const state = grid[row][col];

    if (state === 0) {
        if (aliveNeighbors === 2) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    } else if (state === 1) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 2;
        }
    } else if (state === 2) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 1;
        }
    }
}

// 4-State Life (B012/S0123)
function applyRuleSet14(row, col, aliveNeighbors) {
    const state = grid[row][col];

    if (state === 0) {
        if (aliveNeighbors === 1 || aliveNeighbors === 2) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    } else if (state === 1) {
        if (aliveNeighbors < 1 || aliveNeighbors > 3) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 2;
        }
    } else if (state === 2) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 3;
        }
    } else if (state === 3) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            nextGrid[row][col] = 2;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

// 5-State Life (B01234/S01234)
function applyRuleSet15(row, col, aliveNeighbors) {
    const state = grid[row][col];

    if (state === 0) {
        if (aliveNeighbors === 1 || aliveNeighbors === 2 || aliveNeighbors === 3 || aliveNeighbors === 4) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 0;
        }
    } else if (state === 1) {
        if (aliveNeighbors < 1 || aliveNeighbors > 4) {
            nextGrid[row][col] = 0;
        } else {
            nextGrid[row][col] = 2;
        }
    } else if (state === 2) {
        if (aliveNeighbors < 2 || aliveNeighbors > 4) {
            nextGrid[row][col] = 1;
        } else {
            nextGrid[row][col] = 3;
        }
    } else if (state === 3) {
        if (aliveNeighbors < 2 || aliveNeighbors > 4) {
            nextGrid[row][col] = 2;
        } else {
            nextGrid[row][col] = 4;
        }
    } else if (state === 4) {
        if (aliveNeighbors < 2 || aliveNeighbors > 4) {
            nextGrid[row][col] = 3;
        } else {
            nextGrid[row][col] = 0;
        }
    }
}

function countAliveNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = (row + i + rows) % rows;
            const newCol = (col + j + cols) % cols;
            count += grid[newRow][newCol] > 0 ? 1 : 0;
        }
    }
    return count;
}

function getAverageNeighborState(row, col) {
    let sum = 0;
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = (row + i + rows) % rows;
            const newCol = (col + j + cols) % cols;
            sum += grid[newRow][newCol];
            count++;
        }
    }
    return count > 0 ? sum / count : 0;
}

function countInfectedNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = (row + i + rows) % rows;
            const newCol = (col + j + cols) % cols;
            count += grid[newRow][newCol] > 0 ? 1 : 0;
        }
    }
    return count;
}

function getColorForState(state) {
    const colors = [
        '#FF0000', // Red
        '#FF7F00', // Orange
        '#FFFF00', // Yellow
        '#7FFF00', // Green
        '#00FFFF', // Cyan
        '#0000FF', // Blue
        '#8B00FF'  // Violet
    ];
    return colors[state % colors.length];
}

function updateGrid() {
    const cells = document.querySelectorAll('.cell');
    for (let i = 0; i < cells.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        cells[i].className = 'cell';
        if (grid[row][col] > 0) {
            if (currentRuleSet === 2 && grid[row][col] === 2) {
                cells[i].classList.add('dying');
            } else {
                cells[i].classList.add('alive');
            }

            if (currentRuleSet === 3) {
                const red = Math.floor((grid[row][col] / maxStates) * 255);
                const green = Math.floor(((grid[row][col] / maxStates) * 255)/2);
                const blue = Math.floor(((grid[row][col] / maxStates) * 255)/3);
                cells[i].style.backgroundColor = `rgb(0, ${green}, ${blue})`;
            } else if (currentRuleSet === 2 || currentRuleSet === 7 || currentRuleSet === 13 || currentRuleSet === 14 || currentRuleSet === 15) {
                cells[i].style.backgroundColor = getColorForState(grid[row][col]);
            } else {
                cells[i].style.backgroundColor = '';
            }
        } else {
            cells[i].style.backgroundColor = '';
        }
    }
}

// Initialize the UI
updateRuleSetUI();
