/**
 * Cyber Forest Sky Islands 3D - Breathtaking 3D WebGL Forest Runner
 * Floating Sky Islands & Space Ninja with Flowing Cape.
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
let highScore = parseInt(localStorage.getItem('cyber_sky_high_highscore')) || 0;
let gameSpeed = 38; // Z-axis speed
const MAX_SPEED = 82;
let distanceRun = 0;
let obstacleTimer = 0;
let nextObstacleTime = 1.6; // Spawning interval in seconds
let cameraShake = 0;

// Entities
let player;
let obstacles = [];
let skyIslands = []; // Floating islands in the sky!
let clouds = [];
let pollen = [];
let particles = [];
let groundPath;

// Bounding lane coordinates (3 Lanes: Left, Center, Right)
const LANE_WIDTH = 2.2;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];

// Color Palette
const COLOR_GREEN = 0x39ff14;
const COLOR_CYAN = 0x00f0ff;
const COLOR_PINK = 0xff007f;
const COLOR_PURPLE = 0x8b00ff;
const COLOR_GOLD = 0xffbe0b;
const COLOR_RED = 0xff3333;

// Radiant Sky & Sunlit Mist
const COLOR_SKY_BLUE = 0x5fa9f8;
const COLOR_SUN_MIST = 0x9ed2ff;

highScoreEl.textContent = String(highScore).padStart(5, '0');

function initThree() {
    // 1. Create Scene with Beautiful Blue Sky & Light Sunlit Mist
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLOR_SKY_BLUE);
    scene.fog = new THREE.FogExp2(COLOR_SUN_MIST, 0.007); // Light fog to see sky elements

    // 2. Setup Perspective Chase Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4.2, 9.0);
    camera.lookAt(0, 1.2, 0);

    // 3. WebGL Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // 4. Warm Day Lights (Powerful Sun representing daylight)
    const ambientLight = new THREE.AmbientLight(0xeef6ff, 0.95); // Bright daytime fill light
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.6);
    sunLight.position.set(15, 45, 15);
    scene.add(sunLight);

    // Secondary soft skylight fill
    const skyLight = new THREE.DirectionalLight(0xaad3ff, 0.6);
    skyLight.position.set(-15, 20, -10);
    scene.add(skyLight);

    // 5. Build Scrolling Forest Ground Path (Lush Meadows + Central Dirt Road)
    createForestPath();

    // 6. Generate 3D Fluffy Clouds (High in Sky)
    create3DClouds();

    // 7. Generate 3D Floating Sky Islands (Uchar Orollar) & Floating Pollen
    create3DSkyIslands();

    // 8. Instantiate 3D Player (Space Ninja with flowing cape!)
    player = new Player3D();
}

// Procedural scrolling dirt/neon forest runway flanked by wide green grassy banks ("ko'p yer qo'sh")
function createForestPath() {
    const width = 16; // Widen path for expanded grassy valley feel
    const length = 500;
    
    // Create grassy meadow path in canvas memory
    const pathCanvas = document.createElement('canvas');
    pathCanvas.width = 256;
    pathCanvas.height = 128;
    const pctx = pathCanvas.getContext('2d');
    
    // Rich bright grass flanking sides
    pctx.fillStyle = '#27ae60'; 
    pctx.fillRect(0, 0, 256, 128);
    
    // Central earthy dirt lane path
    pctx.fillStyle = '#4e3629';
    pctx.fillRect(72, 0, 112, 128);
    
    // Sunlit bright neon green lane delimiters
    pctx.strokeStyle = 'rgba(57, 255, 20, 0.55)';
    pctx.lineWidth = 4;
    pctx.beginPath();
    pctx.moveTo(102, 0); pctx.lineTo(102, 128);
    pctx.moveTo(154, 0); pctx.lineTo(154, 128);
    pctx.stroke();

    // Side glowing rails
    pctx.strokeStyle = '#39ff14';
    pctx.lineWidth = 6;
    pctx.strokeRect(70, 0, 116, 128);
    
    const pathTexture = new THREE.CanvasTexture(pathCanvas);
    pathTexture.wrapS = THREE.RepeatWrapping;
    pathTexture.wrapT = THREE.RepeatWrapping;
    pathTexture.repeat.set(1, length / 4);

    const groundGeo = new THREE.PlaneGeometry(width, length);
    const groundMat = new THREE.MeshStandardMaterial({
        map: pathTexture,
        roughness: 0.45,
        metalness: 0.25,
        emissive: 0x051d0e,
        emissiveIntensity: 0.2
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
    wireLeft.position.set(-3.6, 0.04, -length / 2); // Lane width boundary
    scene.add(wireLeft);

    const wireRight = wireLeft.clone();
    wireRight.position.x = 3.6;
    scene.add(wireRight);
}

// Procedural Fluffy Cloud Generator (Clusters of white spheres)
function create3DClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        metalness: 0.05,
        flatShading: true
    });

    // Spawn 12 large fluffy clouds high in sky
    for (let i = 0; i < 12; i++) {
        const cloudGroup = new THREE.Group();
        
        const sphereCount = 4 + Math.floor(Math.random() * 3);
        for (let s = 0; s < sphereCount; s++) {
            const radius = 1.6 + Math.random() * 1.8;
            const sGeo = new THREE.SphereGeometry(radius, 8, 8);
            const sMesh = new THREE.Mesh(sGeo, cloudMat);
            
            const xOff = (Math.random() - 0.5) * 2.8;
            const yOff = (Math.random() - 0.5) * 0.8;
            const zOff = (Math.random() - 0.5) * 2.4;
            sMesh.position.set(xOff, yOff, zOff);
            
            cloudGroup.add(sMesh);
        }

        const x = (Math.random() - 0.5) * 60;
        const y = 16 + Math.random() * 8; // Altitude
        const z = -Math.random() * 450 - 50;
        
        cloudGroup.position.set(x, y, z);
        
        const driftSpeed = 0.15 + Math.random() * 0.25;
        
        scene.add(cloudGroup);
        clouds.push({
            mesh: cloudGroup,
            speed: driftSpeed,
            originalX: x
        });
    }
}

// Procedural 3D Floating Sky Islands Generator ("daraxt osmonda bo'lib")
function create3DSkyIslands() {
    // Shared materials
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a4a42, roughness: 0.9, metalness: 0.2, flatShading: true }); // Rocky bottom
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.8, metalness: 0.1, flatShading: true }); // Grassy top
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4d3222, roughness: 0.95, flatShading: true }); // Natural wood trunk
    
    // Foliage greens
    const leavesMat1 = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.85, flatShading: true });
    const leavesMat2 = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.85, flatShading: true });

    // Spawn 22 floating sky islands alongside our runway at different heights!
    for (let i = 0; i < 22; i++) {
        const island = new THREE.Group();

        // 1. Rocky cone underside
        const rockGeo = new THREE.ConeGeometry(2.0, 3.2, 6);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.rotation.x = Math.PI; // Invert cone to point down
        rock.position.y = -1.6;
        island.add(rock);

        // 2. Grassy cylinder surface top
        const grassGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.4, 6);
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.position.y = 0;
        island.add(grass);

        // 3. Stacked pine tree growing on the island
        const trunkGeo = new THREE.CylinderGeometry(0.12, 0.22, 2.5, 6);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.25;
        island.add(trunk);

        const leafGeo1 = new THREE.ConeGeometry(1.0, 1.3, 5);
        const leafGeo2 = new THREE.ConeGeometry(0.75, 1.0, 5);
        const leafMat = Math.random() < 0.5 ? leavesMat1 : leavesMat2;

        const leaves1 = new THREE.Mesh(leafGeo1, leafMat);
        leaves1.position.y = 2.0;
        island.add(leaves1);

        const leaves2 = new THREE.Mesh(leafGeo2, leafMat);
        leaves2.position.y = 2.8;
        island.add(leaves2);

        // Position - float them alongside path
        const side = Math.random() < 0.5 ? -1 : 1;
        const xPos = side * (6.5 + Math.random() * 20);
        const yPos = 1.0 + Math.random() * 11.0; // Dynamic sky altitude
        const zPos = -Math.random() * 450 - 50;

        // Apply scale variety
        const scaleVal = 0.8 + Math.random() * 0.8;
        island.scale.set(scaleVal, scaleVal, scaleVal);
        island.position.set(xPos, yPos, zPos);

        scene.add(island);
        skyIslands.push({
            mesh: island,
            side: side,
            scale: scaleVal,
            originalX: xPos,
            yPos: yPos
        });
    }

    // 4. Spawning Magical Floating Sun Pollen (Sunlit floating sparkles)
    const pGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    
    for (let i = 0; i < 35; i++) {
        const pollenMesh = new THREE.Mesh(pGeo, pMat);
        const x = (Math.random() - 0.5) * 20;
        const y = 0.5 + Math.random() * 4.5;
        const z = -Math.random() * 450 - 20;
        pollenMesh.position.set(x, y, z);
        
        scene.add(pollenMesh);
        pollen.push({
            mesh: pollenMesh,
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

// --- 3D PLAYER CLASS: Sleek Space Ninja with Dynamic Wind-Reactive Neon Cape ("odamni o'zgartir") ---
class Player3D {
    constructor() {
        this.group = new THREE.Group();
        scene.add(this.group);

        // Core Physics
        this.y = 0.1;
        this.vy = 0;
        this.gravity = -54; 
        this.jumpForce = 21.5;
        
        // Lane settings
        this.currentLane = 0; 
        this.targetX = 0;
        this.laneSpeed = 16; 

        this.isJumping = false;
        this.isDoubleJumping = false;
        this.isSliding = false;
        this.animTime = 0;

        // Bounding hitbox size
        this.width = 0.9;
        this.height = 1.6;
        this.depth = 1.0;

        this.buildNinjaMesh();
    }

    buildNinjaMesh() {
        // Ninja-themed sleek cyber materials
        const suiteMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.15, metalness: 0.9 }); // Sleek black suit
        const neonGreenMat = new THREE.MeshStandardMaterial({ color: COLOR_GREEN, emissive: COLOR_GREEN, emissiveIntensity: 0.9 });
        const cyberMat = new THREE.MeshStandardMaterial({ color: COLOR_CYAN, emissive: COLOR_CYAN, emissiveIntensity: 0.8 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.7 });
        
        // 1. Torso (Slim sleek armor plate)
        const torsoGeo = new THREE.BoxGeometry(0.55, 0.85, 0.42);
        this.torso = new THREE.Mesh(torsoGeo, suiteMat);
        this.torso.position.y = 0.95;
        this.group.add(this.torso);

        // Core light emblem on chest
        const coreGeo = new THREE.SphereGeometry(0.12, 8, 8);
        this.chestCore = new THREE.Mesh(coreGeo, neonGreenMat);
        this.chestCore.position.set(0, 1.05, 0.22);
        this.group.add(this.chestCore);

        // 2. Sleek Space Helmet (Sphere instead of cylinder robot)
        const helmetGeo = new THREE.SphereGeometry(0.24, 12, 12);
        this.head = new THREE.Mesh(helmetGeo, skinMat);
        this.head.position.y = 1.56;
        this.group.add(this.head);

        // Cyber round Visor plate
        const visorGeo = new THREE.BoxGeometry(0.28, 0.1, 0.22);
        this.visor = new THREE.Mesh(visorGeo, cyberMat);
        this.visor.position.set(0, 1.58, 0.15);
        this.group.add(this.visor);

        // 3. Ninja flowing neon green cape (Superhero cape!)
        const capeGeo = new THREE.PlaneGeometry(0.55, 1.25);
        const capeMat = new THREE.MeshStandardMaterial({
            color: COLOR_GREEN,
            emissive: COLOR_GREEN,
            emissiveIntensity: 0.9,
            side: THREE.DoubleSide,
            roughness: 0.35
        });
        
        // Pivot group to rotate cape from the top
        this.capePivot = new THREE.Group();
        this.capePivot.position.set(0, 1.3, -0.22); // Fasten on shoulders
        this.group.add(this.capePivot);
        
        this.cape = new THREE.Mesh(capeGeo, capeMat);
        this.cape.position.y = -0.62; // Center offset to pivot correctly
        this.capePivot.add(this.cape);

        // 4. Slim athletic joints & limbs
        const limbGeo = new THREE.BoxGeometry(0.14, 0.52, 0.14);
        
        this.leftArm = new THREE.Mesh(limbGeo, cyberMat);
        this.leftArm.position.set(-0.4, 0.9, 0);
        this.group.add(this.leftArm);

        this.rightArm = new THREE.Mesh(limbGeo, cyberMat);
        this.rightArm.position.set(0.4, 0.9, 0);
        this.group.add(this.rightArm);

        this.leftLeg = new THREE.Mesh(limbGeo, suiteMat);
        this.leftLeg.position.set(-0.18, 0.32, 0);
        this.group.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(limbGeo, suiteMat);
        this.rightLeg.position.set(0.18, 0.32, 0);
        this.group.add(this.rightLeg);
    }

    steerLeft() {
        if (this.currentLane > -1) {
            this.currentLane--;
            this.targetX = LANES[this.currentLane + 1]; 
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
        this.vy += this.gravity * dt;
        this.y += this.vy * dt;

        if (this.y <= 0.1) {
            this.y = 0.1;
            this.vy = 0;
            this.isJumping = false;
            this.isDoubleJumping = false;
        }

        if (!this.isSliding) {
            this.group.position.y = this.y;
        }

        // Smooth horizontal steering
        const currentTargetX = LANES[this.currentLane + 1];
        this.group.position.x += (currentTargetX - this.group.position.x) * this.laneSpeed * dt;

        // Running swing anim time
        this.animTime += dt * gameSpeed * 0.35;
        
        // 1. DYNAMIC WIND-REACTIVE CAPE ANIMATION! (Hilpirab turadigan kiyim!)
        if (this.isSliding) {
            // Flatten cape completely flat when sliding
            this.capePivot.rotation.x = -Math.PI / 3;
            this.capePivot.rotation.y = 0;
            this.capePivot.rotation.z = 0;
        } else if (this.isJumping) {
            // Fold and flap cape down on jump ascent/descent
            this.capePivot.rotation.x = Math.PI / 2.5 + Math.sin(this.animTime * 1.8) * 0.1;
            this.capePivot.rotation.y = 0;
            this.capePivot.rotation.z = 0;
        } else {
            // Normal running flow: Waving cape raises HIGHER the faster you run! (wind drag!)
            const windFactor = (gameSpeed - 38) * 0.005; // Wind lift offset
            this.capePivot.rotation.x = Math.PI / 6 + Math.sin(this.animTime * 1.5) * 0.16 + windFactor;
            
            // Subtle roll wave
            this.capePivot.rotation.z = Math.sin(this.animTime * 0.85) * 0.05;
        }

        // 2. Limbs oscillation
        if (this.isSliding) {
            // Slide limbs
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0.4;
            this.rightArm.rotation.x = 0.4;
            
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

            this.torso.position.y = 0.95 + Math.abs(swing) * 0.08;
            this.head.position.y = 1.56 + Math.abs(swing) * 0.06;
        }
    }
}

// --- 3D OBSTACLE CLASS FOR LEFT/RIGHT/CENTER LANES ---
class Obstacle3D {
    constructor() {
        this.z = -280; 
        this.lane = Math.floor(Math.random() * 3) - 1; // Random Lane: -1 (Left), 0 (Center), 1 (Right)
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
            // Suspended horizontal neon laser gate
            this.width = 2.6;
            this.height = 0.35;
            this.depth = 0.35;
            
            const cylinderGeo = new THREE.CylinderGeometry(0.15, 0.15, this.width, 8);
            const laserMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });
            const laserMesh = new THREE.Mesh(cylinderGeo, laserMat);
            laserMesh.rotation.z = Math.PI / 2;
            laserMesh.position.y = 2.05; 
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
    
    // Z-axis overlapping
    const halfD = o.depth / 2;
    if (Math.abs(o.z - pZ) > halfD + 0.3) {
        return false;
    }

    // X-axis overlapping
    const oX = LANES[o.lane + 1];
    if (Math.abs(pX - oX) > (p.width / 2 + o.width / 2 - 0.25)) {
        return false;
    }

    // Y-axis height checks
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

// Mobile left steering bind
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
    
    spawnSparks3D(player.group.position.x, player.group.position.y + 0.8, player.group.position.z, COLOR_RED);
    
    if (navigator.vibrate) {
        navigator.vibrate(250);
    }

    const finalScore = Math.floor(score);
    finalScoreEl.textContent = finalScore;
    
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('cyber_sky_high_highscore', highScore);
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

// --- MAIN 3D DAY FOREST GAMELOOP ---
function tick() {
    requestAnimationFrame(tick);
    
    const dt = Math.min(0.03, clock.getDelta());

    if (gameState === 'PLAYING') {
        // 1. Scroll forest path backward
        if (groundPath) {
            groundPath.material.map.offset.y -= gameSpeed * 0.00045 * (dt / 0.016);
        }

        // 2. Parallax 3D Floating Sky Islands loop ("daraxt osmonda bo'lib")
        skyIslands.forEach(t => {
            t.mesh.position.z += gameSpeed * 0.45 * dt;
            // Float up and down slightly for mystical realistic effect
            t.mesh.position.y = t.yPos + Math.sin(clock.getElapsedTime() * 0.6 + t.originalX) * 0.18;

            if (t.mesh.position.z > 25) {
                t.mesh.position.z = -450 - Math.random() * 50;
                t.mesh.position.x = t.side * (6.5 + Math.random() * 20);
                t.yPos = 1.0 + Math.random() * 11.0;
            }
        });

        // 3. Parallax drifting Clouds loop
        clouds.forEach(c => {
            c.mesh.position.z += gameSpeed * 0.42 * dt * c.speed; 
            
            if (c.mesh.position.z > 40) {
                c.mesh.position.z = -450 - Math.random() * 80;
                c.mesh.position.x = (Math.random() - 0.5) * 60;
                c.mesh.position.y = 16 + Math.random() * 8;
            }
        });

        // 4. Drift golden sunlit pollen organically
        const time = clock.getElapsedTime();
        pollen.forEach(p => {
            p.mesh.position.z += gameSpeed * 0.45 * dt;
            p.mesh.position.x += Math.sin(time * p.speed + p.timeOffset) * 0.035;
            p.mesh.position.y += Math.cos(time * p.speed + p.timeOffset) * 0.018;

            if (p.mesh.position.z > 20) {
                p.mesh.position.z = -450 - Math.random() * 30;
                p.mesh.position.x = (Math.random() - 0.5) * 20;
                p.mesh.position.y = 0.5 + Math.random() * 4.5;
            }
        });

        // 5. Spawning obstacles
        obstacleTimer += dt;
        if (obstacleTimer >= nextObstacleTime) {
            obstacles.push(new Obstacle3D());
            obstacleTimer = 0;
            nextObstacleTime = Math.max(0.6, 1.7 - (gameSpeed * 0.014) + Math.random() * 0.35);
        }

        // 6. Update Obstacles
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
                score += 180; 
                
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

        // 7. Update Player Sideways & Vertical Physics
        player.update(dt);

        // 8. Accelerate runner
        distanceRun += dt;
        score += dt * 18;
        if (gameSpeed < MAX_SPEED) {
            gameSpeed += 0.28 * dt;
        }

        currentScoreEl.textContent = String(Math.floor(score)).padStart(5, '0');
    }

    // 9. Particle engine update
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        if (p.life <= 0) {
            p.destroy();
            particles.splice(i, 1);
        }
    }

    // 10. Chase Camera Follow
    if (player) {
        const targetCamY = player.isSliding ? 2.8 : 4.2 + (player.y - 0.1) * 0.4;
        camera.position.y += (targetCamY - camera.position.y) * 0.1;
        
        const targetLookY = 1.3 + (player.y - 0.1) * 0.25;
        camera.lookAt(0, targetLookY, 0);

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
