/**
 * Cyber Forest Parkour 3D - Breathtaking 3D WebGL Forest Runner
 * Powered by Three.js. 3-Lane Horizontal Steering.
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
const mobileLeftBtn = document.getElementById('mobileLeftBtn');
const mobileRightBtn = document.getElementById('mobileRightBtn');
const mobileSlideBtn = document.getElementById('mobileSlideBtn');
const mobileJumpBtn = document.getElementById('mobileJumpBtn');

// --- THREE.JS SCENE SETUP ---
let scene, camera, renderer;
let clock = new THREE.Clock();

// Game Parameters
let gameState = 'START';
let score = 0;
let highScore = parseInt(localStorage.getItem('cyber_forest_3d_highscore')) || 0;
let gameSpeed = 38; // Z-axis speed
const MAX_SPEED = 80;
let distanceRun = 0;
let obstacleTimer = 0;
let nextObstacleTime = 1.6; // Spawning interval in seconds
let cameraShake = 0;

// Entities
let player;
let obstacles = [];
let trees = [];
let fireflies = [];
let particles = [];
let groundPath;

// Bounding lane coordinates (3 Lanes: Left, Center, Right)
const LANE_WIDTH = 2.2;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];

// Cyber Forest Color Palette
const COLOR_GREEN = 0x39ff14;
const COLOR_CYAN = 0x00f0ff;
const COLOR_PINK = 0xff007f;
const COLOR_PURPLE = 0x8b00ff;
const COLOR_GOLD = 0xffbe0b;
const COLOR_RED = 0xff3333;
const COLOR_FOREST_MIST = 0x07150e; // Misty deep forest backdrop

highScoreEl.textContent = String(highScore).padStart(5, '0');

function initThree() {
    // 1. Create Scene & Misty Green Forest Fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLOR_FOREST_MIST);
    scene.fog = new THREE.FogExp2(COLOR_FOREST_MIST, 0.015);

    // 2. Setup Perspective Chase Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4.2, 9.0);
    camera.lookAt(0, 1.2, 0);

    // 3. WebGL Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // 4. Lights (Moody Greenish ambience)
    const ambientLight = new THREE.AmbientLight(0x0a2214, 0.7);
    scene.add(ambientLight);

    const greenDirLight = new THREE.DirectionalLight(0x22ff66, 1.2);
    greenDirLight.position.set(-10, 20, 10);
    scene.add(greenDirLight);

    const cyanDirLight = new THREE.DirectionalLight(COLOR_CYAN, 0.8);
    cyanDirLight.position.set(10, 15, -10);
    scene.add(cyanDirLight);

    // 5. Build Scrolling Forest Ground Path
    createForestPath();

    // 6. Generate 3D Trees & Glowing Fireflies
    create3DForest();

    // 7. Instantiate 3D Player
    player = new Player3D();
}

// Procedural scrolling dirt/neon forest runway
function createForestPath() {
    const width = 10;
    const length = 500;
    
    // Create dark green textured path in canvas memory
    const pathCanvas = document.createElement('canvas');
    pathCanvas.width = 128;
    pathCanvas.height = 128;
    const pctx = pathCanvas.getContext('2d');
    
    pctx.fillStyle = '#060e0a';
    pctx.fillRect(0, 0, 128, 128);
    
    // Glowing neon green lane delimiters
    pctx.strokeStyle = 'rgba(57, 255, 20, 0.25)';
    pctx.lineWidth = 4;
    pctx.beginPath();
    pctx.moveTo(42, 0); pctx.lineTo(42, 128);
    pctx.moveTo(86, 0); pctx.lineTo(86, 128);
    pctx.stroke();

    // Side glowing rails
    pctx.strokeStyle = '#39ff14';
    pctx.lineWidth = 6;
    pctx.strokeRect(0, 0, 128, 128);
    
    const pathTexture = new THREE.CanvasTexture(pathCanvas);
    pathTexture.wrapS = THREE.RepeatWrapping;
    pathTexture.wrapT = THREE.RepeatWrapping;
    pathTexture.repeat.set(1, length / 4);

    const groundGeo = new THREE.PlaneGeometry(width, length);
    const groundMat = new THREE.MeshStandardMaterial({
        map: pathTexture,
        roughness: 0.3,
        metalness: 0.6,
        emissive: 0x051a0d,
        emissiveIntensity: 0.4
    });

    groundPath = new THREE.Mesh(groundGeo, groundMat);
    groundPath.rotation.x = -Math.PI / 2;
    groundPath.position.set(0, 0, -length / 3);
    scene.add(groundPath);

    // Flanking neon boundary wire cylinders
    const wireGeo = new THREE.CylinderGeometry(0.08, 0.08, length, 8);
    const wireMat = new THREE.MeshBasicMaterial({ color: COLOR_GREEN });
    
    const wireLeft = new THREE.Mesh(wireGeo, wireMat);
    wireLeft.rotation.x = Math.PI / 2;
    wireLeft.position.set(-width / 2, 0.04, -length / 2);
    scene.add(wireLeft);

    const wireRight = wireLeft.clone();
    wireRight.position.x = width / 2;
    scene.add(wireRight);
}

// Procedural Low-Poly Tree Generator & Fireflies Spawner
function create3DForest() {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 4.5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0c, roughness: 0.9, flatShading: true });
    
    // Stylized low-poly stacked pine cones geometry
    const leavesMat1 = new THREE.MeshStandardMaterial({ color: 0x0c331a, roughness: 0.8, flatShading: true });
    const leavesMat2 = new THREE.MeshStandardMaterial({ color: 0x124d27, roughness: 0.8, flatShading: true });
    const neonLeavesMat = new THREE.MeshStandardMaterial({ color: COLOR_GREEN, emissive: COLOR_GREEN, emissiveIntensity: 0.35, flatShading: true });
    
    // Generate scattered 3D Trees flanking the forest path
    for (let i = 0; i < 40; i++) {
        const treeGroup = new THREE.Group();
        
        // 1. Trunk
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2.25;
        treeGroup.add(trunk);
        
        // 2. Stacked Pine Foliage (3 layered cones)
        const leafGeo1 = new THREE.ConeGeometry(1.6, 2.0, 5);
        const leafGeo2 = new THREE.ConeGeometry(1.2, 1.6, 5);
        const leafGeo3 = new THREE.ConeGeometry(0.8, 1.2, 5);
        
        // Select shades of green (some glow neon green!)
        const isNeon = Math.random() < 0.25;
        const leafMat = isNeon ? neonLeavesMat : (Math.random() < 0.5 ? leavesMat1 : leavesMat2);
        
        const leaves1 = new THREE.Mesh(leafGeo1, leafMat);
        leaves1.position.y = 3.6;
        treeGroup.add(leaves1);

        const leaves2 = new THREE.Mesh(leafGeo2, leafMat);
        leaves2.position.y = 4.8;
        treeGroup.add(leaves2);

        const leaves3 = new THREE.Mesh(leafGeo3, leafMat);
        leaves3.position.y = 5.8;
        treeGroup.add(leaves3);

        // Position on left or right flanks
        const side = Math.random() < 0.5 ? -1 : 1;
        const xPos = side * (5.5 + Math.random() * 25);
        const zPos = -Math.random() * 450 - 50;
        
        // Random scaling for natural variety
        const scaleVal = 0.8 + Math.random() * 0.7;
        treeGroup.scale.set(scaleVal, scaleVal, scaleVal);
        treeGroup.position.set(xPos, 0, zPos);
        
        scene.add(treeGroup);
        trees.push({
            mesh: treeGroup,
            side: side,
            scale: scaleVal,
            originalX: xPos
        });
    }

    // 3. Spawning Magical Glowing Yellow Fireflies
    const ffGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const ffMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    
    for (let i = 0; i < 35; i++) {
        const firefly = new THREE.Mesh(ffGeo, ffMat);
        // Distribute them inside the scene corridor
        const x = (Math.random() - 0.5) * 20;
        const y = 0.5 + Math.random() * 4.5;
        const z = -Math.random() * 450 - 20;
        firefly.position.set(x, y, z);
        
        scene.add(firefly);
        fireflies.push({
            mesh: firefly,
            timeOffset: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.5
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
    for (let i = 0; i < 15; i++) {
        const vx = (Math.random() - 0.5) * 14;
        const vy = Math.random() * 16 + 2;
        const vz = gameSpeed * 0.35 + (Math.random() - 0.5) * 15;
        const size = 0.12 + Math.random() * 0.15;
        const life = 0.35 + Math.random() * 0.4;
        
        particles.push(new Particle3D(x, y, z, vx, vy, vz, color, size, life));
    }
}

// --- 3D PLAYER CLASS WITH 3-LANE HORIZONTAL STEERING ---
class Player3D {
    constructor() {
        this.group = new THREE.Group();
        scene.add(this.group);

        // Core Physics
        this.y = 0.1;
        this.vy = 0;
        this.gravity = -54; // Gravitational force
        this.jumpForce = 21.5;
        
        // Lane settings
        this.currentLane = 0; // -1: Left, 0: Center, 1: Right
        this.targetX = 0;
        this.laneSpeed = 16; // Lerp sliding speed

        this.isJumping = false;
        this.isDoubleJumping = false;
        this.isSliding = false;
        this.animTime = 0;

        // Bounding hitbox size
        this.width = 0.9;
        this.height = 1.6;
        this.depth = 1.0;

        this.buildRobotMesh();
    }

    buildRobotMesh() {
        // High-quality materials
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3, metalness: 0.7 });
        const neonGreenMat = new THREE.MeshStandardMaterial({ color: COLOR_GREEN, emissive: COLOR_GREEN, emissiveIntensity: 0.8 });
        const cyberMat = new THREE.MeshStandardMaterial({ color: COLOR_CYAN, emissive: COLOR_CYAN, emissiveIntensity: 0.5 });
        
        // 1. Torso
        const torsoGeo = new THREE.BoxGeometry(0.75, 0.9, 0.48);
        this.torso = new THREE.Mesh(torsoGeo, skinMat);
        this.torso.position.y = 1.0;
        this.group.add(this.torso);

        // Core light
        const coreGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 8);
        this.chestCore = new THREE.Mesh(coreGeo, neonGreenMat);
        this.chestCore.rotation.x = Math.PI / 2;
        this.chestCore.position.set(0, 1.1, 0.25);
        this.group.add(this.chestCore);

        // 2. Head
        const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
        this.head = new THREE.Mesh(headGeo, skinMat);
        this.head.position.y = 1.65;
        this.group.add(this.head);

        // Visor (Cyan glowing glasses)
        const visorGeo = new THREE.BoxGeometry(0.46, 0.12, 0.15);
        this.visor = new THREE.Mesh(visorGeo, cyberMat);
        this.visor.position.set(0, 1.7, 0.16);
        this.group.add(this.visor);

        // 3. Limbs
        const limbGeo = new THREE.BoxGeometry(0.18, 0.5, 0.18);
        
        this.leftArm = new THREE.Mesh(limbGeo, neonGreenMat);
        this.leftArm.position.set(-0.52, 1.0, 0);
        this.group.add(this.leftArm);

        this.rightArm = new THREE.Mesh(limbGeo, neonGreenMat);
        this.rightArm.position.set(0.52, 1.0, 0);
        this.group.add(this.rightArm);

        this.leftLeg = new THREE.Mesh(limbGeo, skinMat);
        this.leftLeg.position.set(-0.22, 0.35, 0);
        this.group.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(limbGeo, skinMat);
        this.rightLeg.position.set(0.22, 0.35, 0);
        this.group.add(this.rightLeg);
    }

    steerLeft() {
        if (this.currentLane > -1) {
            this.currentLane--;
            this.targetX = LANES[this.currentLane + 1]; // Offset index mapping
            // Spawn little side drift sparks
            spawnSparks3D(this.group.position.x, this.y + 0.2, this.group.position.z, COLOR_CYAN);
        }
    }

    steerRight() {
        if (this.currentLane < 1) {
            this.currentLane++;
            this.targetX = LANES[this.currentLane + 1];
            spawnSparks3D(this.group.position.x, this.y + 0.2, this.group.position.z, COLOR_CYAN);
        }
    }

    jump() {
        if (!this.isJumping) {
            this.vy = this.jumpForce;
            this.isJumping = true;
            this.isSliding = false;
            spawnSparks3D(this.group.position.x, this.y, this.group.position.z, COLOR_GREEN);
        } else if (!this.isDoubleJumping) {
            this.vy = this.jumpForce * 0.85;
            this.isDoubleJumping = true;
            
            // Double jump green shockwave particles
            for (let i = 0; i < 22; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 14 + 6;
                const vx = Math.cos(angle) * speed;
                const vz = Math.sin(angle) * speed;
                particles.push(new Particle3D(
                    this.group.position.x,
                    this.group.position.y + 0.8,
                    this.group.position.z,
                    vx, 0, vz,
                    COLOR_GREEN, 0.12, 0.45
                ));
            }
        }
    }

    slide(active) {
        if (active) {
            if (!this.isJumping) {
                this.isSliding = true;
                this.height = 0.75;
                // Bend mesh forward for sliding
                this.group.rotation.x = -Math.PI / 2.5;
                this.group.position.y = 0.3;
            }
        } else {
            this.isSliding = false;
            this.height = 1.6;
            this.group.rotation.x = 0;
            this.group.position.y = this.y;
        }
    }

    update(dt) {
        // Apply vertical physics
        this.vy += this.gravity * dt;
        this.y += this.vy * dt;

        if (this.y <= 0.1) {
            this.y = 0.1;
            this.vy = 0;
            this.isJumping = false;
            this.isDoubleJumping = false;
        }

        // Apply visual Y position
        if (!this.isSliding) {
            this.group.position.y = this.y;
        }

        // Smooth horizontal steering (lerp along X axis)
        const currentTargetX = LANES[this.currentLane + 1];
        this.group.position.x += (currentTargetX - this.group.position.x) * this.laneSpeed * dt;

        // running leg swings
        this.animTime += dt * gameSpeed * 0.35;
        
        if (this.isSliding) {
            // Slide sparks
            if (Math.random() < 0.3) {
                particles.push(new Particle3D(
                    this.group.position.x + (Math.random() - 0.5) * 0.4,
                    0.05,
                    this.group.position.z + 0.25,
                    (Math.random() - 0.5) * 6,
                    Math.random() * 3,
                    gameSpeed * 0.4,
                    COLOR_PINK, 0.1, 0.35
                ));
            }
        } else if (this.isJumping) {
            this.leftLeg.rotation.x = -0.6;
            this.rightLeg.rotation.x = -0.6;
            this.leftArm.rotation.x = 0.6;
            this.rightArm.rotation.x = 0.6;
        } else {
            const swing = Math.sin(this.animTime);
            this.leftLeg.rotation.x = swing * 0.8;
            this.rightLeg.rotation.x = -swing * 0.8;
            this.leftArm.rotation.x = -swing * 0.8;
            this.rightArm.rotation.x = swing * 0.8;

            // Soft body bobbing
            this.torso.position.y = 1.0 + Math.abs(swing) * 0.08;
            this.head.position.y = 1.65 + Math.abs(swing) * 0.06;
        }
    }
}

// --- 3D OBSTACLE CLASS FOR LEL/RIGHT/CENTER LANES ---
class Obstacle3D {
    constructor() {
        this.z = -280; // Spawn in far distance
        this.lane = Math.floor(Math.random() * 3) - 1; // Random Lane: -1 (Left), 0 (Center), 1 (Right)
        
        // 0: LOW spiked glowing block (jump over / lane steer)
        // 1: HIGH hanging laser beam (slide under / lane steer)
        // 2: TALL neon electric grid wall (double-jump over / lane steer)
        this.type = Math.floor(Math.random() * 3);
        
        this.dodged = false;

        this.buildObstacleMesh();
    }

    buildObstacleMesh() {
        this.group = new THREE.Group();
        
        if (this.type === 0) {
            // Low spiked block
            this.width = 1.5;
            this.height = 0.72;
            this.depth = 1.3;
            
            const boxGeo = new THREE.BoxGeometry(this.width, this.height, this.depth);
            const boxMat = new THREE.MeshStandardMaterial({
                color: 0x0a0208,
                roughness: 0.1,
                metalness: 0.9,
                emissive: COLOR_PINK,
                emissiveIntensity: 1.0
            });
            const mesh = new THREE.Mesh(boxGeo, boxMat);
            mesh.position.y = this.height / 2;
            this.group.add(mesh);
        } 
        
        else if (this.type === 1) {
            // Suspended horizontal neon laser gate (covers only this lane!)
            this.width = 2.6;
            this.height = 0.35;
            this.depth = 0.35;
            
            const cylinderGeo = new THREE.CylinderGeometry(0.15, 0.15, this.width, 8);
            const laserMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });
            const laserMesh = new THREE.Mesh(cylinderGeo, laserMat);
            laserMesh.rotation.z = Math.PI / 2;
            laserMesh.position.y = 2.05; // Float height
            this.group.add(laserMesh);

            // Left/Right thin structural poles
            const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 8);
            const poleMat = new THREE.MeshStandardMaterial({ color: 0x111116, metalness: 0.9 });
            
            const pLeft = new THREE.Mesh(poleGeo, poleMat);
            pLeft.position.set(-this.width / 2, 1.9, 0);
            this.group.add(pLeft);

            const pRight = pLeft.clone();
            pRight.position.x = this.width / 2;
            this.group.add(pRight);

            this.yMin = 1.9;
            this.yMax = 2.2;
        } 
        
        else {
            // Tall wireframe block
            this.width = 1.8;
            this.height = 1.95;
            this.depth = 1.1;

            const tallGeo = new THREE.BoxGeometry(this.width, this.height, this.depth);
            const tallMat = new THREE.MeshStandardMaterial({
                color: 0x010704,
                roughness: 0.2,
                metalness: 0.9,
                emissive: COLOR_PURPLE,
                emissiveIntensity: 1.3,
                wireframe: true
            });
            const mesh = new THREE.Mesh(tallGeo, tallMat);
            mesh.position.y = this.height / 2;
            this.group.add(mesh);
        }

        // Place obstacle on the specific lane X coordinate
        const spawnX = LANES[this.lane + 1];
        this.group.position.set(spawnX, 0, this.z);
        scene.add(this.group);
    }

    update(dt) {
        this.z += gameSpeed * dt;
        this.group.position.z = this.z;
    }

    destroy() {
        scene.remove(this.group);
        this.group.traverse(node => {
            if (node.isMesh) {
                node.geometry.dispose();
                node.material.dispose();
            }
        });
    }
}

// --- COLLISION DETECTION INTEGRATING LANES ---
function checkCollision3D(p, o) {
    const pZ = p.group.position.z;
    const pX = p.group.position.x;
    
    // 1. Z-axis overlapping check
    const halfD = o.depth / 2;
    if (Math.abs(o.z - pZ) > halfD + 0.3) {
        return false;
    }

    // 2. X-axis overlapping check (checks absolute difference to handle sliding transitions!)
    const oX = LANES[o.lane + 1];
    if (Math.abs(pX - oX) > (p.width / 2 + o.width / 2 - 0.25)) {
        return false;
    }

    // 3. Y-axis height checks
    if (o.type === 0) {
        return (p.y < o.height);
    } 
    
    else if (o.type === 1) {
        return (!p.isSliding);
    } 
    
    else {
        return (p.y + p.height > 0.1 && p.y < o.height);
    }
}

// --- INPUT TRIGGERS ---
function steerLeft() {
    if (gameState === 'PLAYING') {
        player.steerLeft();
    }
}

function steerRight() {
    if (gameState === 'PLAYING') {
        player.steerRight();
    }
}

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

// Keyboard Inputs (A/D and Left/Right Arrows for steering)
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        steerLeft();
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        steerRight();
    }
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

// Upgraded 4 mobile touchscreen click/touch bindings
mobileLeftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); steerLeft(); });
mobileRightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); steerRight(); });
mobileJumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); triggerJump(); });
mobileSlideBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startSlide(); });
mobileSlideBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopSlide(); });

// Mouse emulation support for desktop simulator testing
mobileLeftBtn.addEventListener('mousedown', (e) => { e.preventDefault(); steerLeft(); });
mobileRightBtn.addEventListener('mousedown', (e) => { e.preventDefault(); steerRight(); });
mobileJumpBtn.addEventListener('mousedown', (e) => { e.preventDefault(); triggerJump(); });
mobileSlideBtn.addEventListener('mousedown', (e) => { e.preventDefault(); startSlide(); });
window.addEventListener('mouseup', () => { stopSlide(); });

// --- GAME STATE FLOWS ---
function init() {
    obstacles.forEach(o => o.destroy());
    particles.forEach(p => p.destroy());
    
    score = 0;
    gameSpeed = 38;
    distanceRun = 0;
    obstacleTimer = 0;
    cameraShake = 0;
    obstacles = [];
    particles = [];

    // Reset player position & lane
    player.y = 0.1;
    player.vy = 0;
    player.currentLane = 0;
    player.group.position.x = 0;
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
    cameraShake = 1.9;
    
    // Spawn red sparks representing a system crash
    spawnSparks3D(player.group.position.x, player.group.position.y + 0.8, player.group.position.z, COLOR_RED);
    
    if (navigator.vibrate) {
        navigator.vibrate(250);
    }

    const finalScore = Math.floor(score);
    finalScoreEl.textContent = finalScore;
    
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('cyber_forest_3d_highscore', highScore);
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

// UI Buttons Connect
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// --- MAIN 3D FOREST GAMELOOP ---
function tick() {
    requestAnimationFrame(tick);
    
    const dt = Math.min(0.03, clock.getDelta());

    if (gameState === 'PLAYING') {
        // 1. Scroll forest path backward
        if (groundPath) {
            groundPath.material.map.offset.y -= gameSpeed * 0.00045 * (dt / 0.016);
        }

        // 2. Parallax forest trees loop
        trees.forEach(t => {
            t.mesh.position.z += gameSpeed * 0.45 * dt;
            // Recycle tree far away once it exits camera viewport
            if (t.mesh.position.z > 25) {
                t.mesh.position.z = -450 - Math.random() * 50;
                t.mesh.position.x = t.side * (5.5 + Math.random() * 25);
            }
        });

        // 3. Drift yellow fireflies around organically
        const time = clock.getElapsedTime();
        fireflies.forEach(f => {
            f.mesh.position.z += gameSpeed * 0.45 * dt;
            // Slight organic horizontal/vertical drift using math waves
            f.mesh.position.x += Math.sin(time * f.speed + f.timeOffset) * 0.03;
            f.mesh.position.y += Math.cos(time * f.speed + f.timeOffset) * 0.015;

            // Recycle fireflies once they exit behind camera
            if (f.mesh.position.z > 20) {
                f.mesh.position.z = -450 - Math.random() * 30;
                f.mesh.position.x = (Math.random() - 0.5) * 20;
                f.mesh.position.y = 0.5 + Math.random() * 4.5;
            }
        });

        // 4. Spawning obstacles
        obstacleTimer += dt;
        if (obstacleTimer >= nextObstacleTime) {
            obstacles.push(new Obstacle3D());
            obstacleTimer = 0;
            // Faster spawn rate at high speeds
            nextObstacleTime = Math.max(0.6, 1.7 - (gameSpeed * 0.014) + Math.random() * 0.35);
        }

        // 5. Update Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const o = obstacles[i];
            o.update(dt);

            // Bounding collision checks
            if (checkCollision3D(player, o)) {
                gameOver();
                return;
            }

            // Dodged score trigger
            if (o.z > player.group.position.z + 1.0 && !o.dodged) {
                o.dodged = true;
                score += 180; // Extra points for 3D steering dodges!
                
                const combo = (1 + (gameSpeed - 38) * 0.03).toFixed(1);
                comboText.textContent = combo + 'x';

                spawnSparks3D(o.group.position.x, player.group.position.y + 0.5, o.z, COLOR_GOLD);
            }

            // Clear offscreen obstacles
            if (o.z > 15) {
                o.destroy();
                obstacles.splice(i, 1);
            }
        }

        // 6. Update Player Sideways & Vertical Physics
        player.update(dt);

        // 7. Accelerate runner
        distanceRun += dt;
        score += dt * 18;
        if (gameSpeed < MAX_SPEED) {
            gameSpeed += 0.28 * dt;
        }

        currentScoreEl.textContent = String(Math.floor(score)).padStart(5, '0');
    }

    // 8. Particle engine update
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        if (p.life <= 0) {
            p.destroy();
            particles.splice(i, 1);
        }
    }

    // 9. Chase Camera Follow
    if (player) {
        // Interpolate Y value based on jump/slide state
        const targetCamY = player.isSliding ? 2.8 : 4.2 + (player.y - 0.1) * 0.4;
        camera.position.y += (targetCamY - camera.position.y) * 0.1;
        
        // Target focus adjustments
        const targetLookY = 1.3 + (player.y - 0.1) * 0.25;
        camera.lookAt(0, targetLookY, 0);

        // Shake camera on crashed state
        if (cameraShake > 0) {
            camera.position.x = (Math.random() - 0.5) * cameraShake;
            camera.position.y += (Math.random() - 0.5) * cameraShake;
            cameraShake -= dt * 4;
        } else {
            camera.position.x = 0;
        }
    }

    // Render WebGL Frame
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Aspect ratio resize handler
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Bootstrap Forest Scene
initThree();
requestAnimationFrame(tick);
