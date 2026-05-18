/**
 * Cyber Parkour 3D - Breathtaking 3D WebGL Game Engine
 * Powered by Three.js. Fully responsive, mobile friendly.
 */

// --- DYNAMIC ELEMENT REFERENCES ---
const canvas = document.getElementById('gameCanvas');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const hud = document.getElementById('hud');
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');
const newRecordTag = document.getElementById('newRecordTag');
const comboText = document.getElementById('comboText');

// Buttons & Touch
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const mobileSlideBtn = document.getElementById('mobileSlideBtn');
const mobileJumpBtn = document.getElementById('mobileJumpBtn');

// --- THREE.JS SCENE SETUP ---
let scene, camera, renderer;
let clock = new THREE.Clock();

// Game Parameters
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let highScore = parseInt(localStorage.getItem('cyber_parkour_3d_highscore')) || 0;
let gameSpeed = 35; // Speed along Z axis
const MAX_SPEED = 75;
let distanceRun = 0;
let obstacleTimer = 0;
let nextObstacleTime = 1.8; // Spawning delay in seconds
let cameraShake = 0;

// Entities
let player;
let obstacles = [];
let buildings = [];
let particles = [];
let groundGrid;

// Color Palette
const COLOR_CYAN = 0x00f0ff;
const COLOR_PINK = 0xff007f;
const COLOR_PURPLE = 0x8b00ff;
const COLOR_GOLD = 0xffbe0b;
const COLOR_RED = 0xff3333;
const COLOR_DARK_BLUE = 0x07080d;

highScoreEl.textContent = String(highScore).padStart(5, '0');

function initThree() {
    // 1. Create Scene & Ambient Fog for depth
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040509);
    scene.fog = new THREE.FogExp2(0x040509, 0.012);

    // 2. Setup Chase Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Chase camera position (behind and above player)
    camera.position.set(0, 4.5, 9.5);
    camera.lookAt(0, 1.5, 0);

    // 3. WebGL Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    // Dynamic neon directional lights for cyber shadows
    const cyanLight = new THREE.DirectionalLight(COLOR_CYAN, 1.2);
    cyanLight.position.set(-10, 20, 10);
    scene.add(cyanLight);

    const pinkLight = new THREE.DirectionalLight(COLOR_PINK, 1.0);
    pinkLight.position.set(10, 15, -10);
    scene.add(pinkLight);

    // 5. Build Procedural Neon Ground Grid
    createCyberGround();

    // 6. Build City Skyscrapers
    createSkyscrapers();

    // 7. Instantiate 3D Player
    player = new Player3D();
}

// Procedural texture generation for cyberpunk grid floor
function createCyberGround() {
    const width = 60;
    const length = 500;
    
    // Draw high-quality grid pattern on in-memory canvas
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = 128;
    gridCanvas.height = 128;
    const gctx = gridCanvas.getContext('2d');
    
    gctx.fillStyle = '#06070b';
    gctx.fillRect(0, 0, 128, 128);
    
    // Glowing grid lines
    gctx.strokeStyle = '#00f0ff';
    gctx.lineWidth = 4;
    gctx.strokeRect(0, 0, 128, 128);
    
    const gridTexture = new THREE.CanvasTexture(gridCanvas);
    gridTexture.wrapS = THREE.RepeatWrapping;
    gridTexture.wrapT = THREE.RepeatWrapping;
    gridTexture.repeat.set(width / 3, length / 3);

    const groundGeo = new THREE.PlaneGeometry(width, length);
    const groundMat = new THREE.MeshStandardMaterial({
        map: gridTexture,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x002244,
        emissiveIntensity: 0.3
    });

    groundGrid = new THREE.Mesh(groundGeo, groundMat);
    groundGrid.rotation.x = -Math.PI / 2;
    groundGrid.position.set(0, 0, -length / 3);
    scene.add(groundGrid);

    // Glowing border rails (cyan neon lines flanking the runway)
    const railGeoLeft = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
    const railMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });
    
    const railLeft = new THREE.Mesh(railGeoLeft, railMat);
    railLeft.rotation.x = Math.PI / 2;
    railLeft.position.set(-6, 0.05, -length / 2);
    scene.add(railLeft);

    const railRight = railLeft.clone();
    railRight.position.x = 6;
    scene.add(railRight);
}

