/**
 * Cyber Forest Parkour 3D - Breathtaking 3D WebGL Forest Runner
 * Valley Arcade Deluxe Edition: Endless Grassy Ground, Stones, Colorful Flowers,
 * Space Ninja, Cyber Katana, Dual Jetpacks, Abundant Coins, 3D Cherries/Fruits,
 * Hover-Cars & Flapping Birds!
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
let highScore = parseInt(localStorage.getItem('cyber_forest_deluxe_highscore')) || 0;
let gameSpeed = 38; // Z-axis speed
const MAX_SPEED = 82;
let distanceRun = 0;
let obstacleTimer = 0;
let nextObstacleTime = 1.6; // Spawning interval in seconds
let coinGroupTimer = 0;
let fruitTimer = 0; // Spawning interval for 3D fruits
let cameraShake = 0;

// Entities
let player;
let obstacles = [];
let coins = [];
let fruits = []; // 3D Collectible Fruits!
let hoverCars = [];
let birds = [];
let trees = [];
let clouds = [];
let pollen = [];
let particles = [];
let groundPath;
let massiveFloor;

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
const COLOR_CHERRY = 0xff0033;

// Vibrant Sky & Sunlit Mist
const COLOR_SKY_BLUE = 0x5fa9f8;
const COLOR_SUN_MIST = 0x9ed2ff;

highScoreEl.textContent = String(highScore).padStart(5, '0');

function initThree() {
    // 1. Create Scene with Beautiful Blue Sky & Light Sunlit Mist
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLOR_SKY_BLUE);
    scene.fog = new THREE.FogExp2(COLOR_SUN_MIST, 0.0075);

    // 2. Setup Perspective Chase Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4.2, 9.0);
    camera.lookAt(0, 1.2, 0);

    // 3. WebGL Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // 4. Warm Day Lights (Daylight Sun)
    const ambientLight = new THREE.AmbientLight(0xeef6ff, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.6);
    sunLight.position.set(15, 45, 15);
    scene.add(sunLight);

    const skyLight = new THREE.DirectionalLight(0xaad3ff, 0.6);
    skyLight.position.set(-15, 20, -10);
    scene.add(skyLight);

    // 5. Build Endless Grassy Ground Floor (Hamma joyni tagiga yer qo'shish)
    createEndlessGrassyGround();

    // 6. Build Elevated Forest Path
    createForestPath();

    // 7. Generate 3D Clouds (High in Sky)
    create3DClouds();

    // 8. Generate 3D Trees, Rocks, Flowers & Pollen (Daraxt, Tosh va Gullar!)
    create3DForest();

    // 9. Instantiate Upgraded 3D Space Ninja Player (Dynamic Cape!)
    player = new Player3D();
}

// Massive endless grassy terrain under everything
function createEndlessGrassyGround() {
    const width = 800;
    const length = 1200;

    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x143c1a, // Lush green meadow grass
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true
    });

    massiveFloor = new THREE.Mesh(floorGeo, floorMat);
    massiveFloor.rotation.x = -Math.PI / 2;
    massiveFloor.position.set(0, -0.05, -length / 3);
    scene.add(massiveFloor);
}

// Elevated dirt/neon forest runway
function createForestPath() {
    const width = 10;
    const length = 500;
    
    const pathCanvas = document.createElement('canvas');
    pathCanvas.width = 128;
    pathCanvas.height = 128;
    const pctx = pathCanvas.getContext('2d');
    
    pctx.fillStyle = '#112c1b';
    pctx.fillRect(0, 0, 128, 128);
    
    // Earthy dirt center path
    pctx.fillStyle = '#3d2b1f';
    pctx.fillRect(25, 0, 78, 128);
    
    pctx.strokeStyle = 'rgba(57, 255, 20, 0.45)';
    pctx.lineWidth = 4;
    pctx.beginPath();
    pctx.moveTo(42, 0); pctx.lineTo(42, 128);
    pctx.moveTo(86, 0); pctx.lineTo(86, 128);
    pctx.stroke();

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
        roughness: 0.4,
        metalness: 0.3,
        emissive: 0x071e10,
        emissiveIntensity: 0.3
    });

    groundPath = new THREE.Mesh(groundGeo, groundMat);
    groundPath.rotation.x = -Math.PI / 2;
    groundPath.position.set(0, 0.02, -length / 3); // Elevated
    scene.add(groundPath);

    // Flanking neon boundary wires
    const wireGeo = new THREE.CylinderGeometry(0.08, 0.08, length, 8);
    const wireMat = new THREE.MeshBasicMaterial({ color: COLOR_GREEN });
    
    const wireLeft = new THREE.Mesh(wireGeo, wireMat);
    wireLeft.rotation.x = Math.PI / 2;
    wireLeft.position.set(-width / 2, 0.08, -length / 2);
    scene.add(wireLeft);

    const wireRight = wireLeft.clone();
    wireRight.position.x = width / 2;
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
        const y = 14 + Math.random() * 8;
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

// Procedural Trees, Rocks & Colorful Flowers Generator (Daraxt, Tosh va Gullar!)
function create3DForest() {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 4.5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4d3222, roughness: 0.95, flatShading: true });
    
    const leavesMat1 = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.85, flatShading: true });
    const leavesMat2 = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.85, flatShading: true });
    const sunlitLeavesMat = new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.85, flatShading: true });

    // Stylized low-poly gray rocks
    const rockGeo = new THREE.DodecahedronGeometry(1.0, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x7c858b, roughness: 0.8, metalness: 0.2, flatShading: true });

    // Colorful 3D Flower Materials (Gul ham bo'lsin!)
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.9 });
    
    const flowerCenterGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const flowerCenterMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.8 }); // Yellow center

    const petalGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const petalColors = [0xff3366, 0xff8800, 0x00ccff, 0xff00ff];

    for (let i = 0; i < 40; i++) {
        const treeGroup = new THREE.Group();
        
        // 1. Tree Trunk
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2.25;
        treeGroup.add(trunk);
        
        // 2. Tree Leaves Cones
        const leafGeo1 = new THREE.ConeGeometry(1.6, 2.0, 5);
        const leafGeo2 = new THREE.ConeGeometry(1.2, 1.6, 5);
        const leafGeo3 = new THREE.ConeGeometry(0.8, 1.2, 5);
        
        const isSunlit = Math.random() < 0.3;
        const leafMat = isSunlit ? sunlitLeavesMat : (Math.random() < 0.5 ? leavesMat1 : leavesMat2);
        
        const leaves1 = new THREE.Mesh(leafGeo1, leafMat);
        leaves1.position.y = 3.6;
        treeGroup.add(leaves1);

        const leaves2 = new THREE.Mesh(leafGeo2, leafMat);
        leaves2.position.y = 4.8;
        treeGroup.add(leaves2);

        const leaves3 = new THREE.Mesh(leafGeo3, leafMat);
        leaves3.position.y = 5.8;
        treeGroup.add(leaves3);

        // 3. Add 1-2 Stylized Rocks next to the tree (Daraxt yoniga tosh qo'shish)
        const rockCount = 1 + Math.floor(Math.random() * 2);
        for (let r = 0; r < rockCount; r++) {
            const rock = new THREE.Mesh(rockGeo, rockMat);
            
            const rx = (Math.random() - 0.5) * 2.2;
            const rz = (Math.random() - 0.5) * 2.2;
            
            const rw = 0.3 + Math.random() * 0.7;
            const rh = 0.2 + Math.random() * 0.5;
            const rd = 0.3 + Math.random() * 0.7;
            rock.scale.set(rw, rh, rd);
            rock.position.set(rx, rh / 2, rz);
            
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            treeGroup.add(rock);
        }

        // 4. Add 2-3 procedurally modeled 3D Flowers next to tree/rocks (Fut/Gul ham bo'lsin!)
        const flowerCount = 2 + Math.floor(Math.random() * 2);
        for (let f = 0; f < flowerCount; f++) {
            const flowerGroup = new THREE.Group();

            // Stem
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.y = 0.175;
            flowerGroup.add(stem);

            // Yellow center
            const center = new THREE.Mesh(flowerCenterGeo, flowerCenterMat);
            center.position.y = 0.35;
            flowerGroup.add(center);

            // Petals (4 spheres clustered around center)
            const petalMat = new THREE.MeshStandardMaterial({ 
                color: petalColors[Math.floor(Math.random() * petalColors.length)],
                roughness: 0.8 
            });

            for (let p = 0; p < 4; p++) {
                const petal = new THREE.Mesh(petalGeo, petalMat);
                const angle = (p / 4) * Math.PI * 2;
                const px = Math.cos(angle) * 0.08;
                const pz = Math.sin(angle) * 0.08;
                petal.position.set(px, 0.35, pz);
                flowerGroup.add(petal);
            }

            // Scatter offset near tree base
            const fx = (Math.random() - 0.5) * 3.5;
            const fz = (Math.random() - 0.5) * 3.5;
            flowerGroup.position.set(fx, 0, fz);

            treeGroup.add(flowerGroup);
        }

        // Side placement variables
        const side = Math.random() < 0.5 ? -1 : 1;
        const xPos = side * (5.5 + Math.random() * 25);
        const zPos = -Math.random() * 450 - 50;
        
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

    // 5. Sun Pollen
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

// --- 3D COLLECTIBLE COINS CLASS (Abundant Coins!) ---
class Coin3D {
    constructor(lane, z) {
        this.lane = lane; 
        this.z = z;
        this.collected = false;

        this.buildCoinMesh();
    }

    buildCoinMesh() {
        this.group = new THREE.Group();

        const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 8);
        const coinMat = new THREE.MeshStandardMaterial({
            color: COLOR_GOLD,
            roughness: 0.1,
            metalness: 0.95,
            emissive: 0xaa7700,
            emissiveIntensity: 0.6
        });

        this.mesh = new THREE.Mesh(coinGeo, coinMat);
        this.mesh.rotation.x = Math.PI / 2; 
        this.group.add(this.mesh);

        const spawnX = LANES[this.lane + 1];
        this.group.position.set(spawnX, 0.72, this.z); 
        scene.add(this.group);
    }

    update(dt) {
        this.z += gameSpeed * dt;
        this.group.position.z = this.z;
        this.group.rotation.y += 3.8 * dt;
    }

    destroy() {
        scene.remove(this.group);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

// Spawns 4 coins in a line, very frequently! (Tangalarni ko'paytirish!)
function spawnCoinGroup() {
    const lane = Math.floor(Math.random() * 3) - 1;
    const startZ = -280;
    
    for (let i = 0; i < 4; i++) {
        coins.push(new Coin3D(lane, startZ - (i * 6.5)));
    }
}

// --- 3D COLLECTIBLE FRUITS CLASS (Fut/Fruit qo'shish!) ---
class Fruit3D {
    constructor(lane, z) {
        this.lane = lane;
        this.z = z;
        this.collected = false;

        this.buildFruitMesh();
    }

    buildFruitMesh() {
        this.group = new THREE.Group();

        // Shiny Red Cherry/Apple (Two red spheres clustered)
        const fruitGeo = new THREE.SphereGeometry(0.24, 8, 8);
        const fruitMat = new THREE.MeshStandardMaterial({
            color: COLOR_CHERRY,
            roughness: 0.05,
            metalness: 0.8,
            emissive: 0x550000,
            emissiveIntensity: 0.5
        });

        // Left cherry
        this.cherryLeft = new THREE.Mesh(fruitGeo, fruitMat);
        this.cherryLeft.position.set(-0.12, 0, 0);
        this.group.add(this.cherryLeft);

        // Right cherry
        this.cherryRight = new THREE.Mesh(fruitGeo, fruitMat);
        this.cherryRight.position.set(0.12, -0.04, 0);
        this.group.add(this.cherryRight);

        // Angled green stem cylinder
        const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x27ae60 });
        
        this.stem = new THREE.Mesh(stemGeo, stemMat);
        this.stem.rotation.z = Math.PI / 6; // Angled
        this.stem.position.set(0, 0.2, 0);
        this.group.add(this.stem);

        const spawnX = LANES[this.lane + 1];
        this.group.position.set(spawnX, 0.85, this.z); // Hovering height
        scene.add(this.group);
    }

    update(dt, time) {
        this.z += gameSpeed * dt;
        this.group.position.z = this.z;

        // Slow hover rotation
        this.group.rotation.y += 2.2 * dt;
        this.group.position.y = 0.85 + Math.sin(time * 4) * 0.08; // Float up/down
    }

    destroy() {
        scene.remove(this.group);
        this.cherryLeft.geometry.dispose();
        this.cherryRight.geometry.dispose();
        this.stem.geometry.dispose();
        this.cherryLeft.material.dispose();
        this.cherryRight.material.dispose();
        this.stem.material.dispose();
    }
}

// --- 3D FUTURISTIC FLYING HOVER-CARS CLASS (Moshina qo'shish) ---
class HoverCar3D {
    constructor() {
        this.z = -350;
        this.side = Math.random() < 0.5 ? -1 : 1;
        this.x = this.side * (8 + Math.random() * 7);
        this.y = 2.2 + Math.random() * 3.5; 
        this.speedOffset = (Math.random() - 0.5) * 15;

        this.buildCarMesh();
    }

    buildCarMesh() {
        this.group = new THREE.Group();

        const colors = [0x1a2130, 0x5a5a5a, 0x054b8b, 0xa10d0d];
        const carColor = colors[Math.floor(Math.random() * colors.length)];

        const bodyGeo = new THREE.BoxGeometry(1.4, 0.55, 3.0);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: carColor,
            roughness: 0.2,
            metalness: 0.95,
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        this.group.add(body);

        const headlightGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const headlightMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });
        
        const hLeft = new THREE.Mesh(headlightGeo, headlightMat);
        hLeft.position.set(-0.5, 0, 1.51);
        this.group.add(hLeft);

        const hRight = hLeft.clone();
        hRight.position.x = 0.5;
        this.group.add(hRight);

        const taillightGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const taillightMat = new THREE.MeshBasicMaterial({ color: COLOR_RED });
        
        const tLeft = new THREE.Mesh(taillightGeo, taillightMat);
        tLeft.position.set(-0.5, 0, -1.51);
        this.group.add(tLeft);

        const tRight = tLeft.clone();
        tRight.position.x = 0.5;
        this.group.add(tRight);

        this.group.position.set(this.x, this.y, this.z);
        scene.add(this.group);
    }

    update(dt) {
        this.z += (gameSpeed + this.speedOffset) * dt;
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

// --- 3D FLAPPING BIRDS CLASS (Qush qo'shish) ---
class Bird3D {
    constructor() {
        this.z = -350;
        this.x = (Math.random() - 0.5) * 35;
        this.y = 10 + Math.random() * 6; 
        this.speedOffset = -5 - Math.random() * 8; 

        this.wingOffset = Math.random() * Math.PI;

        this.buildBirdMesh();
    }

    buildBirdMesh() {
        this.group = new THREE.Group();

        const bodyGeo = new THREE.BoxGeometry(0.3, 0.2, 0.6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.group.add(this.body);

        const wingGeo = new THREE.BoxGeometry(0.65, 0.02, 0.25);
        wingGeo.translate(0.325, 0, 0); 

        const wingMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9, flatShading: true });
        
        this.leftWing = new THREE.Mesh(wingGeo, wingMat);
        this.leftWing.position.set(-0.15, 0, 0);
        this.group.add(this.leftWing);

        this.rightWing = new THREE.Mesh(wingGeo, wingMat);
        this.rightWing.rotation.y = Math.PI; 
        this.rightWing.position.set(0.15, 0, 0);
        this.group.add(this.rightWing);

        this.group.position.set(this.x, this.y, this.z);
        scene.add(this.group);
    }

    update(dt, time) {
        this.z += (gameSpeed + this.speedOffset) * dt;
        this.group.position.z = this.z;

        const flap = Math.sin(time * 15 + this.wingOffset) * 0.72;
        this.leftWing.rotation.z = flap;
        this.rightWing.rotation.z = -flap; 
    }

    destroy() {
        scene.remove(this.group);
        this.body.geometry.dispose();
        this.body.material.dispose();
        this.leftWing.geometry.dispose();
        this.rightWing.geometry.dispose();
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

// --- 3D SPACE NINJA PLAYER WITH CYBER KATANA, DUAL JETPACKS & STRIPED CAPE ---
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

        // Hitbox parameters
        this.width = 0.9;
        this.height = 1.6;
        this.depth = 1.0;

        this.buildSpaceNinjaMesh();
    }

    buildSpaceNinjaMesh() {
        const darkSuitsMat = new THREE.MeshStandardMaterial({ color: 0x1d2127, roughness: 0.4, metalness: 0.9 });
        const neonGreenMat = new THREE.MeshStandardMaterial({ color: COLOR_GREEN, emissive: COLOR_GREEN, emissiveIntensity: 0.8 });
        const neonPinkMat = new THREE.MeshStandardMaterial({ color: COLOR_PINK, emissive: COLOR_PINK, emissiveIntensity: 0.9 });
        const cyanVisorMat = new THREE.MeshStandardMaterial({ color: COLOR_CYAN, emissive: COLOR_CYAN, emissiveIntensity: 1.0 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.1, metalness: 0.95 });

        // 1. Torso
        const torsoGeo = new THREE.BoxGeometry(0.72, 0.9, 0.45);
        this.torso = new THREE.Mesh(torsoGeo, darkSuitsMat);
        this.torso.position.y = 1.0;
        this.group.add(this.torso);

        // Glowing chest logo
        const coreGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
        this.chestCore = new THREE.Mesh(coreGeo, neonGreenMat);
        this.chestCore.rotation.x = Math.PI / 2;
        this.chestCore.position.set(0, 1.15, 0.23);
        this.group.add(this.chestCore);

        // 2. Helmet
        const helmGeo = new THREE.SphereGeometry(0.26, 12, 12);
        this.head = new THREE.Mesh(helmGeo, chromeMat);
        this.head.position.y = 1.65;
        this.group.add(this.head);

        // Visor
        const visorGeo = new THREE.SphereGeometry(0.27, 12, 12, 0, Math.PI, 0, Math.PI / 2);
        this.visor = new THREE.Mesh(visorGeo, cyanVisorMat);
        this.visor.rotation.x = Math.PI / 2.5;
        this.visor.position.set(0, 1.68, 0.05);
        this.group.add(this.visor);

        // 3. Dynamic striped Cape
        this.capeGroup = new THREE.Group();
        this.capeGroup.position.set(0, 1.35, -0.22);
        this.group.add(this.capeGroup);

        const capeGeo = new THREE.BoxGeometry(0.68, 1.3, 0.03);
        capeGeo.translate(0, -0.65, 0); 
        this.cape = new THREE.Mesh(capeGeo, neonGreenMat);
        this.capeGroup.add(this.cape);

        // Neon Pink borders
        const stripeGeo = new THREE.BoxGeometry(0.06, 1.3, 0.04);
        stripeGeo.translate(0, -0.65, 0);
        
        const stripeLeft = new THREE.Mesh(stripeGeo, neonPinkMat);
        stripeLeft.position.set(-0.35, 0, 0.01);
        this.capeGroup.add(stripeLeft);

        const stripeRight = stripeLeft.clone();
        stripeRight.position.x = 0.35;
        this.capeGroup.add(stripeRight);

        // 4. Cyber Katana Sword
        this.katanaGroup = new THREE.Group();
        this.katanaGroup.position.set(0.12, 1.05, -0.25);
        this.katanaGroup.rotation.z = -Math.PI / 4; 
        this.group.add(this.katanaGroup);

        const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
        const handle = new THREE.Mesh(handleGeo, darkSuitsMat);
        handle.position.y = 0.65;
        this.katanaGroup.add(handle);

        const bladeGeo = new THREE.BoxGeometry(0.03, 1.0, 0.07);
        const bladeMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = -0.05;
        this.katanaGroup.add(blade);

        // 5. Dual Jetpacks
        this.jetpackLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8), chromeMat);
        this.jetpackLeft.position.set(-0.25, 1.25, -0.23);
        this.group.add(this.jetpackLeft);

        this.jetpackRight = this.jetpackLeft.clone();
        this.jetpackRight.position.x = 0.25;
        this.group.add(this.jetpackRight);

        // Jet Cones
        const flameGeo = new THREE.ConeGeometry(0.06, 0.32, 8);
        flameGeo.translate(0, -0.16, 0); 
        const flameMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });

        this.flameLeft = new THREE.Mesh(flameGeo, flameMat);
        this.flameLeft.position.set(0, -0.225, 0);
        this.flameLeft.visible = false;
        this.jetpackLeft.add(this.flameLeft);

        this.flameRight = this.flameLeft.clone();
        this.flameRight.visible = false;
        this.jetpackRight.add(this.flameRight);

        // 6. Limbs
        const limbGeo = new THREE.BoxGeometry(0.18, 0.5, 0.18);
        
        this.leftArm = new THREE.Mesh(limbGeo, darkSuitsMat);
        this.leftArm.position.set(-0.5, 1.0, 0);
        this.group.add(this.leftArm);

        this.rightArm = new THREE.Mesh(limbGeo, darkSuitsMat);
        this.rightArm.position.set(0.5, 1.0, 0);
        this.group.add(this.rightArm);

        this.leftLeg = new THREE.Mesh(limbGeo, darkSuitsMat);
        this.leftLeg.position.set(-0.22, 0.35, 0);
        this.group.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(limbGeo, darkSuitsMat);
        this.rightLeg.position.set(0.22, 0.35, 0);
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
            this.flameLeft.visible = false;
            this.flameRight.visible = false;
        } else {
            this.flameLeft.visible = true;
            this.flameRight.visible = true;
            
            const flicker = 0.8 + Math.random() * 0.55;
            this.flameLeft.scale.y = flicker;
            this.flameRight.scale.y = flicker;
        }

        if (!this.isSliding) {
            this.group.position.y = this.y;
        }

        const currentTargetX = LANES[this.currentLane + 1];
        this.group.position.x += (currentTargetX - this.group.position.x) * this.laneSpeed * dt;

        this.animTime += dt * gameSpeed * 0.35;
        
        if (this.isSliding) {
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
            this.capeGroup.rotation.x = Math.PI / 2.3;
        } else if (this.isJumping) {
            this.leftLeg.rotation.x = -0.6;
            this.rightLeg.rotation.x = -0.6;
            this.leftArm.rotation.x = 0.6;
            this.rightArm.rotation.x = 0.6;
            this.capeGroup.rotation.x = 0.1;
        } else {
            const swing = Math.sin(this.animTime);
            this.leftLeg.rotation.x = swing * 0.8;
            this.rightLeg.rotation.x = -swing * 0.8;
            this.leftArm.rotation.x = -swing * 0.8;
            this.rightArm.rotation.x = swing * 0.8;

            this.torso.position.y = 1.0 + Math.abs(swing) * 0.08;
            this.head.position.y = 1.65 + Math.abs(swing) * 0.06;

            const baseDragAngle = Math.PI / 6 + (gameSpeed - 38) * 0.005; 
            const waveAngle = Math.sin(this.animTime * 1.6) * 0.15;
            this.capeGroup.rotation.x = baseDragAngle + waveAngle;
        }
    }
}

// --- 3D OBSTACLE CLASS FOR LEFT/RIGHT/CENTER LANES ---
class Obstacle3D {
    constructor() {
        this.z = -280; 
        this.lane = Math.floor(Math.random() * 3) - 1; 
        this.type = Math.floor(Math.random() * 3);
        this.dodged = false;

        this.buildObstacleMesh();
    }

    buildObstacleMesh() {
        this.group = new THREE.Group();
        
        if (this.type === 0) {
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
            this.width = 2.6;
            this.height = 0.35;
            this.depth = 0.35;
            
            const cylinderGeo = new THREE.CylinderGeometry(0.15, 0.15, this.width, 8);
            const laserMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });
            const laserMesh = new THREE.Mesh(cylinderGeo, laserMat);
            laserMesh.rotation.z = Math.PI / 2;
            laserMesh.position.y = 2.05; 
            this.group.add(laserMesh);

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

// --- COLLISION DETECTION ---
function checkCollision3D(p, o) {
    const pZ = p.group.position.z;
    const pX = p.group.position.x;
    
    const halfD = o.depth / 2;
    if (Math.abs(o.z - pZ) > halfD + 0.3) {
        return false;
    }

    const oX = LANES[o.lane + 1];
    if (Math.abs(pX - oX) > (p.width / 2 + o.width / 2 - 0.25)) {
        return false;
    }

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

// Check overlapping with coins/fruits
function checkCoinCollision(p, c) {
    const pZ = p.group.position.z;
    const pX = p.group.position.x;
    const pY = p.group.position.y;

    const cX = LANES[c.lane + 1];
    const cZ = c.z;
    const cY = 0.72; 

    const dist = Math.sqrt((pX - cX)**2 + (pY + 0.8 - cY)**2 + (pZ - cZ)**2);
    return dist < 1.05; 
}

function checkFruitCollision(p, f) {
    const pZ = p.group.position.z;
    const pX = p.group.position.x;
    const pY = p.group.position.y;

    const fX = LANES[f.lane + 1];
    const fZ = f.z;
    const fY = f.group.position.y; // floating height

    const dist = Math.sqrt((pX - fX)**2 + (pY + 0.8 - fY)**2 + (pZ - fZ)**2);
    return dist < 1.15; // overlap radius
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

// Emulation bindings
function stopSlide() {
    if (gameState === 'PLAYING') {
        player.slide(false);
    }
}

// Keyboard
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

mobileLeftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); steerLeft(); });
mobileRightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); steerRight(); });
mobileJumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); triggerJump(); });
mobileSlideBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startSlide(); });
mobileSlideBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopSlide(); });

mobileLeftBtn.addEventListener('mousedown', (e) => { e.preventDefault(); steerLeft(); });
mobileRightBtn.addEventListener('mousedown', (e) => { e.preventDefault(); steerRight(); });
mobileJumpBtn.addEventListener('mousedown', (e) => { e.preventDefault(); triggerJump(); });
mobileSlideBtn.addEventListener('mousedown', (e) => { e.preventDefault(); startSlide(); });
window.addEventListener('mouseup', () => { stopSlide(); });

// --- GAME STATE FLOWS ---
function init() {
    obstacles.forEach(o => o.destroy());
    coins.forEach(c => c.destroy());
    fruits.forEach(f => f.destroy());
    hoverCars.forEach(hc => hc.destroy());
    birds.forEach(b => b.destroy());
    particles.forEach(p => p.destroy());
    
    score = 0;
    gameSpeed = 38;
    distanceRun = 0;
    obstacleTimer = 0;
    coinGroupTimer = 0;
    fruitTimer = 0;
    cameraShake = 0;
    obstacles = [];
    coins = [];
    fruits = [];
    hoverCars = [];
    birds = [];
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
        localStorage.setItem('cyber_forest_deluxe_highscore', highScore);
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

// --- MAIN 3D VALLEY MEADOW GAMELOOP ---
function tick() {
    requestAnimationFrame(tick);
    
    const dt = Math.min(0.03, clock.getDelta());
    const time = clock.getElapsedTime();

    if (gameState === 'PLAYING') {
        // 1. Scroll forest path backward
        if (groundPath) {
            groundPath.material.map.offset.y -= gameSpeed * 0.00045 * (dt / 0.016);
        }

        // 2. Parallax forest trees & rocks loop
        trees.forEach(t => {
            t.mesh.position.z += gameSpeed * 0.45 * dt;
            if (t.mesh.position.z > 25) {
                t.mesh.position.z = -450 - Math.random() * 50;
                t.mesh.position.x = t.side * (5.5 + Math.random() * 25);
            }
        });

        // 3. Parallax drifting Clouds loop
        clouds.forEach(c => {
            c.mesh.position.z += gameSpeed * 0.42 * dt * c.speed;
            
            if (c.mesh.position.z > 40) {
                c.mesh.position.z = -450 - Math.random() * 80;
                c.mesh.position.x = (Math.random() - 0.5) * 60;
                c.mesh.position.y = 14 + Math.random() * 8;
            }
        });

        // 4. Drift golden sunlit pollen
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

        // 5. Spawning flying hover-cars periodically
        if (Math.random() < 0.008) {
            hoverCars.push(new HoverCar3D());
        }

        // 6. Update Hover-Cars
        for (let i = hoverCars.length - 1; i >= 0; i--) {
            const hc = hoverCars[i];
            hc.update(dt);
            if (hc.z > 40) {
                hc.destroy();
                hoverCars.splice(i, 1);
            }
        }

        // 7. Spawning flapping birds periodically
        if (Math.random() < 0.005) {
            birds.push(new Bird3D());
        }

        // 8. Update flapping birds
        for (let i = birds.length - 1; i >= 0; i--) {
            const b = birds[i];
            b.update(dt, time);
            if (b.z > 40) {
                b.destroy();
                birds.splice(i, 1);
            }
        }

        // 9. Spawning abundant gold coins! Every 2.2 seconds! (Tangalarni ko'paytirish!)
        coinGroupTimer += dt;
        if (coinGroupTimer >= 2.2) {
            spawnCoinGroup();
            coinGroupTimer = 0;
        }

        // 10. Update and Collide Gold Coins
        for (let i = coins.length - 1; i >= 0; i--) {
            const c = coins[i];
            c.update(dt);

            if (checkCoinCollision(player, c)) {
                c.collected = true;
                score += 50; 
                
                for (let k = 0; k < 8; k++) {
                    particles.push(new Particle3D(
                        c.group.position.x,
                        c.group.position.y,
                        c.group.position.z,
                        (Math.random() - 0.5) * 8,
                        Math.random() * 8 + 2,
                        (Math.random() - 0.5) * 8,
                        COLOR_GOLD, 0.1, 0.3
                    ));
                }

                c.destroy();
                coins.splice(i, 1);
                continue;
            }

            if (c.z > 15) {
                c.destroy();
                coins.splice(i, 1);
            }
        }

        // 11. Spawning 3D Collectible Fruits (Cherries/Apples) every 3.5 seconds! (Fut/Fruit qo'shish!)
        fruitTimer += dt;
        if (fruitTimer >= 3.5) {
            const lane = Math.floor(Math.random() * 3) - 1;
            fruits.push(new Fruit3D(lane, -280));
            fruitTimer = 0;
        }

        // 12. Update and Collide 3D Fruits
        for (let i = fruits.length - 1; i >= 0; i--) {
            const f = fruits[i];
            f.update(dt, time);

            if (checkFruitCollision(player, f)) {
                f.collected = true;
                score += 150; // Premium bonus score!
                
                // Explode in highly glowing pink/magenta sparks!
                for (let k = 0; k < 12; k++) {
                    particles.push(new Particle3D(
                        f.group.position.x,
                        f.group.position.y,
                        f.group.position.z,
                        (Math.random() - 0.5) * 10,
                        Math.random() * 10 + 2,
                        (Math.random() - 0.5) * 10,
                        COLOR_PINK, 0.12, 0.35
                    ));
                }

                f.destroy();
                fruits.splice(i, 1);
                continue;
            }

            if (f.z > 15) {
                f.destroy();
                fruits.splice(i, 1);
            }
        }

        // 13. Spawning obstacles
        obstacleTimer += dt;
        if (obstacleTimer >= nextObstacleTime) {
            obstacles.push(new Obstacle3D());
            obstacleTimer = 0;
            nextObstacleTime = Math.max(0.6, 1.7 - (gameSpeed * 0.014) + Math.random() * 0.35);
        }

        // 14. Update Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const o = obstacles[i];
            o.update(dt);

            if (checkCollision3D(player, o)) {
                gameOver();
                return;
            }

            if (o.z > player.group.position.z + 1.0 && !o.dodged) {
                o.dodged = true;
                score += 180; 
                
                const combo = (1 + (gameSpeed - 38) * 0.03).toFixed(1);
                comboText.textContent = combo + 'x';

                spawnSparks3D(o.group.position.x, player.group.position.y + 0.5, o.z, COLOR_GOLD);
            }

            if (o.z > 15) {
                o.destroy();
                obstacles.splice(i, 1);
            }
        }

        // 15. Update Player
        player.update(dt);

        // 16. Accelerate runner
        distanceRun += dt;
        score += dt * 18;
        if (gameSpeed < MAX_SPEED) {
            gameSpeed += 0.28 * dt;
        }

        currentScoreEl.textContent = String(Math.floor(score)).padStart(5, '0');
    }

    // 17. Particle engine update
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        if (p.life <= 0) {
            p.destroy();
            particles.splice(i, 1);
        }
    }

    // 18. Camera Follow
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

    renderer.render(scene, camera);
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
