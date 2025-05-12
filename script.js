const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const ball = document.getElementById('ball');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const gameArea = document.getElementById('gameArea');
const welcome = document.getElementById('welcome');
const resultText = document.getElementById('resultText');
const playBtn = document.getElementById('playBtn');
const playerName = document.getElementById('playerName');
const gameOverPopup = document.getElementById('gameOver');
let welcomeStarted = false;
let score1 = 0, score2 = 0, timer = 30, freeze = false;
let gameInterval, timerInterval, itemInterval;
let ballX = 480, ballY = 100, ballVX = 3, ballVY = 2;
let p1X = 100, p1Y = 0, p2X = 800, p2Y = 0;
let p1VY = 0, p2VY = 0;
const gravity = 0.5;
const floorY = 500;

// Audio
const bgm = new Audio('assets/audio/bgm.mp3');
const bg_welcome = new Audio('assets/audio/welcome.mp3')
const goalSFX = new Audio('assets/audio/goal.wav');
const itemSFX = new Audio('assets/audio/item.wav');
const freezeSFX = new Audio('assets/audio/freeze.wav');

document.addEventListener('click', () => {
  if (!welcomeStarted) {
    bg_welcome.play().catch(() => {});
    welcomeStarted = true;
  }
});
playerName.addEventListener('input', () => {
  playBtn.disabled = playerName.value.trim() === '';
});

playBtn.onclick = () => {
  bg_welcome.pause();
  bg_welcome.currentTime = 0;
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

  player1.style.backgroundImage = `url('assets/img/characters/${c1}.png')`;
  player2.style.backgroundImage = `url('assets/img/characters/${c2}.png')`;
  player2.style.transform = 'scaleX(-1)';
  ball.style.backgroundImage = `url('assets/img/${ballType}.png')`;

  timer = level === 'easy' ? 30 : level === 'medium' ? 20 : 15;
  timerEl.textContent = `Time: ${timer}`;
  resetPositions();

  gameInterval = setInterval(gameLoop, 1000 / 60);
  timerInterval = setInterval(updateTimer, 1000);
  itemInterval = setInterval(spawnItem, 5000);
}

function resetPositions() {
  p1X = 100; p1Y = 0;
  p2X = 800; p2Y = 0;
  ballX = 480; ballY = 100;
  ballVX = 3 * (Math.random() > 0.5 ? 1 : -1);
  ballVY = 2;
  updatePosition();
}

function updateTimer() {
  timer--;
  timerEl.textContent = `Time: ${timer}`;
  if (timer <= 0) {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    clearInterval(itemInterval);
    gameArea.classList.add('hidden');
    gameOverPopup.classList.remove('hidden');
    resultText.textContent = `Final Score: ${score1} - ${score2}`;
  }
}

function updatePosition() {
  player1.style.left = `${p1X}px`;
  player1.style.bottom = `${p1Y}px`;
  player2.style.left = `${p2X}px`;
  player2.style.bottom = `${p2Y}px`;
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
}

function gameLoop() {
  // Gravity effect on players
  p1VY -= gravity;
  p2VY -= gravity;
  p1Y = Math.max(0, p1Y + p1VY);
  p2Y = Math.max(0, p2Y + p2VY);
  if (p1Y <= 0) p1VY = 0;
  if (p2Y <= 0) p2VY = 0;

  // Ball movement
  if (!freeze) {
    ballX += ballVX;
    ballY += ballVY;
    ballVY += gravity;
  }

  // Ball bounces on ground
  if (ballY >= floorY) {
    ballY = floorY;
    ballVY *= -0.8;
  }

  // Ball hits side walls
  if (ballX <= 0 || ballX >= 960) ballVX *= -1;

  // Collision with player 1
  if (isElementTouching(ball, player1)) {
    const dx = (ballX + ball.offsetWidth / 2) - (p1X + 40);
    ballVX = Math.max(-5, Math.min(5, dx * 0.2));
    ballVY = -Math.abs(ballVY) - 2;
  }

  // Collision with player 2
  if (isElementTouching(ball, player2)) {
    const dx = (ballX + ball.offsetWidth / 2) - (p2X + 40);
    ballVX = Math.max(-5, Math.min(5, dx * 0.2));
    ballVY = -Math.abs(ballVY) - 2;
  }

  // Check goal (from front only)
  if (ballY >= 440 && ballY <= 540) {
    if (ballX <= 10 && ballVX < 0) {
      score2++;
      goalSFX.play();
      scoreEl.textContent = `Score: ${score1} - ${score2}`;
      setTimeout(resetPositions, 1500);
    } else if (ballX >= 950 && ballVX > 0) {
      score1++;
      goalSFX.play();
      scoreEl.textContent = `Score: ${score1} - ${score2}`;
      setTimeout(resetPositions, 1500);
    }
  }

  // Item collision
  const item = document.querySelector('.item');
  if (item) {
    const itemRect = item.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();
    if (isRectCollide(ballRect, itemRect)) {
      applyItemEffect(item.dataset.type);
      item.remove();
    }
  }

  updatePosition();
}

function isElementTouching(ball, player) {
  const ballRect = ball.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();

  return !(ballRect.right < playerRect.left || ballRect.left > playerRect.right ||
           ballRect.bottom < playerRect.top || ballRect.top > playerRect.bottom);
}

function isRectCollide(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function spawnItem() {
  const existing = document.querySelector('.item');
  if (existing) existing.remove();

  const item = document.createElement('div');
  item.className = 'item';
  const types = ['increase', 'decrease', 'freeze'];
  const type = types[Math.floor(Math.random() * types.length)];
  item.dataset.type = type;
  item.style.left = Math.random() * 900 + 'px';
  item.style.top = '80px';
  item.style.backgroundImage = `url('assets/img/items/${type}.png')`;
  document.querySelector('.field').appendChild(item);
}

function applyItemEffect(type) {
  itemSFX.play();
  if (type === 'increase') {
    ball.style.width = '60px';
    ball.style.height = '60px';
  } else if (type === 'decrease') {
    ball.style.width = '25px';
    ball.style.height = '25px';
  } else if (type === 'freeze') {
    freezeSFX.play();
    freeze = true;
    ball.style.opacity = 0.5;
    setTimeout(() => {
      freeze = false;
      ball.style.opacity = 1;
    }, 3000);
  }
}

// Kontrol pemain
document.addEventListener('keydown', e => {
  switch (e.key.toLowerCase()) {
    case 'a': p1X = Math.max(0, p1X - 10); break;
    case 'd': p1X = Math.min(900, p1X + 10); break;
    case 'w': if (p1Y === 0) p1VY = 12; break;
    case 'arrowleft': p2X = Math.max(0, p2X - 10); break;
    case 'arrowright': p2X = Math.min(900, p2X + 10); break;
    case 'arrowup': if (p2Y === 0) p2VY = 12; break;
  }
});

// Simpan skor
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