// Dynamic City Grid Generator
function createSkyscrapers() {
    const skyGeo = new THREE.BoxGeometry(1, 1, 1);
    
    // Create random skyscrapers along both sides of the cyber road
    for (let i = 0; i < 28; i++) {
        const height = 40 + Math.random() * 80;
        const width = 12 + Math.random() * 15;
        const depth = 12 + Math.random() * 15;
        
        // Dark metallic building material with random neon glowing stripes
        const isPink = Math.random() < 0.5;
        const emissiveColor = isPink ? COLOR_PINK : COLOR_PURPLE;
        
        const bMat = new THREE.MeshStandardMaterial({
            color: 0x090a12,
            roughness: 0.2,
            metalness: 0.9,
            emissive: emissiveColor,
            emissiveIntensity: 0.15 + Math.random() * 0.25,
            flatShading: true
        });

        const building = new THREE.Mesh(skyGeo, bMat);
        building.scale.set(width, height, depth);
        
        // Flank on left or right sides of runway
        const side = Math.random() < 0.5 ? -1 : 1;
        const xPos = side * (18 + Math.random() * 40);
        const zPos = -Math.random() * 450 - 50;
        
        building.position.set(xPos, height / 2 - 0.5, zPos);
        scene.add(building);
        
        buildings.push({
            mesh: building,
            height: height,
            side: side,
            originalX: xPos
        });
    }
}

