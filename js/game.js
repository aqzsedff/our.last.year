const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');

const items = [
    { text: '✧', isBomb: false },
    { text: '✶', isBomb: false },
    { text: '❋', isBomb: false },
    { text: '∗', isBomb: false },
    { text: '◈', isBomb: false },
    { text: '⋄', isBomb: false },
    { text: '⋆', isBomb: false },
    { text: '★', isBomb: false },
    { text: '♡', isBomb: false },
    { text: '❤', isBomb: false },
    { text: '♥', isBomb: false },
    { text: '💣', isBomb: true }
];

let fallingItems = [];
let explosions = [];
let score = 0;
let gameActive = true;
let frameId;
let speed = 1.3;
let spawnRate = 25;
let frameCounter = 0;

// Настройка размера canvas для адаптации
function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(400, container.clientWidth - 32);
    canvas.style.width = `${maxWidth}px`;
    canvas.style.height = `${maxWidth * 1.25}px`;
}

function resetGame() {
    fallingItems = [];
    explosions = [];
    score = 0;
    gameActive = true;
    speed = 1.3;
    spawnRate = 25;
    frameCounter = 0;
    updateScore();
}

function updateScore() {
    scoreSpan.textContent = score;
}

// Рисуем взрыв
function drawExplosion(explosion) {
    const { x, y, frame } = explosion;
    const size = 20 + (5 - frame) * 3;
    const alpha = Math.min(1, frame / 3);
    
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.font = `${size}px "Segoe UI", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ff6600';
    ctx.fillText('💥', x, y - 15);
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('⚡', x - 5, y - 25);
    ctx.fillStyle = '#ff4400';
    ctx.fillText('💥', x + 5, y - 20);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 24px "Segoe UI", "Courier New", monospace';
    ctx.fillStyle = '#5d453d';
    ctx.shadowBlur = 0;
    
    for (let item of fallingItems) {
        ctx.fillText(item.text, item.x, item.y);
    }
    
    for (let i = explosions.length - 1; i >= 0; i--) {
        drawExplosion(explosions[i]);
        explosions[i].frame--;
        if (explosions[i].frame <= 0) {
            explosions.splice(i, 1);
        }
    }
}

function update() {
    if (!gameActive) return;
    
    for (let i = fallingItems.length - 1; i >= 0; i--) {
        fallingItems[i].y += speed;
        if (fallingItems[i].y > canvas.height + 50) {
            fallingItems.splice(i, 1);
        }
    }
}

function spawnItem() {
    if (!gameActive) return;
    
    const isBomb = Math.random() < 0.2;
    const pool = items.filter(i => i.isBomb === isBomb);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    
    ctx.font = 'bold 24px "Segoe UI", "Courier New", monospace';
    const textWidth = ctx.measureText(chosen.text).width;
    const maxX = Math.max(40, canvas.width - textWidth - 20);
    
    fallingItems.push({
        text: chosen.text,
        isBomb: chosen.isBomb,
        x: Math.random() * maxX + 10,
        y: -30
    });
}

function handleCanvasClick(e) {
    if (!gameActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    
    if (canvasX < 0 || canvasX > canvas.width || canvasY < 0 || canvasY > canvas.height) return;
    
    ctx.font = 'bold 24px "Segoe UI", "Courier New", monospace';
    
    for (let i = fallingItems.length - 1; i >= 0; i--) {
        const item = fallingItems[i];
        const textWidth = ctx.measureText(item.text).width;
        
        if (canvasX > item.x - 15 && canvasX < item.x + textWidth + 15 &&
            canvasY > item.y - 30 && canvasY < item.y + 15) {
            
            if (item.isBomb) {
                score = Math.max(0, score - 2);
                explosions.push({
                    x: item.x + textWidth / 2,
                    y: item.y - 10,
                    frame: 8
                });
            } else {
                score += 1;
            }
            fallingItems.splice(i, 1);
            updateScore();
            break;
        }
    }
}

function gameLoop() {
    if (!gameActive) return;
    
    frameCounter++;
    
    if (frameCounter % spawnRate === 0) {
        spawnItem();
    }
    
    if (frameCounter % 200 === 0 && frameCounter > 0) {
        speed = Math.min(speed + 0.15, 4.5);
        if (spawnRate > 12) spawnRate--;
    }
    
    update();
    draw();
    frameId = requestAnimationFrame(gameLoop);
}

// Инициализация
window.addEventListener('load', () => {
    canvas.width = 400;
    canvas.height = 500;
    resizeCanvas();
    resetGame();
    gameLoop();
});

window.addEventListener('resize', () => {
    resizeCanvas();
});

canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleCanvasClick, { passive: false });

document.getElementById('restartGameBtn').addEventListener('click', () => {
    resetGame();
});

window.addEventListener('beforeunload', () => {
    if (frameId) cancelAnimationFrame(frameId);
});