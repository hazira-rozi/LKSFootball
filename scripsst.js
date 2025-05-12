const p1 = document.getElementById('player1');
const p2 = document.getElementById('player2');
const ball = document.getElementById('ball');
const playBtn = document.getElementById('playBtn');
const playerName = document.getElementById('playerName');
const gameArea = document.getElementById('gameArea');
const welcome = document.getElementById('welcome');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const gameOverPopup = document.getElementById('gameOver');
const resultText = document.getElementById('resultText');

let vx = 3, vy = 2;
let timer = 30, interval, score1 = 0, score2 = 0;
let freeze = false;

const bgm = new Audio('assets/audio/bgm.mp3');
bgm.loop = true;

playerName.addEventListener('input', () => {
  playBtn.disabled = playerName.value.trim() === '';
});

playBtn.onclick = () => {
  startGame();
};

function startGame() {
  welcome.classList.add('hidden');
  gameArea.classList.remove('hidden');
  bgm.play();

  const c1 = document.getElementById('country1').value;
  const c2 = document.getElementById('country2').value;
  const ballType = document.querySelector('input[name="ball"]:checked')?.value || 'ball1';
  const level = document.querySelector('input[name="level"]:checked')?.value || 'easy';

  p1.style.backgroundImage = `url('assets/img/characters/${c1}.png')`;
  p2.style.backgroundImage = `url('assets/img/characters/${c2}.png')`;
  ball.style.backgroundImage = `url('assets/img/${ballType}.png')`;

  // Set timer berdasarkan level
  timer = level === 'easy' ? 30 : level === 'medium' ? 20 : 15;
  timerEl.textContent = `Time: ${timer}`;
  
  // Mulai game loop
  interval = setInterval(gameLoop, 1000 / 60); // Update game loop setiap frame
  setInterval(updateTimer, 1000); // Update timer setiap detik
  setInterval(spawnItem, 5000); // Spawn item setiap 5 detik
}

function updateTimer() {
  timer--;
  timerEl.textContent = `Time: ${timer}`;
  if (timer <= 0) {
    clearInterval(interval);
    gameOver();
  }
}

function gameOver() {
  gameArea.classList.add('hidden');
  gameOverPopup.classList.remove('hidden');
  resultText.textContent = `Final Score: ${score1} - ${score2}`;
}

function gameLoop() {
  if (freeze) return;

  let x = ball.offsetLeft + vx;
  let y = ball.offsetTop + vy;

  if (x <= 0 || x >= 960) vx = -vx;
  if (y <= 0 || y >= 500) vy = -vy;

  ball.style.left = x + 'px';
  ball.style.top = y + 'px';

  document.querySelectorAll('.item').forEach(item => {
    const b = ball.getBoundingClientRect();
    const i = item.getBoundingClientRect();
    if (isCollide(b, i)) {
      applyItemEffect(item.dataset.type);
      item.remove();
    }
  });
}

function isCollide(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function spawnItem() {
  const item = document.createElement('div');
  item.className = 'item';
  const types = ['increase', 'decrease', 'freeze'];
  const type = types[Math.floor(Math.random() * types.length)];
  item.dataset.type = type;
  item.style.left = Math.random() * 960 + 'px';
  item.style.top = '50px';
  item.style.backgroundImage = `url('assets/img/items/${type}.png')`;
  document.querySelector('.field').appendChild(item);
}

function applyItemEffect(type) {
  const sound = new Audio('assets/audio/item.wav');
  sound.play();

  if (type === 'increase') {
    ball.style.width = '60px';
    ball.style.height = '60px';
  } else if (type === 'decrease') {
    ball.style.width = '25px';
    ball.style.height = '25px';
  } else if (type === 'freeze') {
    freeze = true;
    ball.style.opacity = 0.5;
    const freezeSound = new Audio('assets/audio/freeze.wav');
    freezeSound.play();
    setTimeout(() => {
      freeze = false;
      ball.style.opacity = 1;
    }, 3000);
  }
}

document.getElementById('saveScore').onclick = () => {
  const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  history.push({
    player: playerName.value,
    score: `${score1} - ${score2}`,
    date: new Date().toISOString()
  });
  localStorage.setItem('matchHistory', JSON.stringify(history));
  alert('Score saved!');
};
