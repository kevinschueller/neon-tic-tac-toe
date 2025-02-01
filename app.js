const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const xScoreEl = document.querySelector('.x-score .score-value');
const oScoreEl = document.querySelector('.o-score .score-value');
const drawsEl = document.querySelector('.draws .score-value');

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { X: 0, O: 0, draws: 0 };

// Initialize scores from localStorage
if (localStorage.getItem('ticTacToeScores')) {
  scores = JSON.parse(localStorage.getItem('ticTacToeScores'));
  updateScoresDisplay();
}

const winCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, type = 'sine') {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
}

function createConfetti() {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    document.querySelector('.particles').appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3000);
  }
}

function updateScoresDisplay() {
  xScoreEl.textContent = scores.X;
  oScoreEl.textContent = scores.O;
  drawsEl.textContent = scores.draws;
  localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

function handleClick(e) {
  const index = parseInt(e.target.dataset.index);
  
  if (gameBoard[index] !== '' || !gameActive) return;
  
  gameBoard[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(`${currentPlayer.toLowerCase()}-mark`);
  e.target.disabled = true;
  
  playSound(currentPlayer === 'X' ? 440 : 880);
  
  if (checkWin()) {
    status.textContent = `PLAYER ${currentPlayer} WINS!`;
    status.style.background = `linear-gradient(45deg, ${currentPlayer === 'X' ? 'var(--neon-blue)' : 'var(--neon-pink)'}, rgba(255,255,255,0.2))`;
    status.style.textShadow = `0 0 15px ${currentPlayer === 'X' ? 'var(--neon-blue)' : 'var(--neon-pink)'}`;
    gameActive = false;
    scores[currentPlayer]++;
    createConfetti();
    playSound(659, 'square');
    updateScoresDisplay();
    return;
  }
  
  if (checkDraw()) {
    status.textContent = "GAME DRAW!";
    status.style.background = 'rgba(255,255,255,0.1)';
    gameActive = false;
    scores.draws++;
    updateScoresDisplay();
    return;
  }
  
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  status.textContent = `PLAYER ${currentPlayer}'S TURN`;
  status.style.background = 'rgba(255,255,255,0.05)';
}

function checkWin() {
  return winCombos.some(combo => {
    if (combo.every(index => gameBoard[index] === currentPlayer)) {
      combo.forEach(index => cells[index].classList.add('winning-cell'));
      return true;
    }
    return false;
  });
}

function checkDraw() {
  return gameBoard.every(cell => cell !== '');
}

function resetGame() {
  gameBoard = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';
  status.textContent = `PLAYER ${currentPlayer}'S TURN`;
  status.style.background = 'rgba(255,255,255,0.05)';
  status.style.textShadow = 'none';
  
  cells.forEach(cell => {
    cell.textContent = '';
    cell.disabled = false;
    cell.classList.remove('x-mark', 'o-mark', 'winning-cell');
  });
  
  document.querySelector('.particles').innerHTML = '';
}

resetBtn.addEventListener('dblclick', () => {
  if (confirm('Reset all scores?')) {
    scores = { X: 0, O: 0, draws: 0 };
    updateScoresDisplay();
  }
});

cells.forEach(cell => cell.addEventListener('click', handleClick));
resetBtn.addEventListener('click', resetGame);
