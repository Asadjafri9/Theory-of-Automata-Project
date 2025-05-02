let tape = [];
let transitions = [];
let tempChar = '';
let currentState = 0;
let stepCount = 0;
let animationSpeed = 500; // Default speed in milliseconds
let currentInterval = null; // To store the current interval

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const welcomeAnimation = document.getElementById('welcomeAnimation');
    const mainInterface = document.getElementById('mainInterface');
    const speedSelect = document.getElementById('speed');

    startButton.addEventListener('click', () => {
        welcomeAnimation.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => {
            welcomeAnimation.style.display = 'none';
            mainInterface.style.display = 'block';
            mainInterface.style.animation = 'fadeIn 0.5s ease forwards';
        }, 500);
    });

    // Update speed when selection changes
    speedSelect.addEventListener('change', (e) => {
        setSpeed(parseInt(e.target.value));
    });
});

function setSpeed(speed) {
    animationSpeed = speed;
    // If machine is running, update the interval
    if (currentInterval) {
        clearInterval(currentInterval);
        currentInterval = setInterval(runStep, animationSpeed);
    }
}

function startTuringMachine() {
    const input = document.getElementById('inputString').value;
    if (!input) {
        updateStatus('Please enter a string', 'error');
        return;
    }
    
    if (!/^[ab]*$/.test(input)) {
        updateStatus('Only characters "a" and "b" are allowed', 'error');
        return;
    }

    // Clear any existing interval
    if (currentInterval) {
        clearInterval(currentInterval);
    }

    tape = ['#', ...input.split(''), '#'];
    transitions = [];
    currentState = 0;
    stepCount = 0;
    updateStepCounter();
    updateStatus('Processing...', 'processing');
    runMachine();
}

function updateStatus(message, type = 'info') {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
}

function updateStepCounter() {
  const stepCounter = document.getElementById('stepCounter');
  stepCounter.textContent = `Steps: ${stepCount}`;
}

function updateStateDisplay(state) {
  const stateDisplay = document.getElementById('currentState');
  if (stateDisplay) {
    stateDisplay.textContent = `State: q${state}`;
  }
}

function runMachine() {
    let tracker = 1;
    let state = 0;

    currentInterval = setInterval(() => {
        stepCount++;
        updateStepCounter();
        updateStateDisplay(state);
        
        switch (state) {
            case 0:
                if (tape[tracker] !== '#') {
                    addTransition(0, 0, 'R', tape[tracker], tape[tracker]);
                    tracker++;
                } else {
                    addTransition(0, 1, 'L', '#', '#');
                    tracker--;
                    state = 1;
                }
                break;

            case 1:
                if (tape[tracker] === 'X') {
                    addTransition(1, 1, 'L', 'X', 'X');
                    tracker--;
                } else if (tape[tracker] === '#') {
                    addTransition(1, 4, 'R', '#', '#');
                    tracker++;
                    state = 5;
                } else if (tape[tracker] === 'a' || tape[tracker] === 'b') {
                    tempChar = tape[tracker];
                    tape[tracker] = 'X';
                    addTransition(1, tempChar === 'a' ? 2 : 4, 'R', 'X', tempChar);
                    tracker++;
                    state = tempChar === 'a' ? 2 : 4;
                }
                break;

            case 2: 
            case 4: 
                while (tape[tracker] !== '#') tracker++;
                tape[tracker] = tempChar;
                tape.push('#');
                addTransition(state, 3, 'L', '#', tempChar);
                tracker--;
                state = 3;
                break;

            case 3:
                while (tape[tracker] !== 'X') tracker--;
                addTransition(3, 1, 'L', 'X', 'X');
                tracker--;
                state = 1;
                break;

            case 5:
                displayTape(tracker);
                displayTransitions();
                updateStatus('String reversed successfully!', 'success');
                clearInterval(currentInterval);
                currentInterval = null;
                break;
        }

        displayTape(tracker);
    }, animationSpeed);
}

function addTransition(from, to, dir, newChar, oldChar) {
  transitions.push({ from, to, dir, newChar, oldChar });
}

function displayTape(tracker) {
  const container = document.getElementById('tapeContainer');
  container.innerHTML = '';
  for (let i = 0; i < tape.length; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    if (i === tracker) cell.classList.add('current');
    cell.textContent = tape[i];
    container.appendChild(cell);
  }
}

function displayTransitions() {
  const table = document.getElementById('transitionTable');
  table.innerHTML = '<h2>Transition Table</h2>';
  transitions.forEach(t => {
    table.innerHTML += `
      <p><strong>q${t.from}</strong> ➜ <strong>q${t.to}</strong> | 
      ${t.oldChar} → ${t.newChar} , ${t.dir}</p>
    `;
  });
}