// --- 3D PARTICLE CLASS ---
class Particle3D {
    constructor(x, y, z, vx, vy, vz, color, size, life) {
        const pGeo = new THREE.BoxGeometry(size, size, size);
        const pMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true
        });
        
        this.mesh = new THREE.Mesh(pGeo, pMat);
        this.mesh.position.set(x, y, z);
        scene.add(this.mesh);
        
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.life = life;
        this.maxLife = life;
    }

    update(dt) {
        this.mesh.position.x += this.vx * dt;
        this.mesh.position.y += this.vy * dt;
        this.mesh.position.z += this.vz * dt;
        
        this.life -= dt;
        
        // Shrink and fade
        const scaleVal = Math.max(0.01, this.life / this.maxLife);
        this.mesh.scale.set(scaleVal, scaleVal, scaleVal);
        this.mesh.material.opacity = scaleVal;
    }

    destroy() {
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

function spawnSparks3D(x, y, z, color) {
    for (let i = 0; i < 12; i++) {
        const vx = (Math.random() - 0.5) * 12;
        const vy = Math.random() * 15 + 2;
        const vz = gameSpeed * 0.3 + (Math.random() - 0.5) * 15;
        const size = 0.15 + Math.random() * 0.15;
        const life = 0.4 + Math.random() * 0.4;
        
        particles.push(new Particle3D(x, y, z, vx, vy, vz, color, size, life));
    }
}

// --- 3D PLAYER CLASS ---
class Player3D {
    constructor() {
        this.group = new THREE.Group();
        scene.add(this.group);

        // State Machine
        this.y = 0.1;
        this.vy = 0;
        this.gravity = -52; // Strong 3D gravity
        this.jumpForce = 21;
        this.isJumping = false;
        this.isDoubleJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.animTime = 0;

        // Visual hitbox properties
        this.width = 1.0;
        this.height = 1.6;
        this.depth = 1.0;

        this.buildRobotMesh();
    }

    buildRobotMesh() {
        // Materials
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.3, metalness: 0.8 });
        const cyberMat = new THREE.MeshStandardMaterial({ color: COLOR_CYAN, emissive: COLOR_CYAN, emissiveIntensity: 0.6 });
        const neonPinkMat = new THREE.MeshStandardMaterial({ color: COLOR_PINK, emissive: COLOR_PINK, emissiveIntensity: 0.8 });
        
        // 1. Torso Capsule
        const torsoGeo = new THREE.BoxGeometry(0.8, 0.9, 0.5);
        this.torso = new THREE.Mesh(torsoGeo, skinMat);
        this.torso.position.y = 1.0;
        this.group.add(this.torso);

        // Core chest light
        const coreGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 8);
        this.chestCore = new THREE.Mesh(coreGeo, cyberMat);
        this.chestCore.rotation.x = Math.PI / 2;
        this.chestCore.position.set(0, 1.1, 0.26);
        this.group.add(this.chestCore);

        // 2. Head
        const headGeo = new THREE.BoxGeometry(0.44, 0.44, 0.44);
        this.head = new THREE.Mesh(headGeo, skinMat);
        this.head.position.y = 1.65;
        this.group.add(this.head);

        // Glowing visor (pink eye plate)
        const visorGeo = new THREE.BoxGeometry(0.48, 0.12, 0.15);
        this.visor = new THREE.Mesh(visorGeo, neonPinkMat);
        this.visor.position.set(0, 1.7, 0.18);
        this.group.add(this.visor);

        // 3. Articulated Limbs
        const limbGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
        
        // Left Arm
        this.leftArm = new THREE.Mesh(limbGeo, cyberMat);
        this.leftArm.position.set(-0.55, 1.0, 0);
        this.group.add(this.leftArm);

        // Right Arm
        this.rightArm = new THREE.Mesh(limbGeo, cyberMat);
        this.rightArm.position.set(0.55, 1.0, 0);
        this.group.add(this.rightArm);

        // Left Leg
        this.leftLeg = new THREE.Mesh(limbGeo, skinMat);
        this.leftLeg.position.set(-0.25, 0.35, 0);
        this.group.add(this.leftLeg);

        // Right Leg
        this.rightLeg = new THREE.Mesh(limbGeo, skinMat);
        this.rightLeg.position.set(0.25, 0.35, 0);
        this.group.add(this.rightLeg);
    }

    jump() {
        if (!this.isJumping) {
            this.vy = this.jumpForce;
            this.isJumping = true;
            this.isSliding = false;
            spawnSparks3D(this.group.position.x, this.y, this.group.position.z, COLOR_CYAN);
        } else if (!this.isDoubleJumping) {
            this.vy = this.jumpForce * 0.85;
            this.isDoubleJumping = true;
            
            // Neon radial shockwave
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 12 + 6;
                const vx = Math.cos(angle) * speed;
                const vz = Math.sin(angle) * speed;
                particles.push(new Particle3D(
                    this.group.position.x,
                    this.group.position.y + 0.8,
                    this.group.position.z,
                    vx, 0, vz,
                    COLOR_PINK, 0.15, 0.5
                ));
            }
        }
    }

    slide(active) {
        if (active) {
            if (!this.isJumping) {
                this.isSliding = true;
                this.height = 0.75; // Lower 3D collision hitbox
                
                // Animate torso horizontally
                this.group.rotation.x = -Math.PI / 2.5;
                this.group.position.y = 0.3;
            }
        } else {
            this.isSliding = false;
            this.height = 1.6; // Restore tall hitbox
            this.group.rotation.x = 0;
            this.group.position.y = this.y;
        }
    }

    update(dt) {
        // Physics update
        this.vy += this.gravity * dt;
        this.y += this.vy * dt;

        // Ground constraint
        if (this.y <= 0.1) {
            this.y = 0.1;
            this.vy = 0;
            this.isJumping = false;
            this.isDoubleJumping = false;
        }

        // Apply visual positions unless sliding overrides
        if (!this.isSliding) {
            this.group.position.y = this.y;
        }

        // Running Anim Loop
        this.animTime += dt * gameSpeed * 0.35;
        
        if (this.isSliding) {
            // Sliding sparks
            if (Math.random() < 0.3) {
                particles.push(new Particle3D(
                    this.group.position.x + (Math.random() - 0.5) * 0.4,
                    0.05,
                    this.group.position.z + 0.3,
                    (Math.random() - 0.5) * 5,
                    Math.random() * 3,
                    gameSpeed * 0.4,
                    COLOR_PINK, 0.1, 0.3
                ));
            }
        } else if (this.isJumping) {
            // Legs folded in during jump
            this.leftLeg.rotation.x = -0.6;
            this.rightLeg.rotation.x = -0.6;
            this.leftArm.rotation.x = 0.6;
            this.rightArm.rotation.x = 0.6;
        } else {
            // Normal high-tech running swing animations
            const swing = Math.sin(this.animTime);
            this.leftLeg.rotation.x = swing * 0.8;
            this.rightLeg.rotation.x = -swing * 0.8;
            this.leftArm.rotation.x = -swing * 0.8;
            this.rightArm.rotation.x = swing * 0.8;

            // Subtle body bounce
            this.torso.position.y = 1.0 + Math.abs(swing) * 0.08;
            this.head.position.y = 1.65 + Math.abs(swing) * 0.06;
        }
    }
}

// --- 3D OBSTACLE CLASS ---
class Obstacle3D {
    constructor() {
        this.z = -280; // Spawn far in the distance
        
        // 0: LOW spiked glowing block (jump)
        // 1: HIGH suspended horizontal laser gate (slide)
        // 2: TALL massive wireframe blocks (double jump)
        this.type = Math.floor(Math.random() * 3);
        
        this.dodged = false;

        this.buildObstacleMesh();
    }

