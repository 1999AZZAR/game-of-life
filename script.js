// Constants and cached DOM elements
const GRID_SIZES = [
  { rows: 51, cols: 51, gridSize: 12, cellSize: 11.9 },
  { rows: 102, cols: 102, gridSize: 6, cellSize: 5.9 },
  { rows: 204, cols: 204, gridSize: 3, cellSize: 2.9 }
];

const birthCheckboxes = document.querySelectorAll('input[name="b"]');
const survivalCheckboxes = document.querySelectorAll('input[name="s"]');

let customBirthRules = new Set();
let customSurvivalRules = new Set();

const game = document.getElementById('game');
const gritSelect = document.getElementById('grit-select');
const ruleSetSelector = document.getElementById('rule-select');
const rule3Settings = document.getElementById('rule3-settings');
const rule0Settings = document.getElementById('rule0-settings');
const maxStatesInput = document.getElementById('max-states');

let grid, nextGrid, rows, cols, interval;
let currentRuleSet = 1;
let maxStates = 50;

// Event listeners
gritSelect.addEventListener('change', handleGritChange);
ruleSetSelector.addEventListener('change', handleRuleSetChange);
maxStatesInput.addEventListener('change', handleMaxStatesChange);
document.getElementById('start').addEventListener('click', startGame);
document.getElementById('stop').addEventListener('click', stopGame);
document.getElementById('clear').addEventListener('click', clearGrid);
document.getElementById('random').addEventListener('click', randomizeGrid);

birthCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateCustomRules));
survivalCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateCustomRules));


const cellShapeSelect = document.getElementById('cell-shape-select');
cellShapeSelect.addEventListener('change', updateCellShape);

function updateCellShape() {
    const shape = cellShapeSelect.value;
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (shape === 'circle') {
            cell.style.borderRadius = '50%';
        } else {
            cell.style.borderRadius = '0'; // Square shape
        }
    });
}

// Initialize the game
initializeGame();

function initializeGame() {
  handleGritChange();
  updateRuleSetUI();
  updateCellShape();
}

function handleGritChange() {
  const { rows: newRows, cols: newCols, gridSize, cellSize } = GRID_SIZES[gritSelect.value - 1];
  rows = newRows;
  cols = newCols;

  document.documentElement.style.setProperty('--grid-size', `${gridSize}px`);
  document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
  document.documentElement.style.setProperty('--grit-cols', `${cols}`);
  document.documentElement.style.setProperty('--grit-rows', `${rows}`);

  createAndUpdateGrid();
}

function handleRuleSetChange() {
  currentRuleSet = parseInt(ruleSetSelector.value, 10);
  updateRuleSetUI();
  if (interval) {
    stopGame();
    updateGrid();
    startGame();
  } else {
    updateGrid();
  }
}

function handleMaxStatesChange() {
  maxStates = parseInt(maxStatesInput.value, 10);
  if (interval) {
    stopGame();
    startGame();
  }
}

function createAndUpdateGrid() {
    const fragment = document.createDocumentFragment();
    grid = createGrid(rows, cols);
    nextGrid = createGrid(rows, cols);

    game.innerHTML = '';

    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => toggleCell(Math.floor(i / cols), i % cols));
        fragment.appendChild(cell);
    }

    game.appendChild(fragment);
    updateCellShape();
    updateGrid();
}


function toggleCell(row, col) {
  const totalStates = getTotalStates();
  grid[row][col] = (grid[row][col] + 1) % totalStates;
  updateCell(row, col);
}

function updateCell(row, col) {
  const cellIndex = row * cols + col;
  const cellElement = game.children[cellIndex];
  cellElement.style.backgroundColor = getCellColor(grid[row][col]);
}

function getCellColor(state) {
  const totalStates = getTotalStates();

  if (state === 0) return 'transparent';

  if (currentRuleSet === 16) {
    return `rgba(0, 0, 255, ${state})`; // Blue color with varying intensity
  } else if (totalStates === 2) {
    return '#4caf50';
  } else if (currentRuleSet === 3) {
    const intensity = state / (maxStates - 1);
    return `rgba(255, 0, 0, ${intensity})`;
  } else {
    const hue = (state - 1) * (360 / (totalStates - 1));
    return `hsl(${hue}, 100%, 50%)`;
  }
}

