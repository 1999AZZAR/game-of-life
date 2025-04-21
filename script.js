// Constants and cached DOM elements
const stateSelect = document.getElementById('state-select');
const birthCheckboxes = document.querySelectorAll('input[name="b"]');
const dyingCheckboxes = document.querySelectorAll('input[name="d"]');
const survivalCheckboxes = document.querySelectorAll('input[name="s"]');
const gritSelect = document.getElementById('grit-select');
const speedSelect = document.getElementById('speed-select');
const ruleSetSelector = document.getElementById('rule-select');
const rule3Settings = document.getElementById('rule3-settings');
const rule0Settings = document.getElementById('rule0-settings');
const maxStatesInput = document.getElementById('max-states');

// Canvas setup for rendering
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Handle canvas clicks to toggle cells
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor(x / baseCellSize);
  const row = Math.floor(y / baseCellSize);
  toggleCell(row, col);
});
// Off-canvas settings panel toggle
const settingsPanel = document.getElementById('settings');
const hideBtn = document.getElementById('hide-settings');
const showBtn = document.getElementById('show-settings');
showBtn.addEventListener('click', () => {
  settingsPanel.classList.remove('-translate-x-full');
  settingsPanel.classList.add('translate-x-0');
});
hideBtn.addEventListener('click', () => {
  settingsPanel.classList.remove('translate-x-0');
  settingsPanel.classList.add('-translate-x-full');
});

let grid, nextGrid, rows, cols, interval;
let currentRuleSet = 1;
let maxStates = 50;

// Base cell size based on selection
let baseCellSize = parseInt(gritSelect.value, 10);

// Event listeners
gritSelect.addEventListener('change', updateGridDimensions);
ruleSetSelector.addEventListener('change', handleRuleSetChange);
maxStatesInput.addEventListener('change', handleMaxStatesChange);
document.getElementById('start').addEventListener('click', startGame);
document.getElementById('stop').addEventListener('click', stopGame);
document.getElementById('clear').addEventListener('click', clearGrid);
document.getElementById('random').addEventListener('click', randomizeGrid);

stateSelect.addEventListener('change', handleStateSelectChange);
birthCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateCustomRules));
dyingCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateCustomRules));
survivalCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateCustomRules));

// Initialize the game
initializeGame();

// Recompute grid & canvas on resize
window.addEventListener('resize', updateGridDimensions);

function initializeGame() {
  updateGridDimensions();
  updateRuleSetUI();
  handleStateSelectChange();
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

// Initialize grid arrays and clear canvas
function initGrid() {
  grid = createGrid(rows, cols);
  nextGrid = createGrid(rows, cols);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function toggleCell(row, col) {
  const totalStates = getTotalStates();
  if (customStateCount === 3) {
    if (grid[row][col] === 0) {
      grid[row][col] = 1; // Turn on
    } else if (grid[row][col] === 1) {
      grid[row][col] = 2; // Dying state
    } else if (grid[row][col] === 2) {
      grid[row][col] = 0; // Turn off
    }
  } else {
    grid[row][col] = (grid[row][col] + 1) % totalStates;
  }
  drawCell(row, col, grid[row][col]);
}

// Draw or clear a single cell on canvas
function drawCell(row, col, state) {
  const size = baseCellSize;
  const x = col * size, y = row * size;
  if (state === 0) {
    ctx.clearRect(x, y, size, size);
  } else {
    ctx.fillStyle = getCellColor(state);
    ctx.fillRect(x, y, size, size);
  }
}

// Draw entire grid on canvas
function drawGrid() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      drawCell(row, col, grid[row][col]);
    }
  }
}

function getCellColor(state) {
  const totalStates = getTotalStates();

  if (state === 0) return 'transparent';

  switch (currentRuleSet) {
    case 16: // Convolution Ruleset
      return `rgba(0, 0, 255, ${state})`;
    case 2: // Brian's Brain
      return state === 1 ? '#4caf50' : state === 2 ? '#ff9800' : 'transparent';
    case 3: // Belousov-Zhabotinsky
      const intensity = state / (maxStates - 1);
      return `rgba(255, 0, 0, ${intensity})`;
    case 7: // 7 States with Moore Neighborhood
      return getMultiStateColor(state, 7);
    default:
      if (customStateCount === 2) {
        return state === 1 ? '#4caf50' : 'transparent';
      } else if (customStateCount === 3) {
        return state === 1 ? '#4caf50' : state === 2 ? '#ff9800' : 'transparent';
      } else {
        return getMultiStateColor(state, totalStates);
      }
  }
}

function getMultiStateColor(state, totalStates) {
  const hue = ((state - 1) / (totalStates - 1)) * 360;
  return `hsl(${hue}, 100%, 50%)`;
}