    buildObstacleMesh() {
        this.group = new THREE.Group();
        
        if (this.type === 0) {
            // Low spiked cyber cube
            this.width = 1.6;
            this.height = 0.75;
            this.depth = 1.4;
            
            const boxGeo = new THREE.BoxGeometry(this.width, this.height, this.depth);
            const boxMat = new THREE.MeshStandardMaterial({
                color: 0x11020c,
                roughness: 0.1,
                metalness: 0.9,
                emissive: COLOR_PINK,
                emissiveIntensity: 0.9
            });
            const mesh = new THREE.Mesh(boxGeo, boxMat);
            mesh.position.y = this.height / 2;
            this.group.add(mesh);
        } 
        
        else if (this.type === 1) {
            // Suspended neon laser gate
            this.width = 10;
            this.height = 0.4;
            this.depth = 0.4;
            
            // Horizontal cylinder glowing beam
            const cylinderGeo = new THREE.CylinderGeometry(0.18, 0.18, this.width, 8);
            const laserMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });
            const laserMesh = new THREE.Mesh(cylinderGeo, laserMat);
            laserMesh.rotation.z = Math.PI / 2;
            laserMesh.position.y = 2.1; // Float high
            this.group.add(laserMesh);

            // Left side neon pole
            const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
            const poleMat = new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.9 });
            const pLeft = new THREE.Mesh(poleGeo, poleMat);
            pLeft.position.set(-this.width / 2, 2.0, 0);
            this.group.add(pLeft);

            const pRight = pLeft.clone();
            pRight.position.x = this.width / 2;
            this.group.add(pRight);

            // Adjust hitbox variables
            this.yMin = 1.95; 
            this.yMax = 2.25;
        } 
        
        else {
            // Tall neon electric gate
            this.width = 2.2;
            this.height = 1.95;
            this.depth = 1.2;

            const tallGeo = new THREE.BoxGeometry(this.width, this.height, this.depth);
            const tallMat = new THREE.MeshStandardMaterial({
                color: 0x05010b,
                roughness: 0.2,
                metalness: 0.9,
                emissive: COLOR_PURPLE,
                emissiveIntensity: 1.2,
                wireframe: true
            });
            const mesh = new THREE.Mesh(tallGeo, tallMat);
            mesh.position.y = this.height / 2;
            this.group.add(mesh);
        }

        // Place on the center of the road
        this.group.position.set(0, 0, this.z);
        scene.add(this.group);
    }

    update(dt) {
        this.z += gameSpeed * dt;
        this.group.position.z = this.z;
    }

    destroy() {
        scene.remove(this.group);
        // Recursively dispose geometries and materials
        this.group.traverse(node => {
            if (node.isMesh) {
                node.geometry.dispose();
                node.material.dispose();
            }
        });
    }
}

// --- COLLISION DETECTION IN 3D ---
function checkCollision3D(p, o) {
    const pZ = p.group.position.z;
    const pX = p.group.position.x;
    
    // Check if obstacle is aligned in Z-axis range of runner
    const halfD = o.depth / 2;
    if (Math.abs(o.z - pZ) > halfD + 0.3) {
        return false;
    }

    // Checking collision along X and Y axes
    if (o.type === 0) {
        // Low hurdle: overlap player y height bounds
        return (p.y < o.height);
    } 
    
    else if (o.type === 1) {
        // High laser: collision if player is NOT sliding
        return (!p.isSliding);
    } 
    
    else {
        // Tall wall: overlap player y height bounds
        return (p.y + p.height > 0.1 && p.y < o.height);
    }
}

// --- DYNAMIC INPUT EVENTS ---
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

// Desktop Listeners
window.addEventListener('keydown', (e) => {
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
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        stopSlide();
    }
});

// Touch buttons
mobileJumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); triggerJump(); });
mobileSlideBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startSlide(); });
mobileSlideBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopSlide(); });

// Mouse emulation for desktop testing
mobileJumpBtn.addEventListener('mousedown', (e) => { e.preventDefault(); triggerJump(); });
mobileSlideBtn.addEventListener('mousedown', (e) => { e.preventDefault(); startSlide(); });
window.addEventListener('mouseup', () => { stopSlide(); });

// --- GAME STATE FLOWS ---
function init() {
    // Clear old entities
    obstacles.forEach(o => o.destroy());
    particles.forEach(p => p.destroy());
    
    score = 0;
    gameSpeed = 35;
    distanceRun = 0;
    obstacleTimer = 0;
    cameraShake = 0;
    obstacles = [];
    particles = [];

    // Reset player position
    player.y = 0.1;
    player.vy = 0;
    player.isJumping = false;
    player.isDoubleJumping = false;
    player.slide(false);

    currentScoreEl.textContent = '00000';
    comboText.textContent = '1.0x';
}