function getTotalStates() {
  switch (currentRuleSet) {
    case 2: return 3; // Brian's Brain
    case 3: return maxStates; // Belousov-Zhabotinsky
    case 7: return 7; // 7 States with Moore Neighborhood
    default: return 2; // All other rules use 2 states
  }
}

function createGrid(rows, cols) {
  return new Array(rows).fill(null).map(() => new Array(cols).fill(0));
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
  const totalStates = getTotalStates();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = Math.floor(Math.random() * totalStates);
    }
  }
  updateGrid();
}

function runGame() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      applyRules(row, col);
    }
  }

  [grid, nextGrid] = [nextGrid, grid];
  updateGrid();
}

function applyRules(row, col) {
  const aliveNeighbors = countAliveNeighbors(row, col);
  const ruleFunctions = [
    applyCustomRules,
    applyRuleSet1, applyRuleSet2, applyRuleSet3, applyRuleSet4,
    applyRuleSet5, applyRuleSet6, applyRuleSet7, applyRuleSet8,
    applyRuleSet9, applyRuleSet10, applyRuleSet11, applyRuleSet12,
    applyRuleSet13, applyRuleSet14, applyRuleSet15, applyConvolutionRuleset
  ];

  ruleFunctions[currentRuleSet](row, col, aliveNeighbors);
}

// custom rules
function updateCustomRules() {
  customBirthRules.clear();
  customSurvivalRules.clear();

  birthCheckboxes.forEach(checkbox => {
    if (checkbox.checked && checkbox.value !== 'none') {
      customBirthRules.add(parseInt(checkbox.value));
    }
  });

  survivalCheckboxes.forEach(checkbox => {
    if (checkbox.checked && checkbox.value !== 'none') {
      customSurvivalRules.add(parseInt(checkbox.value));
    }
  });
}

// apply custom rules
function applyCustomRules(row, col, aliveNeighbors) {
  if (grid[row][col] === 1) {
    nextGrid[row][col] = customSurvivalRules.has(aliveNeighbors) ? 1 : 0;
  } else {
    nextGrid[row][col] = customBirthRules.has(aliveNeighbors) ? 1 : 0;
  }
}

// Original Life (B3/S23)
function applyRuleSet1(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        nextGrid[row][col] = (aliveNeighbors < 2 || aliveNeighbors > 3) ? 0 : 1;
    } else {
        nextGrid[row][col] = (aliveNeighbors === 3) ? 1 : 0;
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
        nextGrid[row][col] = Math.floor((infectedNeighbors / 8) * n);
    }
}

// HighLife (B36/S23)
function applyRuleSet4(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        nextGrid[row][col] = (aliveNeighbors < 2 || aliveNeighbors > 3) ? 0 : 1;
    } else {
        nextGrid[row][col] = (aliveNeighbors === 3 || aliveNeighbors === 6) ? 1 : 0;
    }
}

// Day & Night (B3678/S34678)
function applyRuleSet5(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        nextGrid[row][col] = (aliveNeighbors < 2 || aliveNeighbors > 3) ? 0 : 1;
    } else {
        nextGrid[row][col] = (aliveNeighbors === 3 || aliveNeighbors === 4 || aliveNeighbors === 6 || aliveNeighbors === 7 || aliveNeighbors === 8) ? 1 : 0;
    }
}

// Seeds (B2/S)
function applyRuleSet6(row, col, aliveNeighbors) {
    nextGrid[row][col] = (grid[row][col] === 0 && aliveNeighbors === 2) ? 1 : 0;
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

// Mazectric (B3/S12345)
function applyRuleSet8(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        nextGrid[row][col] = (aliveNeighbors < 1 || aliveNeighbors > 5) ? 0 : 1;
    } else {
        nextGrid[row][col] = (aliveNeighbors === 3) ? 1 : 0;
    }
}

// 5-Neighbor Life (Von Neumann)
function applyRuleSet9(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        nextGrid[row][col] = (aliveNeighbors < 2 || aliveNeighbors > 3) ? 0 : 1;
    } else {
        nextGrid[row][col] = (aliveNeighbors === 3) ? 1 : 0;
    }
}

