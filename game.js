/**
 * Cyber Parkour - Core Game Engine
 * Sleek, neon cyberpunk theme. Mobile-optimized.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const hud = document.getElementById('hud');
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');
const newRecordTag = document.getElementById('newRecordTag');
const comboText = document.getElementById('comboText');

// Buttons
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const mobileSlideBtn = document.getElementById('mobileSlideBtn');
const mobileJumpBtn = document.getElementById('mobileJumpBtn');

// Logical coordinates (Virtual Resolution)
const V_WIDTH = 1200;
const V_HEIGHT = 675;

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let highScore = parseInt(localStorage.getItem('cyber_parkour_highscore')) || 0;
let gameSpeed = 8;
const MAX_SPEED = 18;
let distance = 0;
let obstacleTimer = 0;
let nextObstacleTime = 80;
let screenShake = 0;

// Entities
let player;
let obstacles = [];
let backgrounds = [];
let particles = [];

// High score init
highScoreEl.textContent = String(highScore).padStart(5, '0');

// Dynamic Canvas Scaling
function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Scale factor to preserve aspect ratio
    const scaleX = windowWidth / V_WIDTH;
    const scaleY = windowHeight / V_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    
    canvas.width = V_WIDTH * scale;
    canvas.height = V_HEIGHT * scale;
    
    // Set scale context for logical drawing coordinates
    ctx.scale(scale, scale);
    
    // Ensure smooth rendering
    ctx.imageSmoothingEnabled = true;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);
resizeCanvas();

// --- INPUT HANDLERS ---
const keys = {};

function triggerJump() {
    if (gameState === 'PLAYING') {
        player.jump();
    }
}

function startSlide() {
    if (gameState === 'PLAYING') {
        player.slide(true);
    }
}

function stopSlide() {
    if (gameState === 'PLAYING') {
        player.slide(false);
    }
}

// Keyboard Listeners
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        triggerJump();
    }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        startSlide();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        stopSlide();
    }
});

// Mobile Controls (Touch)
mobileJumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    triggerJump();
});

mobileSlideBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startSlide();
});

mobileSlideBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopSlide();
});

// Click support (for web emulator testing if touch is unavailable)
mobileJumpBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    triggerJump();
});
mobileSlideBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startSlide();
});
window.addEventListener('mouseup', () => {
    stopSlide();
});

// --- PARTICLE SYSTEM ---
class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function spawnSparks(x, y, color) {
    for (let i = 0; i < 8; i++) {
        const vx = -gameSpeed + (Math.random() - 0.5) * 8;
        const vy = (Math.random() - 0.5) * 10 - 2;
        const size = Math.random() * 3 + 2;
        const life = Math.random() * 20 + 15;
        particles.push(new Particle(x, y, vx, vy, color, size, life));
    }
}

// --- PLAYER CLASS ---
class Player {
    constructor() {
        this.x = 150;
        this.groundY = V_HEIGHT - 120;
        this.width = 50;
        this.height = 80;
        this.y = this.groundY - this.height;
        this.vy = 0;
        this.gravity = 1.0;
        this.jumpForce = -20;
        this.isJumping = false;
        this.isDoubleJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.animFrame = 0;
        this.colorCyan = '#00f0ff';
        this.colorPink = '#ff007f';
        this.colorPurple = '#8b00ff';
    }

    jump() {
        if (!this.isJumping) {
            this.vy = this.jumpForce;
            this.isJumping = true;
            this.isSliding = false;
            // Jump sparks
            spawnSparks(this.x + this.width / 2, this.y + this.height, this.colorCyan);
        } else if (!this.isDoubleJumping) {
            this.vy = this.jumpForce * 0.85;
            this.isDoubleJumping = true;
            // Double jump ring effect
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 4;
                const vx = Math.cos(angle) * speed - gameSpeed;
                const vy = Math.sin(angle) * speed;
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    vx, vy,
                    this.colorPink,
                    Math.random() * 2 + 1,
                    30
                ));
            }
        }
    }

    slide(active) {
        if (active) {
            if (!this.isJumping) {
                this.isSliding = true;
                this.height = 45; // lower hitbox height
            }
        } else {
            this.isSliding = false;
            this.height = 80; // restore hitbox
        }
    }

    update() {
        // Apply Physics
        this.vy += this.gravity;
        this.y += this.vy;

        // Ground constraint
        const currentGroundY = this.groundY - this.height;
        if (this.y >= currentGroundY) {
            this.y = currentGroundY;
            this.vy = 0;
            this.isJumping = false;
            this.isDoubleJumping = false;
        }

        // Slide mechanics & sparks
        if (this.isSliding && !this.isJumping) {
            // Spawn neon sparks when sliding
            if (Math.random() < 0.4) {
                particles.push(new Particle(
                    this.x + 10,
                    this.groundY - 5,
                    -gameSpeed + (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 3,
                    this.colorPink,
                    Math.random() * 2 + 2,
                    15
                ));
            }
        }

        // Particle trail when running
        if (!this.isJumping && !this.isSliding && Math.random() < 0.15) {
            particles.push(new Particle(
                this.x,
                this.groundY - 10,
                -gameSpeed - 2,
                (Math.random() - 0.5) * 2,
                'rgba(139, 0, 255, 0.4)',
                Math.random() * 3 + 2,
                15
            ));
        }

        // Animate running
        this.animFrame += gameSpeed * 0.05;
    }

    draw() {
        ctx.save();
        ctx.shadowBlur = 15;
        
        const px = this.x;
        const py = this.y;
        const pw = this.width;
        const ph = this.height;

        if (this.isSliding) {
            ctx.shadowColor = this.colorPink;
            ctx.fillStyle = this.colorPink;
            
            // Draw a sliding cyber capsule shape
            ctx.beginPath();
            ctx.roundRect(px, py, pw + 10, ph, 15);
            ctx.fill();

            // Cyber glowing stripes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 15, py + 12, pw - 10, 4);
            ctx.fillRect(px + 20, py + 24, pw - 20, 4);

        } else {
            // Running or jumping
            ctx.shadowColor = this.colorCyan;
            
            // Stylized cyber runner character
            // Head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            const headY = py + 12;
            ctx.arc(px + 25, headY, 10, 0, Math.PI * 2);
            ctx.fill();

            // Futuristic Visor
            ctx.fillStyle = this.colorPink;
            ctx.fillRect(px + 22, headY - 4, 10, 4);

            // Torso
            ctx.strokeStyle = this.colorCyan;
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            
            const neckX = px + 25;
            const neckY = headY + 10;
            const hipX = px + 25;
            const hipY = py + 55;
            
            ctx.beginPath();
            ctx.moveTo(neckX, neckY);
            ctx.lineTo(hipX, hipY);
            ctx.stroke();

            // Legs Animation based on running cycle
            let leftFootX, leftFootY, rightFootX, rightFootY;

            if (this.isJumping) {
                // Tucked in legs for jumping
                leftFootX = px + 15;
                leftFootY = py + 75;
                rightFootX = px + 35;
                rightFootY = py + 75;
            } else {
                // Leg swing angle
                const cycle = Math.sin(this.animFrame);
                leftFootX = px + 25 + cycle * 20;
                leftFootY = py + 80;
                rightFootX = px + 25 - cycle * 20;
                rightFootY = py + 80;
            }

            // Draw Legs
            ctx.strokeStyle = this.colorPurple;
            ctx.beginPath();
            ctx.moveTo(hipX, hipY);
            ctx.lineTo(leftFootX, leftFootY);
            ctx.moveTo(hipX, hipY);
            ctx.lineTo(rightFootX, rightFootY);
            ctx.stroke();

            // Arms Animation
            let leftHandX, leftHandY, rightHandX, rightHandY;

            if (this.isJumping) {
                leftHandX = px + 10;
                leftHandY = py + 15;
                rightHandX = px + 40;
                rightHandY = py + 15;
            } else {
                const cycle = Math.sin(this.animFrame + Math.PI);
                leftHandX = px + 25 + cycle * 15;
                leftHandY = py + 40;
                rightHandX = px + 25 - cycle * 15;
                rightHandY = py + 40;
            }

            // Draw Arms
            ctx.strokeStyle = this.colorCyan;
            ctx.beginPath();
            ctx.moveTo(neckX + 2, neckY + 4);
            ctx.lineTo(leftHandX, leftHandY);
            ctx.moveTo(neckX - 2, neckY + 4);
            ctx.lineTo(rightHandX, rightHandY);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// --- PARALLAX BACKGROUND ---
class BackgroundLayer {
    constructor(imageType, speedFactor, color) {
        this.imageType = imageType; // 'STARS', 'CITY_FAR', 'CITY_NEAR'
        this.speedFactor = speedFactor;
        this.color = color;
        this.x = 0;
        this.width = V_WIDTH;
        
        // Setup static layout matrices
        this.buildings = [];
        if (imageType === 'CITY_FAR') {
            for (let i = 0; i < 15; i++) {
                this.buildings.push({
                    x: i * 100 + Math.random() * 20,
                    w: 60 + Math.random() * 80,
                    h: 150 + Math.random() * 200
                });
            }
        } else if (imageType === 'CITY_NEAR') {
            for (let i = 0; i < 10; i++) {
                this.buildings.push({
                    x: i * 150 + Math.random() * 30,
                    w: 100 + Math.random() * 100,
                    h: 250 + Math.random() * 220
                });
            }
        }
    }

    update() {
        this.x -= gameSpeed * this.speedFactor;
        if (this.x <= -this.width) {
            this.x = 0;
        }
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;

        const drawWidth = V_WIDTH;
        const currentX = this.x;

        if (this.imageType === 'STARS') {
            // Draw digital stars
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffffff';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            for (let i = 0; i < 40; i++) {
                const starX = (currentX + (i * 73)) % (V_WIDTH * 2);
                const starY = (i * 17) % 350;
                ctx.beginPath();
                ctx.arc(starX < V_WIDTH ? starX : starX - V_WIDTH, starY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } 
        
        else if (this.imageType === 'CITY_FAR') {
            // Distant skyline
            ctx.globalAlpha = 0.35;
            for (let offset = 0; offset <= V_WIDTH; offset += V_WIDTH) {
                this.buildings.forEach(b => {
                    ctx.fillRect(currentX + b.x + offset, V_HEIGHT - b.h - 100, b.w, b.h);
                });
            }
        } 
        
        else if (this.imageType === 'CITY_NEAR') {
            // Nearer skyline
            ctx.globalAlpha = 0.55;
            for (let offset = 0; offset <= V_WIDTH; offset += V_WIDTH) {
                this.buildings.forEach(b => {
                    ctx.fillRect(currentX + b.x + offset, V_HEIGHT - b.h - 100, b.w, b.h);
                    
                    // Add modern neon window dots
                    ctx.fillStyle = '#ffbe0b';
                    ctx.globalAlpha = 0.4;
                    const winRows = Math.floor(b.h / 40);
                    const winCols = Math.floor(b.w / 20);
                    for (let r = 0; r < winRows; r++) {
                        for (let c = 0; c < winCols; c++) {
                            if ((r + c) % 3 === 0) {
                                ctx.fillRect(
                                    currentX + b.x + offset + 8 + c * 16,
                                    V_HEIGHT - b.h - 100 + 15 + r * 30,
                                    4, 6
                                );
                            }
                        }
                    }
                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = 0.55;
                });
            }
        }

        ctx.restore();
    }
}

// --- OBSTACLE CLASS ---
class Obstacle {
    constructor() {
        this.x = V_WIDTH + 100;
        
        // Randomly select type of parkour obstacle
        // 0: LOW hurdle (jump over)
        // 1: HIGH hanging barrier/laser (slide under)
        // 2: TALL obstacle (double jump)
        this.type = Math.floor(Math.random() * 3);
        
        this.width = 40 + Math.random() * 20;
        
        if (this.type === 0) {
            // Low barrier
            this.height = 35 + Math.random() * 15;
            this.y = V_HEIGHT - 100 - this.height;
            this.color = '#ff007f'; // Neon Pink
        } else if (this.type === 1) {
            // Hanging laser beam
            this.height = 35;
            this.width = 45;
            this.y = V_HEIGHT - 100 - 95; // Suspended high
            this.color = '#00f0ff'; // Neon Cyan
        } else {
            // Tall fence
            this.height = 70 + Math.random() * 15;
            this.width = 35;
            this.y = V_HEIGHT - 100 - this.height;
            this.color = '#8b00ff'; // Neon Purple
        }

        this.dodged = false;
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        if (this.type === 0) {
            // Low neon spiked barrier
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();

            // Glow cap
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
        } 
        
        else if (this.type === 1) {
            // Hanging energy beam
            ctx.lineWidth = 5;
            ctx.strokeStyle = this.color;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Pulsing center laser
            ctx.fillStyle = 'rgba(255,255,255, 0.9)';
            ctx.fillRect(this.x + 4, this.y + this.height / 2 - 2, this.width - 8, 4);
        } 
        
        else {
            // Tall grid/fence
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, 6);
            ctx.fill();

            // Inner glowing vertical strip
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + this.width / 2 - 2, this.y + 10, 4, this.height - 20);
        }

        ctx.restore();
    }
}

// --- INITIALIZE GAME ---
function init() {
    score = 0;
    gameSpeed = 8;
    distance = 0;
    obstacleTimer = 0;
    screenShake = 0;
    particles = [];
    obstacles = [];
    backgrounds = [];
    
    // Create parallax layers
    backgrounds.push(new BackgroundLayer('STARS', 0.02, '#ffffff'));
    backgrounds.push(new BackgroundLayer('CITY_FAR', 0.12, '#0c0618'));
    backgrounds.push(new BackgroundLayer('CITY_NEAR', 0.28, '#140c26'));

    player = new Player();
    
    currentScoreEl.textContent = '00000';
    comboText.textContent = '1.0x';
}

// --- COLLISION DETECTION ---
function checkCollision(p, o) {
    // Basic rectangle overlapping hitbox
    // With 5px visual buffer for satisfying gameloop
    const buffer = 6;
    return (
        p.x + buffer < o.x + o.width &&
        p.x + p.width - buffer > o.x &&
        p.y + buffer < o.y + o.height &&
        p.y + p.height - buffer > o.y
    );
}

// --- SCREEN SHAKE EFFECT ---
function shakeScreen() {
    if (screenShake > 0) {
        const dx = (Math.random() - 0.5) * screenShake;
        const dy = (Math.random() - 0.5) * screenShake;
        ctx.translate(dx, dy);
        screenShake -= 0.6;
    }
}

// --- CORE GAME LOOP ---
function update() {
    // Parallax update
    backgrounds.forEach(bg => bg.update());

    // Update Player
    player.update();

    // Spawning Logic
    obstacleTimer++;
    if (obstacleTimer >= nextObstacleTime) {
        obstacles.push(new Obstacle());
        obstacleTimer = 0;
        // Random time range for next obstacle
        nextObstacleTime = Math.random() * 50 + 60 - (gameSpeed * 1.5);
    }

    // Update Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.update();

        // Check if player collided
        if (checkCollision(player, o)) {
            gameOver();
            return;
        }

        // Score when successfully dodged
        if (o.x + o.width < player.x && !o.dodged) {
            o.dodged = true;
            score += 100;
            
            // Multiplier effect based on speed
            const speedCombo = (1 + (gameSpeed - 8) * 0.1).toFixed(1);
            comboText.textContent = speedCombo + 'x';
            
            // Pop score particle
            spawnSparks(player.x + player.width, player.y + player.height / 2, '#ffbe0b');
        }

        // Clear offscreen obstacles
        if (o.x < -100) {
            obstacles.splice(i, 1);
        }
    }

    // Score continuously incrementing
    distance += 0.2;
    score += Math.floor(distance * 0.05);
    distance = distance % 10 === 0 ? distance : distance;
    
    currentScoreEl.textContent = String(Math.floor(score)).padStart(5, '0');

    // Increase game speed gradually
    if (Math.floor(score) % 500 === 0 && gameSpeed < MAX_SPEED) {
        gameSpeed += 0.2;
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function draw() {
    // Reset/clear with cyber space gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
    skyGrad.addColorStop(0, '#040509');
    skyGrad.addColorStop(1, '#0e0b1c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Apply Screen Shake
    ctx.save();
    shakeScreen();

    // Draw Parallax layers
    backgrounds.forEach(bg => bg.draw());

    // Draw Cyber Ground
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#06070b';
    ctx.fillRect(0, V_HEIGHT - 100, V_WIDTH, 100);

    // Neon ground horizontal border
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(0, V_HEIGHT - 100, V_WIDTH, 4);

    // Decorative cyber grid lines
    ctx.strokeStyle = 'rgba(139, 0, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < V_WIDTH; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, V_HEIGHT - 100);
        ctx.lineTo(i - 40, V_HEIGHT);
        ctx.stroke();
    }
    ctx.restore();

    // Draw Obstacles
    obstacles.forEach(o => o.draw());

    // Draw Player
    player.draw();

    // Draw Particles
    particles.forEach(p => p.draw());

    ctx.restore();
}

function gameLoop() {
    if (gameState === 'PLAYING') {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// --- STATE MANAGEMENT FLOWS ---
function startGame() {
    init();
    gameState = 'PLAYING';
    
    // Hide UI overlays
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    
    // Start canvas loops
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState = 'GAMEOVER';
    screenShake = 18; // Apply solid visual shake
    
    // Spawn red sparks representing a system crash
    spawnSparks(player.x + player.width / 2, player.y + player.height / 2, '#ff3333');
    
    // Trigger vibration if mobile API is available
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }

    // Save Score
    const finalScore = Math.floor(score);
    finalScoreEl.textContent = finalScore;
    
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('cyber_parkour_highscore', highScore);
        highScoreEl.textContent = String(highScore).padStart(5, '0');
        newRecordTag.classList.remove('hidden');
    } else {
        newRecordTag.classList.add('hidden');
    }
    
    bestScoreEl.textContent = highScore;
    
    // Draw crashed state once
    draw();
    
    // Show GameOver overlay
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 500);
}

// Event Listeners for UI Menu buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// In-game dynamic styling helper (aesthetic checks)
function drawStartScreenBackground() {
    init();
    draw();
}
drawStartScreenBackground();