function startGame() {
    init();
    gameState = 'PLAYING';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
}

function gameOver() {
    gameState = 'GAMEOVER';
    cameraShake = 1.8;
    
    // Spawn red sparks representing a system crash
    spawnSparks3D(player.group.position.x, player.group.position.y + 0.8, player.group.position.z, COLOR_RED);
    
    if (navigator.vibrate) {
        navigator.vibrate(250);
    }

    const finalScore = Math.floor(score);
    finalScoreEl.textContent = finalScore;
    
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('cyber_parkour_3d_highscore', highScore);
        highScoreEl.textContent = String(highScore).padStart(5, '0');
        newRecordTag.classList.remove('hidden');
    } else {
        newRecordTag.classList.add('hidden');
    }
    
    bestScoreEl.textContent = highScore;
    
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 600);
}

// UI Buttons Click
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// --- MAIN 3D GAMELOOP ---
function tick() {
    requestAnimationFrame(tick);
    
    const dt = Math.min(0.03, clock.getDelta()); // Cap delta time for clean physics

    if (gameState === 'PLAYING') {
        // 1. Texture-scroll the ground grid backward
        if (groundGrid) {
            groundGrid.material.map.offset.y -= gameSpeed * 0.00045 * (dt / 0.016);
        }

        // 2. Parallax skyscrapers loop
        buildings.forEach(b => {
            b.mesh.position.z += gameSpeed * 0.45 * dt;
            // Recycle building to far distance once it exits behind camera
            if (b.mesh.position.z > 25) {
                b.mesh.position.z = -450 - Math.random() * 50;
                b.mesh.position.x = b.side * (18 + Math.random() * 40);
                
                const isPink = Math.random() < 0.5;
                b.mesh.material.emissive.setHex(isPink ? COLOR_PINK : COLOR_PURPLE);
            }
        });

        // 3. Spawning Obstacles
        obstacleTimer += dt;
        if (obstacleTimer >= nextObstacleTime) {
            obstacles.push(new Obstacle3D());
            obstacleTimer = 0;
            // Delay gets shorter as velocity increases
            nextObstacleTime = Math.max(0.65, 1.85 - (gameSpeed * 0.015) + Math.random() * 0.4);
        }

        // 4. Update Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const o = obstacles[i];
            o.update(dt);

            // Check Bounding Collision
            if (checkCollision3D(player, o)) {
                gameOver();
                return;
            }

            // Successfully passed
            if (o.z > player.group.position.z + 1.0 && !o.dodged) {
                o.dodged = true;
                score += 150;
                
                // Speed multiplier combo display
                const combo = (1 + (gameSpeed - 35) * 0.03).toFixed(1);
                comboText.textContent = combo + 'x';

                // Golden flash sparks
                spawnSparks3D(0, player.group.position.y + 0.5, o.z, COLOR_GOLD);
            }

            // Recycle far offscreen obstacles
            if (o.z > 15) {
                o.destroy();
                obstacles.splice(i, 1);
            }
        }

        // 5. Update Player Physics & Anims
        player.update(dt);

        // 6. Slowly accelerate runner
        distanceRun += dt;
        score += dt * 15;
        if (gameSpeed < MAX_SPEED) {
            gameSpeed += 0.25 * dt;
        }

        currentScoreEl.textContent = String(Math.floor(score)).padStart(5, '0');
    }

    // 7. Particle system update (Common across all states)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        if (p.life <= 0) {
            p.destroy();
            particles.splice(i, 1);
        }
    }

    // 8. Dynamic Chase Camera Position
    if (player) {
        // Interpolate camera to sit behind the player's Y level smoothly (lerp)
        const targetCamY = player.isSliding ? 3.0 : 4.5 + (player.y - 0.1) * 0.4;
        camera.position.y += (targetCamY - camera.position.y) * 0.1;
        
        // Tilt camera slightly to look downward or upward based on runner's altitude
        const targetLookY = 1.5 + (player.y - 0.1) * 0.2;
        camera.lookAt(0, targetLookY, 0);

        // Apply screen shake on crash
        if (cameraShake > 0) {
            camera.position.x = (Math.random() - 0.5) * cameraShake;
            camera.position.y += (Math.random() - 0.5) * cameraShake;
            cameraShake -= dt * 4;
        } else {
            camera.position.x = 0;
        }
    }

    // Render WebGL frame
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Window resizing
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Bootstrap WebGL Scene
initThree();
requestAnimationFrame(tick);