// Amoeba (B357/S1358)
function applyRuleSet10(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        nextGrid[row][col] = (aliveNeighbors < 1 || aliveNeighbors > 5) ? 0 : 1;
    } else {
        nextGrid[row][col] = (aliveNeighbors === 3 || aliveNeighbors === 5 || aliveNeighbors === 7) ? 1 : 0;
    }
}

// SnowLife (B367/S235678)
function applyRuleSet11(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        nextGrid[row][col] = (aliveNeighbors < 2 || aliveNeighbors > 3) ? 0 : 1;
    } else {
        nextGrid[row][col] = (aliveNeighbors === 3 || aliveNeighbors === 6 || aliveNeighbors === 7) ? 1 : 0;
    }
}

// FishFood (B2/S12)
function applyRuleSet12(row, col, aliveNeighbors) {
    nextGrid[row][col] = (grid[row][col] === 0 && aliveNeighbors === 2) || (grid[row][col] === 1 && aliveNeighbors >= 1 && aliveNeighbors <= 2) ? 1 : 0;
}

// Life Without Death (B3/S012345678)
function applyRuleSet13(row, col, aliveNeighbors) {
    if (grid[row][col] === 0) {
        nextGrid[row][col] = (aliveNeighbors === 3) ? 1 : 0;
    } else {
        nextGrid[row][col] = 1; // Cells never die
    }
}

// Coral (B3/S45678)
function applyRuleSet14(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        nextGrid[row][col] = (aliveNeighbors < 4 || aliveNeighbors > 8) ? 0 : 1;
    } else {
        nextGrid[row][col] = (aliveNeighbors === 3) ? 1 : 0;
    }
}

// Replicator (B1357/S1357)
function applyRuleSet15(row, col, aliveNeighbors) {
    if (grid[row][col] === 1) {
        nextGrid[row][col] = (aliveNeighbors % 2 === 0) ? 0 : 1;
    } else {
        nextGrid[row][col] = (aliveNeighbors % 2 !== 0) ? 1 : 0;
    }
}

function applyConvolutionRuleset(row, col) {
    const kernelSize = parseInt(document.getElementById('convolution-kernel').value, 10);
    const halfKernel = Math.floor(kernelSize / 2);
    let sum = 0;

    for (let i = -halfKernel; i <= halfKernel; i++) {
        for (let j = -halfKernel; j <= halfKernel; j++) {
            const neighborRow = (row + i + rows) % rows;
            const neighborCol = (col + j + cols) % cols;
            sum += grid[neighborRow][neighborCol];
        }
    }

    const average = sum / (kernelSize * kernelSize);
    nextGrid[row][col] = average;
}
function getAverageNeighborState(row, col) {
    let sum = 0;
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const neighborRow = row + i;
            const neighborCol = col + j;
            if (neighborRow >= 0 && neighborRow < rows && neighborCol >= 0 && neighborCol < cols) {
                sum += grid[neighborRow][neighborCol];
                count++;
            }
        }
    }
    return count > 0 ? sum / count : 0;
}

function countInfectedNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const neighborRow = row + i;
            const neighborCol = col + j;
            if (neighborRow >= 0 && neighborRow < rows && neighborCol >= 0 && neighborCol < cols) {
                if (grid[neighborRow][neighborCol] > 0 && grid[neighborRow][neighborCol] < maxStates) {
                    count++;
                }
            }
        }
    }
    return count;
}

function updateRuleSetUI() {
  rule3Settings.style.display = currentRuleSet === 3 ? 'block' : 'none';
  rule0Settings.style.display = currentRuleSet === 0 ? 'block' : 'none';
  document.getElementById('convolution-settings').style.display = currentRuleSet === 16 ? 'block' : 'none';
}

function countAliveNeighbors(row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const neighborRow = (row + i + rows) % rows;
      const neighborCol = (col + j + cols) % cols;
      count += grid[neighborRow][neighborCol] === 1 ? 1 : 0;
    }
  }
  return count;
}

function updateGrid() {
  const cells = game.children;
  for (let i = 0; i < rows * cols; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    cells[i].style.backgroundColor = getCellColor(grid[row][col]);
  }
}
