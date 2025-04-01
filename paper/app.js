const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Setup canvas
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Game constants
const BLOCK_SIZE = 40;
const GRAVITY = 0.8;
const JUMP_FORCE = -14;
const MOVEMENT_SPEED = 5;
const FRICTION = 0.7;
const AIR_RESISTANCE = 0.9;

// Block types
const blocks = {
  air: { color: '#7ec0ee' },
  grass: { color: '#567a35' },
  dirt: { color: '#8b5e3c' },
  stone: { color: '#7a7a7a' }
};

// World generation
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 20;
let world = [];

function generateWorld() {
  // Terrain generation
  const surfaceHeight = Array.from({ length: WORLD_WIDTH }, (_, x) =>
    Math.floor(Math.sin(x / 15) * 3 + WORLD_HEIGHT / 2 - 2)
  );

  for (let x = 0; x < WORLD_WIDTH; x++) {
    world[x] = [];
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      if (y > surfaceHeight[x]) {
        world[x][y] = 'air';
      } else if (y === surfaceHeight[x]) {
        world[x][y] = 'grass';
      } else if (y > surfaceHeight[x] - 4) {
        world[x][y] = 'dirt';
      } else {
        // Stone with random caves
        world[x][y] = Math.random() < 0.92 ? 'stone' : 'air';
      }
    }
  }
}

// Player object
const player = {
  x: WORLD_WIDTH / 2 * BLOCK_SIZE,
  y: 0,
  width: BLOCK_SIZE * 0.6,
  height: BLOCK_SIZE * 1.2,
  velocityX: 0,
  velocityY: 0,
  grounded: false
};

// Input handling
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
};

window.addEventListener('keydown', e => {
  if (e.code in keys) {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
  }
});

window.addEventListener('keyup', e => {
  if (e.code in keys) {
    keys[e.code] = false;
  }
});

// Collision detection
function checkCollision(x, y) {
  const left = Math.floor(x / BLOCK_SIZE);
  const right = Math.floor((x + player.width) / BLOCK_SIZE);
  const top = Math.floor(y / BLOCK_SIZE);
  const bottom = Math.floor((y + player.height) / BLOCK_SIZE);

  for (let ix = left; ix <= right; ix++) {
    for (let iy = top; iy <= bottom; iy++) {
      if (world[ix] && world[ix][iy] !== 'air') {
        return true;
      }
    }
  }
  return false;
}

// Physics update
function update() {
  // Horizontal movement
  if (keys.ArrowLeft) player.velocityX = -MOVEMENT_SPEED;
  if (keys.ArrowRight) player.velocityX = MOVEMENT_SPEED;

  player.velocityX *= player.grounded ? FRICTION : AIR_RESISTANCE;

  let newX = player.x + player.velocityX;
  if (!checkCollision(newX, player.y)) {
    player.x = newX;
  } else {
    player.velocityX = 0;
  }

  // Vertical movement
  player.velocityY += GRAVITY;
  if (keys.Space && player.grounded) {
    player.velocityY = JUMP_FORCE;
    player.grounded = false;
  }

  let newY = player.y + player.velocityY;
  if (!checkCollision(player.x, newY)) {
    player.y = newY;
    player.grounded = false;
  } else {
    player.velocityY = 0;
    player.grounded = player.velocityY >= 0;
  }
}

// Rendering
function draw() {
  // Clear canvas
  ctx.fillStyle = blocks.air.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate visible area
  const camX = player.x + player.width / 2 - canvas.width / 2;
  const camY = player.y + player.height / 2 - canvas.height / 2;

  // Draw blocks
  const startX = Math.max(0, Math.floor(camX / BLOCK_SIZE));
  const endX = Math.min(WORLD_WIDTH, Math.ceil((camX + canvas.width) / BLOCK_SIZE));

  const startY = Math.max(0, Math.floor(camY / BLOCK_SIZE));
  const endY = Math.min(WORLD_HEIGHT, Math.ceil((camY + canvas.height) / BLOCK_SIZE));

  for (let x = startX; x < endX; x++) {
    for (let y = startY; y < endY; y++) {
      if (world[x][y] !== 'air') {
        ctx.fillStyle = blocks[world[x][y]].color;
        ctx.fillRect(
          x * BLOCK_SIZE - camX,
          y * BLOCK_SIZE - camY,
          BLOCK_SIZE - 1,
          BLOCK_SIZE - 1
        );
      }
    }
  }

  // Draw player
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(
    player.x - camX,
    player.y - camY,
    player.width,
    player.height
  );
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
generateWorld();
gameLoop();