function getTotalStates() {
  switch (currentRuleSet) {
    case 2: return 3; // Brian's Brain
    case 3: return maxStates; // Belousov-Zhabotinsky
    case 7: return 7; // 7 States with Moore Neighborhood
    case 16: return 2; // Convolution Ruleset (assuming binary states)
    default: return customStateCount || 2; // Custom rules or default to binary
  }
}

function handleStateSelectChange() {
  customStateCount = parseInt(stateSelect.value, 10);
  document.getElementById('dying-states').style.display = customStateCount === 3 ? 'block' : 'none';
}

function createGrid(rows, cols) {
  return new Array(rows).fill(null).map(() => new Array(cols).fill(0));
}

function startGame() {
  if (interval) cancelAnimationFrame(interval);
  const speeds = { fast: 60, normal: 30, slow: 10, 'really-slow': 1 };
  let lastTime = performance.now();
  function loop(now) {
    const targetFps = speeds[speedSelect.value] || 30;
    const intervalMs = 1000 / targetFps;
    if (now - lastTime >= intervalMs) {
      runGame();
      lastTime = now;
    }
    interval = requestAnimationFrame(loop);
  }
  interval = requestAnimationFrame(loop);
}

function stopGame() {
  cancelAnimationFrame(interval);
  interval = null;
}

function clearGrid() {
  stopGame();
  grid = createGrid(rows, cols);
  drawGrid();
}

function randomizeGrid() {
  const totalStates = getTotalStates();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = Math.floor(Math.random() * totalStates);
    }
  }
  drawGrid();
}

function runGame() {
  const changed = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      applyRules(row, col);
      if (nextGrid[row][col] !== grid[row][col]) changed.push({ row, col, state: nextGrid[row][col] });
    }
  }
  [grid, nextGrid] = [nextGrid, grid];
  changed.forEach(({ row, col, state }) => drawCell(row, col, state));
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
  customDyingRules.clear();
  customSurvivalRules.clear();

  if (customStateCount === 3) {
    dyingCheckboxes.forEach(checkbox => {
      if (checkbox.checked && checkbox.value !== 'none') {
        customDyingRules.add(parseInt(checkbox.value));
      }
    });
  }

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
  if (customStateCount === 2) {
    if (grid[row][col] === 1) {
      nextGrid[row][col] = customSurvivalRules.has(aliveNeighbors) ? 1 : 0;
    } else {
      nextGrid[row][col] = customBirthRules.has(aliveNeighbors) ? 1 : 0;
    }
  } else if (customStateCount === 3) {
    if (grid[row][col] === 1) {
      nextGrid[row][col] = customSurvivalRules.has(aliveNeighbors) ? 1 : 2;
    } else if (grid[row][col] === 2) {
      nextGrid[row][col] = customDyingRules.has(aliveNeighbors) ? 2 : 0;
    } else {
      nextGrid[row][col] = customBirthRules.has(aliveNeighbors) ? 1 : 0;
    }
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
    const filterInputs = document.querySelectorAll('#convolution-filter input');
    const filterValues = Array.from(filterInputs).map(input => parseFloat(input.value) || 0);
    const randomMin = parseFloat(document.getElementById('random-min').value);
    const randomMax = parseFloat(document.getElementById('random-max').value);
    const halfKernel = Math.floor(kernelSize / 2);
    let sum = 0;

    for (let i = -halfKernel; i <= halfKernel; i++) {
        for (let j = -halfKernel; j <= halfKernel; j++) {
            const neighborRow = (row + i + rows) % rows;
            const neighborCol = (col + j + cols) % cols;
            const filterIndex = (i + halfKernel) * kernelSize + (j + halfKernel);
            sum += grid[neighborRow][neighborCol] * (filterValues[filterIndex] || 1);
        }
    }

    const average = sum / (kernelSize * kernelSize);
    const randomValue = Math.random() * (randomMax - randomMin) + randomMin;
    nextGrid[row][col] = Math.min(1, Math.max(0, average + randomValue));
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

function updateGridDimensions() {
  baseCellSize = parseInt(gritSelect.value, 10);
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  // Set canvas resolution
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Compute grid dimensions to fill area
  cols = Math.ceil(width / baseCellSize);
  rows = Math.ceil(height / baseCellSize);
  document.documentElement.style.setProperty('--grid-size', `${baseCellSize}px`);
  document.documentElement.style.setProperty('--cell-size', `${baseCellSize}px`);
  document.documentElement.style.setProperty('--grit-cols', `${cols}`);
  document.documentElement.style.setProperty('--grit-rows', `${rows}`);
  initGrid();
  drawGrid();
}
