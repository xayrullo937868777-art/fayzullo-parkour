/**
 * Cyber City Parkour 3D - Breathtaking 3D WebGL Neon Runner
 * Valley Arcade Grand City Edition: Endless Dark Grid Ground, Glowing Side Neon Lampposts,
 * Procedural Skyscrapers & Apartment Blocks (Domlar!) with glowing window grids,
 * Advanced Polyphonic 8-Bit Retro BGM & SFX Sound Engine (Muzika ham bo'lsin!),
 * Flying Jetpack Power-Up Mystery Box (Uchadigan Quti!), Sky Coins,
 * Sleek Oncoming Obstacles (Spinning Plasma Mines, Cyber Laser Warning Arches, Holographic Forcefields),
 * Cyber Katana, Dual Jetpacks, Abundant Gold Coins, 3D Collectible Fruits/Cherries, 
 * Flapping Cyber-Birds, Dynamic Day-Night Cycle (Tun va yorug' bo'lsin!),
 * In-game Dynamic Alert Banners (Xabarlar!), and an Epic Matrix Slow-Motion Cinematic Victory Gate.
 * Powered by Three.js. 3-Lane Horizontal Steering.
 */

// --- DYNAMIC ELEMENT REFERENCES ---
const canvas = document.getElementById('gameCanvas');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const victoryScreen = document.getElementById('victoryScreen');
const hud = document.getElementById('hud');
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');
const finalCoinsEl = document.getElementById('finalCoins');
const newRecordTag = document.getElementById('newRecordTag');
const comboText = document.getElementById('comboText');

// Coin & Level HUD Elements
const hudCoins = document.getElementById('hudCoins');
const hudLevel = document.getElementById('hudLevel');
const victoryLevelEl = document.getElementById('victoryLevel');
const victoryCoinsEl = document.getElementById('victoryCoins');
const victoryScoreEl = document.getElementById('victoryScore');

// Dynamic Alert Notification Banners (Xabarlar!)
const alertBanner = document.getElementById('alertBanner');
const alertText = document.getElementById('alertText');
let alertTimeout = null;

// Music Toggle Buttons
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');

// Buttons & Touch
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const mobileLeftBtn = document.getElementById('mobileLeftBtn');
const mobileRightBtn = document.getElementById('mobileRightBtn');
const mobileSlideBtn = document.getElementById('mobileSlideBtn');
const mobileJumpBtn = document.getElementById('mobileJumpBtn');

// --- SYNTHESIZED ADVANCED POLYPHONIC RETRO ARCADE SOUND ENGINE ---
class ArcadeSoundEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.isMuted = false;
        
        // Loop timeline parameters
        this.bgmInterval = null;
        this.tempo = 142; // Upbeat tempo!
        this.noteIndex = 0;
        
        // Polyphonic sound channels: Bass, Chord pads, Hi-hat, and Lead melodies!
        this.bassSequence = [
            65.41,  98.00,  130.81, 98.00,  // C2, G2, C3, G2
            77.78,  116.54, 155.56, 116.54, // Eb2, Bb2, Eb3, Bb2
            87.31,  130.81, 174.61, 130.81, // F2, C3, F3, C3
            98.00,  146.83, 196.00, 146.83  // G2, D3, G3, D3
        ];
        
        this.chordSequence = [
            [130.81, 155.56, 196.00], // C-Minor chord swell (C3+Eb3+G3)
            [130.81, 155.56, 196.00],
            [155.56, 196.00, 233.08], // Eb-Major chord swell (Eb3+G3+Bb3)
            [155.56, 196.00, 233.08],
            [174.61, 207.65, 261.63], // F-Minor chord swell (F3+Ab3+C4)
            [174.61, 207.65, 261.63],
            [196.00, 246.94, 293.66], // G-Major chord swell (G3+B3+D4)
            [196.00, 246.94, 293.66]
        ];

        this.leadSequence = [
            523.25, 587.33, 659.25, 783.99, // C5, D5, E5, G5
            880.00, 783.99, 659.25, 587.33, // A5, G5, E5, D5
            698.46, 783.99, 880.00, 1046.50, // F5, G5, A5, C6
            1174.66, 1046.50, 880.00, 783.99 // D6, C6, A5, G5
        ];
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    startBGM() {
        this.init();
        if (this.isPlaying || this.isMuted) return;
        this.isPlaying = true;

        const noteLength = 60 / this.tempo / 2; // Eighth notes
        this.bgmInterval = setInterval(() => {
            if (!this.isPlaying || this.isMuted) return;
            
            const bassFreq = this.bassSequence[this.noteIndex % this.bassSequence.length];
            this.playSynthesizedTone(bassFreq, 'triangle', noteLength * 0.95, 0.16);

            if (this.noteIndex % 4 === 0) {
                const chord = this.chordSequence[Math.floor(this.noteIndex / 4) % this.chordSequence.length];
                chord.forEach(freq => {
                    this.playSynthesizedTone(freq, 'sine', noteLength * 3.6, 0.04);
                });
            }

            // Upbeat hi-hat white noise click emulation (Hi-hat beats!)
            if (this.noteIndex % 2 === 1) {
                this.playHiHatSFX(noteLength * 0.25);
            }

            // High heroic retro lead arpeggio sequence
            if (this.noteIndex % 2 === 0) {
                const leadFreq = this.leadSequence[Math.floor(this.noteIndex / 2) % this.leadSequence.length];
                this.playSynthesizedTone(leadFreq, 'square', noteLength * 0.75, 0.06);
            }

            this.noteIndex++;
        }, noteLength * 1000);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.isPlaying = false;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
            musicIcon.className = 'fas fa-volume-mute';
            musicIcon.style.color = '#ff007f';
            musicToggle.style.borderColor = '#ff007f';
            musicToggle.style.boxShadow = '0 0 10px #ff007f';
            showAlert("MUZIKA O'CHIRILDI!", "pink");
        } else {
            musicIcon.className = 'fas fa-volume-up';
            musicIcon.style.color = '#00f0ff';
            musicToggle.style.borderColor = '#00f0ff';
            musicToggle.style.boxShadow = '0 0 10px #00f0ff';
            showAlert("MUZIKA YOQILDI!", "cyan");
            this.startBGM();
        }
    }

    playSynthesizedTone(frequency, type, duration, volume) {
        if (!this.ctx || this.isMuted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playHiHatSFX(duration) {
        if (!this.ctx || this.isMuted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(10000, this.ctx.currentTime); // High pitch click
        
        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // --- SFX GENERATION SYNTHS ---
    playJumpSFX() {
        this.init();
        if (this.isMuted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.16);
        
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
    }

    playSlideSFX() {
        this.init();
        if (this.isMuted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.22);
        
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
    }

    playCoinSFX() {
        this.init();
        if (this.isMuted) return;
        
        this.playSynthesizedTone(1318.51, 'square', 0.06, 0.08); // E6
        setTimeout(() => {
            this.playSynthesizedTone(1975.53, 'square', 0.14, 0.08); // B6
        }, 65);
    }

    playFruitSFX() {
        this.init();
        if (this.isMuted) return;
        
        const arpeggio = [523.25, 659.25, 783.99, 1046.50]; 
        arpeggio.forEach((freq, i) => {
            setTimeout(() => {
                this.playSynthesizedTone(freq, 'square', 0.15, 0.06);
            }, i * 55);
        });
    }

    playPowerUpSFX() {
        this.init();
        if (this.isMuted) return;
        
        // Epic hyper pitch rise arpeggio (Mystery Box fly SFX!)
        const flightChime = [440, 554.37, 659.25, 880, 1109.73, 1318.51, 1760];
        flightChime.forEach((freq, i) => {
            setTimeout(() => {
                this.playSynthesizedTone(freq, 'square', 0.18, 0.09);
            }, i * 45);
        });
    }

    playLevelUpSFX() {
        this.init();
        if (this.isMuted) return;
        
        const chords = [587.33, 739.99, 880.00, 1174.66]; 
        chords.forEach((freq, i) => {
            setTimeout(() => {
                this.playSynthesizedTone(freq, 'square', 0.25, 0.08);
            }, i * 65);
        });
    }

    playCrashSFX() {
        this.init();
        if (this.isMuted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.45);
        
        gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.45);
    }

    playVictorySFX() {
        this.init();
        if (this.isMuted) return;
        
        const notes = [
            { f: 523.25, d: 0.1 }, { f: 523.25, d: 0.1 }, { f: 523.25, d: 0.1 },
            { f: 523.25, d: 0.25 }, { f: 659.25, d: 0.25 }, { f: 587.33, d: 0.25 },
            { f: 659.25, d: 0.15 }, { f: 783.99, d: 0.4 } 
        ];
        
        let cumulativeDelay = 0;
        notes.forEach(n => {
            setTimeout(() => {
                this.playSynthesizedTone(n.f, 'square', n.d, 0.12);
            }, cumulativeDelay);
            cumulativeDelay += n.d * 1000 + 40;
        });
    }
}

const audio = new ArcadeSoundEngine();
musicToggle.addEventListener('click', () => audio.toggleMute());

// --- THREE.JS SCENE SETUP ---
let scene, camera, renderer;
let clock = new THREE.Clock();

// Game Parameters
let gameState = 'START';
let score = 0;
let coinsCollected = 0;
let currentLevel = 1;
let distanceRun = 0;
const LEVEL_DISTANCE_GOAL = 1800; // Meters to reach the Victory Gate (Final!)

let highScore = parseInt(localStorage.getItem('cyber_city_grand_highscore')) || 0;
let gameSpeed = 38; // Z-axis speed
const MAX_SPEED = 82;
let obstacleTimer = 0;
let nextObstacleTime = 1.6; 
let coinGroupTimer = 0;
let fruitTimer = 0; 
let cameraShake = 0;

// Power-up State parameters (Uchadigan Quti!)
let powerBoxes = [];
let powerBoxTimer = 0;
let isFlyingMode = false;
let flightTimer = 0;
const FLIGHT_DURATION = 5.0; // Fly high for 5 seconds!

// Entities
let player;
let obstacles = [];
let coins = [];
let fruits = []; 
let hoverCars = [];
let birds = [];
let buildings = []; // Skyscrapers & Domlar flanking cyber highway!
let lampposts = []; // Neon Lampposts flanking the runway (Yonbosh svetlar!)
let clouds = [];
let pollen = [];
let particles = [];
let victoryGate = null; 
let groundPath;
let massiveFloor;

// Lights
let ambientLight, sunLight;

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

// Day-Night colors
const COLOR_SKY_DARK = 0x010103;
const COLOR_MIST_DARK = 0x030107;
const COLOR_SKY_BLUE = 0x5fa9f8;
const COLOR_SUN_MIST = 0x9ed2ff;

highScoreEl.textContent = String(highScore).padStart(5, '0');
hudCoins.textContent = '000';
hudLevel.textContent = '1';

// --- IN-GAME ALERTS / NOTIFICATION SYSTEM ---
function showAlert(text, type = 'cyan') {
    if (alertTimeout) {
        clearTimeout(alertTimeout);
    }
    
    alertText.textContent = text;
    
    alertBanner.className = 'alert-banner';
    alertBanner.classList.add('alert-' + type);
    alertBanner.classList.remove('hidden');
    
    alertTimeout = setTimeout(() => {
        alertBanner.classList.add('hidden');
    }, 2200);
}

function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLOR_SKY_DARK);
    scene.fog = new THREE.FogExp2(COLOR_MIST_DARK, 0.0085);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4.2, 9.0);
    camera.lookAt(0, 1.2, 0);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    ambientLight = new THREE.AmbientLight(0x0e1115, 0.08); 
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xffffff, 0.25);
    sunLight.position.set(15, 45, 15);
    scene.add(sunLight);

    createEndlessAsphaltGround();
    createCyberHighway();
    create3DClouds();
    create3DBuildings();
    createNeonLampposts();

    player = new Player3D();
}

// Massive endless dark grid terrain under everything (Shahar tagi!)
function createEndlessAsphaltGround() {
    const width = 800;
    const length = 1200;

    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x020204, // Deep dark cyber asphalt
        roughness: 0.95,
        metalness: 0.15,
        flatShading: true
    });

    massiveFloor = new THREE.Mesh(floorGeo, floorMat);
    massiveFloor.rotation.x = -Math.PI / 2;
    massiveFloor.position.set(0, -0.05, -length / 3);
    scene.add(massiveFloor);
}

// Elevated Cyber highway with glowing neon lanes
function createCyberHighway() {
    const width = 10;
    const length = 500;
    
    const pathCanvas = document.createElement('canvas');
    pathCanvas.width = 128;
    pathCanvas.height = 128;
    const pctx = pathCanvas.getContext('2d');
    
    pctx.fillStyle = '#06060a';
    pctx.fillRect(0, 0, 128, 128);
    
    pctx.fillStyle = '#0b0c10';
    pctx.fillRect(25, 0, 78, 128);
    
    pctx.strokeStyle = 'rgba(0, 240, 255, 0.35)'; // Cyan
    pctx.lineWidth = 4;
    pctx.beginPath();
    pctx.moveTo(42, 0); pctx.lineTo(42, 128);
    pctx.moveTo(86, 0); pctx.lineTo(86, 128);
    pctx.stroke();

    pctx.strokeStyle = '#ff007f'; // Pink
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
        metalness: 0.85,
        emissive: 0x05010a,
        emissiveIntensity: 0.4
    });

    groundPath = new THREE.Mesh(groundGeo, groundMat);
    groundPath.rotation.x = -Math.PI / 2;
    groundPath.position.set(0, 0.02, -length / 3); // Elevated
    scene.add(groundPath);

    const wireGeo = new THREE.CylinderGeometry(0.08, 0.08, length, 8);
    const wireMat = new THREE.MeshBasicMaterial({ color: COLOR_PINK });
    
    const wireLeft = new THREE.Mesh(wireGeo, wireMat);
    wireLeft.rotation.x = Math.PI / 2;
    wireLeft.position.set(-width / 2, 0.08, -length / 2);
    scene.add(wireLeft);

    const wireRight = wireLeft.clone();
    wireRight.position.x = width / 2;
    scene.add(wireRight);
}

// Procedural Fluffy Cloud Generator (High cyber mist drifting)
function create3DClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
        color: 0x221133, // Glowing dark purple clouds
        roughness: 0.95,
        metalness: 0.05,
        flatShading: true,
        emissive: 0x0c001a,
        emissiveIntensity: 0.5
    });

    for (let i = 0; i < 12; i++) {
        const cloudGroup = new THREE.Group();
        const sphereCount = 4 + Math.floor(Math.random() * 3);
        
        for (let s = 0; s < sphereCount; s++) {
            const radius = 2.0 + Math.random() * 2.2;
            const sGeo = new THREE.SphereGeometry(radius, 8, 8);
            const sMesh = new THREE.Mesh(sGeo, cloudMat);
            
            const xOff = (Math.random() - 0.5) * 3.5;
            const yOff = (Math.random() - 0.5) * 0.8;
            const zOff = (Math.random() - 0.5) * 2.8;
            sMesh.position.set(xOff, yOff, zOff);
            
            cloudGroup.add(sMesh);
        }

        const x = (Math.random() - 0.5) * 70;
        const y = 18 + Math.random() * 9;
        const z = -Math.random() * 450 - 50;
        
        cloudGroup.position.set(x, y, z);
        const driftSpeed = 0.1 + Math.random() * 0.2;
        
        scene.add(cloudGroup);
        clouds.push({
            mesh: cloudGroup,
            speed: driftSpeed,
            originalX: x
        });
    }
}

// --- PROCEDURAL 3D NEON SKYSCRAPERS & RESIDENTIAL BLOCKS (Domlar!) ---
class Building3D {
    constructor(side, z) {
        this.side = side; 
        this.z = z;

        this.modelType = Math.random() < 0.5 ? 'SKYSCRAPER' : 'APARTMENT_BLOCK';

        if (this.modelType === 'SKYSCRAPER') {
            this.w = 3.2 + Math.random() * 2.2;
            this.h = 16 + Math.random() * 28;
            this.d = 3.2 + Math.random() * 2.2;
        } else {
            // Wider, slightly shorter residential apartment block (Domlar!)
            this.w = 5.2 + Math.random() * 2.5;
            this.h = 10 + Math.random() * 8;
            this.d = 4.2 + Math.random() * 1.5;
        }

        this.buildBuildingMesh();
    }

    buildBuildingMesh() {
        this.group = new THREE.Group();

        const blockGeo = new THREE.BoxGeometry(this.w, this.h, this.d);
        const blockMat = new THREE.MeshStandardMaterial({
            color: 0x090a0f, // Reflective cyber dark core
            roughness: 0.15,
            metalness: 0.95,
            flatShading: true
        });
        this.block = new THREE.Mesh(blockGeo, blockMat);
        this.block.position.y = this.h / 2;
        this.group.add(this.block);

        if (this.modelType === 'SKYSCRAPER') {
            const stripeColors = [COLOR_CYAN, COLOR_PINK, COLOR_GREEN, COLOR_PURPLE];
            this.neonColor = stripeColors[Math.floor(Math.random() * stripeColors.length)];

            const stripeGeo = new THREE.BoxGeometry(0.12, this.h, 0.12);
            const stripeMat = new THREE.MeshStandardMaterial({
                color: this.neonColor,
                emissive: this.neonColor,
                emissiveIntensity: 1.4
            });

            this.stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
            this.stripe1.position.set(-this.w / 2 - 0.02, this.h / 2, this.d / 2 + 0.02);
            this.group.add(this.stripe1);

            this.stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
            this.stripe2.position.set(this.w / 2 + 0.02, this.h / 2, this.d / 2 + 0.02);
            this.group.add(this.stripe2);
        } else {
            // Domlar / Residential apartments: Matrix grid of glowing windows on front!
            this.windowGroup = new THREE.Group();
            this.group.add(this.windowGroup);

            const winColors = [COLOR_GOLD, COLOR_CYAN, COLOR_GREEN];
            const winColor = winColors[Math.floor(Math.random() * winColors.length)];
            
            const winGeo = new THREE.BoxGeometry(0.35, 0.35, 0.1);
            const winMat = new THREE.MeshStandardMaterial({
                color: winColor,
                emissive: winColor,
                emissiveIntensity: 1.6
            });

            const cols = 4;
            const rows = Math.floor(this.h / 1.8);
            const startX = -this.w / 2 + 0.8;
            const stepX = (this.w - 1.6) / (cols - 1 || 1);

            for (let r = 0; r < rows; r++) {
                const y = 0.9 + r * 1.5;
                for (let c = 0; c < cols; c++) {
                    const x = startX + c * stepX;
                    const win = new THREE.Mesh(winGeo, winMat);
                    win.position.set(x, y, this.d / 2 + 0.05);
                    this.windowGroup.add(win);
                }
            }
        }

        const crownGeo = new THREE.BoxGeometry(this.w * 0.85, 0.4, this.d * 0.85);
        const crownMat = new THREE.MeshStandardMaterial({
            color: COLOR_GOLD,
            emissive: COLOR_GOLD,
            emissiveIntensity: 1.8
        });
        this.crown = new THREE.Mesh(crownGeo, crownMat);
        this.crown.position.y = this.h + 0.2;
        this.group.add(this.crown);

        this.x = this.side * (6.8 + Math.random() * 22);
        this.group.position.set(this.x, 0, this.z);
        scene.add(this.group);
    }

    update(dt) {
        this.z += gameSpeed * 0.45 * dt;
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

function create3DBuildings() {
    const spacing = 28;
    for (let i = 0; i < 18; i++) {
        const z = -i * spacing - 15;
        buildings.push(new Building3D(-1, z));
        buildings.push(new Building3D(1, z));
    }

    const pGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN, transparent: true, opacity: 0.8 });
    
    for (let i = 0; i < 35; i++) {
        const pollenMesh = new THREE.Mesh(pGeo, pMat);
        const x = (Math.random() - 0.5) * 20;
        const y = 0.5 + Math.random() * 6.5;
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

// --- NEON LAMPPOSTS CLASS ---
class Lamppost3D {
    constructor(side, z) {
        this.side = side; 
        this.z = z;

        this.buildPostMesh();
    }

    buildPostMesh() {
        this.group = new THREE.Group();

        const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.0, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x222227, metalness: 0.9, roughness: 0.2 });
        this.post = new THREE.Mesh(postGeo, postMat);
        this.post.position.y = 2.0;
        this.group.add(this.post);

        const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
        this.arm = new THREE.Mesh(armGeo, postMat);
        this.arm.rotation.z = Math.PI / 2;
        this.arm.position.set(this.side * 0.6, 4.0, 0);
        this.group.add(this.arm);

        const bulbGeo = new THREE.SphereGeometry(0.18, 12, 12);
        
        const colors = [COLOR_CYAN, COLOR_PINK, COLOR_PURPLE];
        const lampColor = colors[(currentLevel - 1) % colors.length];

        const bulbMat = new THREE.MeshStandardMaterial({
            color: lampColor,
            emissive: lampColor,
            emissiveIntensity: 2.2
        });
        this.bulb = new THREE.Mesh(bulbGeo, bulbMat);
        this.bulb.position.set(this.side * 1.2, 3.82, 0);
        this.group.add(this.bulb);

        this.x = this.side * 5.1; 
        this.group.position.set(this.x, 0, this.z);
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

function createNeonLampposts() {
    const spacing = 40;
    for (let i = 0; i < 12; i++) {
        const z = -i * spacing - 20;
        lampposts.push(new Lamppost3D(-1, z));
        lampposts.push(new Lamppost3D(1, z));
    }
}

// --- 3D POWER-UP MYSTERY FLYING BOX CLASS (Uchadigan Quti!) ---
class PowerBox3D {
    constructor(lane, z) {
        this.lane = lane;
        this.z = z;
        this.collected = false;

        this.buildBoxMesh();
    }

    buildBoxMesh() {
        this.group = new THREE.Group();

        // 1. Sleek glassmorphic cyan neon box frame
        const frameGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
        const frameMat = new THREE.MeshStandardMaterial({
            color: COLOR_CYAN,
            emissive: COLOR_CYAN,
            emissiveIntensity: 1.4,
            wireframe: true
        });
        this.frame = new THREE.Mesh(frameGeo, frameMat);
        this.group.add(this.frame);

        // 2. High-energy gold spinning core
        const coreGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
        const coreMat = new THREE.MeshStandardMaterial({
            color: COLOR_GOLD,
            emissive: COLOR_GOLD,
            emissiveIntensity: 2.2,
            metalness: 0.95,
            roughness: 0.05
        });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        this.group.add(this.core);

        const spawnX = LANES[this.lane + 1];
        this.group.position.set(spawnX, 0.85, this.z);
        scene.add(this.group);
    }

    update(dt, time) {
        this.z += gameSpeed * dt;
        this.group.position.z = this.z;

        // Cool rotating mystery core animations
        this.group.rotation.y += 3.2 * dt;
        this.group.rotation.x += 1.5 * dt;
        this.group.position.y = 0.85 + Math.sin(time * 6) * 0.08;
    }

    destroy() {
        scene.remove(this.group);
        this.frame.geometry.dispose();
        this.core.geometry.dispose();
        this.frame.material.dispose();
        this.core.material.dispose();
    }
}

// --- 3D COLLECTIBLE COINS CLASS ---
class Coin3D {
    constructor(lane, z, height = 0.72) {
        this.lane = lane; 
        this.z = z;
        this.height = height; // Can spawn high in the sky!
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
        this.group.position.set(spawnX, this.height, this.z); 
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

function spawnCoinGroup() {
    const lane = Math.floor(Math.random() * 3) - 1;
    const startZ = -280;
    
    for (let i = 0; i < 5; i++) {
        coins.push(new Coin3D(lane, startZ - (i * 6.0)));
    }
}

function spawnSkyCoins() {
    // Spawns a gorgeous double lane track of sky coins during fly mode!
    const lane1 = Math.floor(Math.random() * 3) - 1;
    const startZ = -280;
    for (let i = 0; i < 6; i++) {
        coins.push(new Coin3D(lane1, startZ - (i * 5.5), 6.2));
    }
}

// --- 3D COLLECTIBLE FRUITS CLASS ---
class Fruit3D {
    constructor(lane, z) {
        this.lane = lane;
        this.z = z;
        this.collected = false;

        this.buildFruitMesh();
    }

    buildFruitMesh() {
        this.group = new THREE.Group();

        const fruitGeo = new THREE.SphereGeometry(0.24, 8, 8);
        const fruitMat = new THREE.MeshStandardMaterial({
            color: COLOR_CHERRY,
            roughness: 0.05,
            metalness: 0.8,
            emissive: 0x550000,
            emissiveIntensity: 0.5
        });

        this.cherryLeft = new THREE.Mesh(fruitGeo, fruitMat);
        this.cherryLeft.position.set(-0.12, 0, 0);
        this.group.add(this.cherryLeft);

        this.cherryRight = new THREE.Mesh(fruitGeo, fruitMat);
        this.cherryRight.position.set(0.12, -0.04, 0);
        this.group.add(this.cherryRight);

        const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x27ae60 });
        
        this.stem = new THREE.Mesh(stemGeo, stemMat);
        this.stem.rotation.z = Math.PI / 6; 
        this.stem.position.set(0, 0.2, 0);
        this.group.add(this.stem);

        const spawnX = LANES[this.lane + 1];
        this.group.position.set(spawnX, 0.85, this.z); 
        scene.add(this.group);
    }

    update(dt, time) {
        this.z += gameSpeed * dt;
        this.group.position.z = this.z;

        this.group.rotation.y += 2.2 * dt;
        this.group.position.y = 0.85 + Math.sin(time * 4) * 0.08; 
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

// --- 3D FUTURISTIC FLYING HOVER-CARS CLASS ---
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

// --- ADVANCED 3D FLAPPING CYBER BIRDS CLASS ---
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

        const bodyGeo = new THREE.ConeGeometry(0.2, 0.7, 6);
        bodyGeo.rotateX(Math.PI / 2); 
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: COLOR_CYAN, 
            roughness: 0.5, 
            flatShading: true,
            emissive: 0x004488 
        });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.group.add(this.body);

        const beakGeo = new THREE.ConeGeometry(0.06, 0.22, 5);
        beakGeo.rotateX(Math.PI / 2);
        const beakMat = new THREE.MeshStandardMaterial({ color: COLOR_GOLD, roughness: 0.1 });
        this.beak = new THREE.Mesh(beakGeo, beakMat);
        this.beak.position.set(0, 0, 0.45); 
        this.group.add(this.beak);

        const tailGeo = new THREE.BoxGeometry(0.05, 0.01, 0.7);
        tailGeo.translate(0, 0, -0.35); 
        const tailMat = new THREE.MeshStandardMaterial({ color: COLOR_PINK, roughness: 0.9 });
        
        this.tailLeft = new THREE.Mesh(tailGeo, tailMat);
        this.tailLeft.rotation.y = -Math.PI / 12;
        this.tailLeft.position.set(-0.06, -0.05, -0.32);
        this.group.add(this.tailLeft);

        this.tailRight = this.tailLeft.clone();
        this.tailRight.rotation.y = Math.PI / 12;
        this.tailRight.position.x = 0.06;
        this.group.add(this.tailRight);

        const wingGeo = new THREE.BoxGeometry(0.7, 0.02, 0.28);
        wingGeo.translate(0.35, 0, 0); 

        const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, flatShading: true });
        
        this.leftWing = new THREE.Mesh(wingGeo, wingMat);
        this.leftWing.position.set(-0.1, 0, 0);
        this.group.add(this.leftWing);

        this.rightWing = new THREE.Mesh(wingGeo, wingMat);
        this.rightWing.rotation.y = Math.PI; 
        this.rightWing.position.set(0.1, 0, 0);
        this.group.add(this.rightWing);

        this.group.position.set(this.x, this.y, this.z);
        scene.add(this.group);
    }

    update(dt, time) {
        this.z += (gameSpeed + this.speedOffset) * dt;
        this.group.position.z = this.z;

        const flap = Math.sin(time * 15 + this.wingOffset) * 0.75;
        this.leftWing.rotation.z = flap;
        this.rightWing.rotation.z = -flap; 

        this.tailLeft.rotation.x = Math.sin(time * 8) * 0.15;
        this.tailRight.rotation.x = Math.sin(time * 8) * 0.15;
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

// --- 3D SPACE NINJA PLAYER WITH DROP SHADOW! ---
class Player3D {
    constructor() {
        this.group = new THREE.Group();
        scene.add(this.group);

        this.y = 0.1;
        this.vy = 0;
        this.gravity = -54; 
        this.jumpForce = 21.5;
        
        this.currentLane = 0; 
        this.targetX = 0;
        this.laneSpeed = 16; 

        this.isJumping = false;
        this.isDoubleJumping = false;
        this.isSliding = false;
        this.animTime = 0;

        this.width = 0.9;
        this.height = 1.6;
        this.depth = 1.0;

        this.buildSpaceNinjaMesh();

        const shadowGeo = new THREE.RingGeometry(0.01, 0.42, 16);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x010201, 
            transparent: true, 
            opacity: 0.65, 
            side: THREE.DoubleSide 
        });
        this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
        this.shadow.rotation.x = -Math.PI / 2; // Flat
        scene.add(this.shadow);
    }

    buildSpaceNinjaMesh() {
        const darkSuitsMat = new THREE.MeshStandardMaterial({ color: 0x1d2127, roughness: 0.4, metalness: 0.9 });
        const neonGreenMat = new THREE.MeshStandardMaterial({ color: COLOR_GREEN, emissive: COLOR_GREEN, emissiveIntensity: 0.8 });
        const neonPinkMat = new THREE.MeshStandardMaterial({ color: COLOR_PINK, emissive: COLOR_PINK, emissiveIntensity: 0.9 });
        const cyanVisorMat = new THREE.MeshStandardMaterial({ color: COLOR_CYAN, emissive: COLOR_CYAN, emissiveIntensity: 1.0 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.1, metalness: 0.95 });

        this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.45), darkSuitsMat);
        this.torso.position.y = 1.0;
        this.group.add(this.torso);

        const coreGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
        this.chestCore = new THREE.Mesh(coreGeo, neonGreenMat);
        this.chestCore.rotation.x = Math.PI / 2;
        this.chestCore.position.set(0, 1.15, 0.23);
        this.group.add(this.chestCore);

        this.head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), chromeMat);
        this.head.position.y = 1.65;
        this.group.add(this.head);

        const visorGeo = new THREE.SphereGeometry(0.27, 12, 12, 0, Math.PI, 0, Math.PI / 2);
        this.visor = new THREE.Mesh(visorGeo, cyanVisorMat);
        this.visor.rotation.x = Math.PI / 2.5;
        this.visor.position.set(0, 1.68, 0.05);
        this.group.add(this.visor);

        this.capeGroup = new THREE.Group();
        this.capeGroup.position.set(0, 1.35, -0.22);
        this.group.add(this.capeGroup);

        const capeGeo = new THREE.BoxGeometry(0.68, 1.3, 0.03);
        capeGeo.translate(0, -0.65, 0); 
        this.cape = new THREE.Mesh(capeGeo, neonGreenMat);
        this.capeGroup.add(this.cape);

        const stripeGeo = new THREE.BoxGeometry(0.06, 1.3, 0.04);
        stripeGeo.translate(0, -0.65, 0);
        
        const stripeLeft = new THREE.Mesh(stripeGeo, neonPinkMat);
        stripeLeft.position.set(-0.35, 0, 0.01);
        this.capeGroup.add(stripeLeft);

        const stripeRight = stripeLeft.clone();
        stripeRight.position.x = 0.35;
        this.capeGroup.add(stripeRight);

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

        this.jetpackLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8), chromeMat);
        this.jetpackLeft.position.set(-0.25, 1.25, -0.23);
        this.group.add(this.jetpackLeft);

        this.jetpackRight = this.jetpackLeft.clone();
        this.jetpackRight.position.x = 0.25;
        this.group.add(this.jetpackRight);

        // Substantially larger hyper flame cones for fly mode!
        const flameGeo = new THREE.ConeGeometry(0.12, 0.8, 8);
        flameGeo.translate(0, -0.4, 0); 
        const flameMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });

        this.flameLeft = new THREE.Mesh(flameGeo, flameMat);
        this.flameLeft.position.set(0, -0.225, 0);
        this.flameLeft.visible = false;
        this.jetpackLeft.add(this.flameLeft);

        this.flameRight = this.flameLeft.clone();
        this.flameRight.visible = false;
        this.jetpackRight.add(this.flameRight);

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
        if (gameState === 'PLAYING') {
            if (this.currentLane > -1) {
                this.currentLane--;
                this.targetX = LANES[this.currentLane + 1]; 
                spawnSparks3D(this.group.position.x, this.y + 0.2, this.group.position.z, COLOR_CYAN);
                audio.playSlideSFX();
            }
        }
    }

    steerRight() {
        if (gameState === 'PLAYING') {
            if (this.currentLane < 1) {
                this.currentLane++;
                this.targetX = LANES[this.currentLane + 1];
                spawnSparks3D(this.group.position.x, this.y + 0.2, this.group.position.z, COLOR_CYAN);
                audio.playSlideSFX();
            }
        }
    }

    jump() {
        if (isFlyingMode) return; // Cannot jump during flying
        
        if (!this.isJumping) {
            this.vy = this.jumpForce;
            this.isJumping = true;
            this.isSliding = false;
            
            spawnSparks3D(this.group.position.x, this.y, this.group.position.z, COLOR_GREEN);
            audio.playJumpSFX();
        } else if (!this.isDoubleJumping) {
            this.vy = this.jumpForce * 0.85;
            this.isDoubleJumping = true;
            
            showAlert("JETPACK REAKTIV KUCHI!", "cyan");
            audio.playJumpSFX();

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
        if (isFlyingMode) return; 
        
        if (active) {
            if (!this.isJumping) {
                this.isSliding = true;
                this.height = 0.75;
                this.group.rotation.x = -Math.PI / 2.5;
                this.group.position.y = 0.3;
                audio.playSlideSFX();
            }
        } else {
            this.isSliding = false;
            this.height = 1.6;
            this.group.rotation.x = 0;
            this.group.position.y = this.y;
        }
    }

    update(dt) {
        if (isFlyingMode) {
            // Flying Mode: Glide player smoothly up to y = 6.2
            this.y += (6.2 - this.y) * 8.5 * dt;
            this.vy = 0;
            this.isJumping = false;
            this.isDoubleJumping = false;
            
            // Thrust flame fully visible!
            this.flameLeft.visible = true;
            this.flameRight.visible = true;
            const flicker = 1.2 + Math.random() * 0.4;
            this.flameLeft.scale.y = flicker;
            this.flameRight.scale.y = flicker;
            
            // Spawn continuous engine sparks!
            if (Math.random() < 0.38) {
                particles.push(new Particle3D(
                    this.group.position.x + (Math.random() - 0.5) * 0.3,
                    this.y + 0.8,
                    this.group.position.z - 0.25,
                    (Math.random() - 0.5) * 4,
                    -4 - Math.random() * 8,
                    gameSpeed * 0.35,
                    COLOR_CYAN, 0.08, 0.25
                ));
            }
        } else {
            // Standard runner physics
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
        } else if (isFlyingMode) {
            // Cool aerial flying pose (legs extended back)
            this.leftLeg.rotation.x = 0.8;
            this.rightLeg.rotation.x = 0.8;
            this.leftArm.rotation.x = -0.4;
            this.rightArm.rotation.x = -0.4;
            this.capeGroup.rotation.x = Math.PI / 2.2;
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

        if (this.shadow) {
            this.shadow.position.set(this.group.position.x, 0.03, this.group.position.z);
            const heightRatio = Math.max(0, 1 - (this.y - 0.1) * 0.08);
            this.shadow.scale.set(heightRatio, heightRatio, heightRatio);
            this.shadow.material.opacity = 0.65 * heightRatio;
        }
    }

    destroy() {
        scene.remove(this.group);
        scene.remove(this.shadow);
    }
}

// --- 3D VICTORY FINISH GATE ---
class VictoryGate3D {
    constructor(z) {
        this.z = z;
        this.buildGateMesh();
    }

    buildGateMesh() {
        this.group = new THREE.Group();

        const pillarGeo = new THREE.CylinderGeometry(0.3, 0.4, 6.0, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ 
            color: COLOR_GREEN, 
            emissive: COLOR_GREEN, 
            emissiveIntensity: 1.0 
        });

        this.pillarLeft = new THREE.Mesh(pillarGeo, pillarMat);
        this.pillarLeft.position.set(-LANE_WIDTH - 1.2, 3.0, 0);
        this.group.add(this.pillarLeft);

        this.pillarRight = this.pillarLeft.clone();
        this.pillarRight.position.x = LANE_WIDTH + 1.2;
        this.group.add(this.pillarRight);

        const beamGeo = new THREE.BoxGeometry(7.0, 0.6, 0.6);
        const beamMat = new THREE.MeshStandardMaterial({ 
            color: COLOR_CYAN, 
            emissive: COLOR_CYAN, 
            emissiveIntensity: 1.2 
        });
        
        this.header = new THREE.Mesh(beamGeo, beamMat);
        this.header.position.set(0, 6.0, 0);
        this.group.add(this.header);

        // Rotating cyber portal ring above Victory gate
        const ringGeo = new THREE.TorusGeometry(2.2, 0.14, 8, 32);
        const ringMat = new THREE.MeshStandardMaterial({
            color: COLOR_PINK,
            emissive: COLOR_PINK,
            emissiveIntensity: 1.8
        });
        this.portalRing = new THREE.Mesh(ringGeo, ringMat);
        this.portalRing.position.set(0, 3.0, 0);
        this.group.add(this.portalRing);

        const coreGeo = new THREE.BoxGeometry(3.5, 0.8, 0.1);
        const coreMat = new THREE.MeshStandardMaterial({ 
            color: COLOR_GOLD, 
            emissive: COLOR_GOLD, 
            emissiveIntensity: 1.8 
        });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        this.core.position.set(0, 5.0, 0);
        this.group.add(this.core);

        this.group.position.set(0, 0, this.z);
        scene.add(this.group);
    }

    update(dt) {
        this.z += gameSpeed * dt;
        this.group.position.z = this.z;
        this.core.material.emissiveIntensity = 1.2 + Math.sin(clock.getElapsedTime() * 12) * 0.6;
        
        if (this.portalRing) {
            this.portalRing.rotation.z += 2.5 * dt; 
        }
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

// --- REDESIGNED PRESTIGE OBSTACLES (Plasma Mine, Cyber Warning Arch, Shimmering Forcefield!) ---
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
            this.height = 0.85;
            this.depth = 1.5;

            const mineCore = new THREE.Mesh(
                new THREE.SphereGeometry(0.35, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.9, roughness: 0.1 })
            );
            mineCore.position.y = 0.5;
            this.group.add(mineCore);

            this.torus = new THREE.Mesh(
                new THREE.TorusGeometry(0.55, 0.08, 6, 16),
                new THREE.MeshStandardMaterial({ color: COLOR_PINK, emissive: COLOR_PINK, emissiveIntensity: 1.6 })
            );
            this.torus.position.y = 0.5;
            this.group.add(this.torus);

            const ant = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.6),
                new THREE.MeshStandardMaterial({ color: COLOR_GOLD, emissive: COLOR_GOLD, emissiveIntensity: 1.5 })
            );
            ant.position.set(0, 0.8, 0);
            this.group.add(ant);
        } 
        
        else if (this.type === 1) {
            this.width = 2.6;
            this.height = 0.35;
            this.depth = 0.35;
            
            const cylinderGeo = new THREE.CylinderGeometry(0.12, 0.12, this.width, 8);
            const laserMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN });
            const laserMesh = new THREE.Mesh(cylinderGeo, laserMat);
            laserMesh.rotation.z = Math.PI / 2;
            laserMesh.position.y = 2.05; 
            this.group.add(laserMesh);

            const emblemGeo = new THREE.ConeGeometry(0.18, 0.28, 3);
            const emblemMat = new THREE.MeshStandardMaterial({ color: COLOR_GOLD, emissive: COLOR_GOLD, emissiveIntensity: 1.8 });
            this.emblem = new THREE.Mesh(emblemGeo, emblemMat);
            this.emblem.position.set(0, 2.05, 0.1);
            this.emblem.rotation.z = Math.PI; 
            this.group.add(this.emblem);

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

            const panelGeo = new THREE.BoxGeometry(this.width - 0.1, this.height - 0.1, 0.1);
            const panelMat = new THREE.MeshStandardMaterial({
                color: COLOR_PURPLE,
                transparent: true,
                opacity: 0.72,
                emissive: COLOR_PURPLE,
                emissiveIntensity: 1.8,
                roughness: 0.05,
                metalness: 0.95
            });
            this.panel = new THREE.Mesh(panelGeo, panelMat);
            this.panel.position.y = this.height / 2;
            this.group.add(this.panel);

            const frameGeo = new THREE.BoxGeometry(this.width, this.height, 0.2);
            const frameMat = new THREE.MeshStandardMaterial({
                color: COLOR_PINK,
                emissive: COLOR_PINK,
                emissiveIntensity: 1.5,
                wireframe: true
            });
            const frame = new THREE.Mesh(frameGeo, frameMat);
            frame.position.y = this.height / 2;
            this.group.add(frame);
        }

        const spawnX = LANES[this.lane + 1];
        this.group.position.set(spawnX, 0, this.z);
        scene.add(this.group);
    }

    update(dt) {
        this.z += gameSpeed * dt;
        this.group.position.z = this.z;

        if (this.type === 0 && this.torus) {
            this.torus.rotation.z += 4.5 * dt;
            this.torus.rotation.x += 1.8 * dt;
        }
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
    if (isFlyingMode) return false; // Invincible while flying in sky!

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

function checkCoinCollision(p, c) {
    const pZ = p.group.position.z;
    const pX = p.group.position.x;
    const pY = p.group.position.y;

    const cX = LANES[c.lane + 1];
    const cZ = c.z;
    const cY = c.height; 

    const dist = Math.sqrt((pX - cX)**2 + (pY + 0.8 - cY)**2 + (pZ - cZ)**2);
    return dist < 1.05; 
}

function checkFruitCollision(p, f) {
    if (isFlyingMode) return false; // Fruits spawn only on ground

    const pZ = p.group.position.z;
    const pX = p.group.position.x;
    const pY = p.group.position.y;

    const fX = LANES[f.lane + 1];
    const fZ = f.z;
    const fY = f.group.position.y; 

    const dist = Math.sqrt((pX - fX)**2 + (pY + 0.8 - fY)**2 + (pZ - fZ)**2);
    return dist < 1.15; 
}

function checkPowerBoxCollision(p, pb) {
    if (isFlyingMode) return false; // Cannot grab while already flying

    const pZ = p.group.position.z;
    const pX = p.group.position.x;
    const pY = p.group.position.y;

    const pbX = LANES[pb.lane + 1];
    const pbZ = pb.z;
    const pbY = 0.85;

    const dist = Math.sqrt((pX - pbX)**2 + (pY + 0.8 - pbY)**2 + (pZ - pbZ)**2);
    return dist < 1.15;
}

function transitionLevelTheme(level) {
    hudLevel.textContent = level;
}

// --- INPUT TRIGGERS ---
function steerLeft() {
    player.steerLeft();
}

function steerRight() {
    player.steerRight();
}

function triggerJump() {
    player.jump();
}

function startSlide() {
    player.slide(true);
}

function stopSlide() {
    player.slide(false);
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

// Touch controls
mobileLeftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); steerLeft(); });
mobileRightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); steerRight(); });
mobileJumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); triggerJump(); });
mobileSlideBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startSlide(); });
mobileSlideBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopSlide(); });

// Mouse support
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
    powerBoxes.forEach(pb => pb.destroy());
    hoverCars.forEach(hc => hc.destroy());
    birds.forEach(b => b.destroy());
    particles.forEach(p => p.destroy());
    if (victoryGate) {
        victoryGate.destroy();
        victoryGate = null;
    }
    
    score = 0;
    coinsCollected = 0;
    distanceRun = 0;
    gameSpeed = 38 + (currentLevel - 1) * 8; 
    
    obstacleTimer = 0;
    coinGroupTimer = 0;
    fruitTimer = 0;
    powerBoxTimer = 0;
    cameraShake = 0;
    isFlyingMode = false;
    flightTimer = 0;
    
    obstacles = [];
    coins = [];
    fruits = [];
    powerBoxes = [];
    hoverCars = [];
    birds = [];
    particles = [];

    player.y = 0.1;
    player.vy = 0;
    player.currentLane = 0;
    player.group.position.x = 0;
    player.isJumping = false;
    player.isDoubleJumping = false;
    player.slide(false);

    currentScoreEl.textContent = '00000';
    hudCoins.textContent = '000';
    hudLevel.textContent = currentLevel;
    comboText.textContent = '1.0x';

    transitionLevelTheme(currentLevel);
}

function startGame() {
    init();
    gameState = 'PLAYING';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');
    hud.classList.remove('hidden');

    showAlert("BOSHLADIK! NEON SHAHAR CHAQIRIQLARI!", "green");
    audio.startBGM();
}

function triggerLevelVictory() {
    gameState = 'VICTORY';
    
    showAlert("LEVEL YAKUNLANDI! G'ALABA!", "gold");
    audio.playVictorySFX();

    const colors = [COLOR_GREEN, COLOR_CYAN, COLOR_PINK, COLOR_GOLD];
    for (let f = 0; f < 6; f++) {
        setTimeout(() => {
            const rx = player.group.position.x + (Math.random() - 0.5) * 8;
            const ry = 2.0 + Math.random() * 4;
            const rz = player.group.position.z - 5 - Math.random() * 10;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            for (let i = 0; i < 35; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 16 + 4;
                const vx = Math.cos(angle) * speed;
                const vy = (Math.random() - 0.5) * 12;
                const vz = Math.sin(angle) * speed;
                particles.push(new Particle3D(
                    rx, ry, rz,
                    vx, vy, vz,
                    randomColor, 0.16, 0.8
                ));
            }
            cameraShake = 0.6;
        }, f * 350);
    }

    victoryLevelEl.textContent = currentLevel;
    victoryCoinsEl.textContent = coinsCollected;
    victoryScoreEl.textContent = Math.floor(score);

    setTimeout(() => {
        victoryScreen.classList.remove('hidden');
    }, 2800);
}

function loadNextLevel() {
    currentLevel++;
    startGame();
}

function gameOver() {
    gameState = 'GAMEOVER';
    cameraShake = 1.9;
    
    audio.playCrashSFX();
    showAlert("TIZIM CRASH BO'LDI!", "pink");

    spawnSparks3D(player.group.position.x, player.group.position.y + 0.8, player.group.position.z, COLOR_RED);
    
    if (navigator.vibrate) {
        navigator.vibrate(250);
    }

    const finalScore = Math.floor(score);
    finalScoreEl.textContent = finalScore;
    finalCoinsEl.textContent = coinsCollected;
    
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('cyber_city_grand_highscore', highScore);
        highScoreEl.textContent = String(highScore).padStart(5, '0');
        newRecordTag.classList.remove('hidden');
    } else {
        newRecordTag.classList.add('hidden');
    }
    
    bestScoreEl.textContent = highScore;
    currentLevel = 1;

    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 600);
}

// UI Buttons Connect
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
nextLevelBtn.addEventListener('click', loadNextLevel);

// --- MAIN 3D CYBER CITY GAMELOOP ---
function tick() {
    requestAnimationFrame(tick);
    
    const dt = Math.min(0.03, clock.getDelta());
    const time = clock.getElapsedTime();

    if (gameState === 'PLAYING') {
        // --- REAL-TIME DYNAMIC DAY-NIGHT CYCLE ---
        const cycleFactor = 0.5 + 0.5 * Math.sin(time * 0.125); 

        // 1. Interpolate Sky Background Color
        const nightSky = new THREE.Color(0x010103);
        const daySky = new THREE.Color(COLOR_SKY_BLUE);
        const currentSky = nightSky.clone().lerp(daySky, cycleFactor);
        scene.background.copy(currentSky);

        // 2. Interpolate Fog Color
        const nightFog = new THREE.Color(0x030107);
        const dayFog = new THREE.Color(COLOR_SUN_MIST);
        const currentFog = nightFog.clone().lerp(dayFog, cycleFactor);
        scene.fog.color.copy(currentFog);
        scene.fog.density = 0.009 - 0.002 * cycleFactor;

        // 3. Interpolate Ground Asphalt grid color (Grid becomes green maysazor during day!)
        const nightGrass = new THREE.Color(0x020204);
        const dayGrass = new THREE.Color(0x143c1a);
        if (massiveFloor) {
            massiveFloor.material.color.copy(nightGrass.clone().lerp(dayGrass, cycleFactor));
        }

        // 4. Interpolate Ambient & Sun Light intensities (Yorug' va qorong'i!)
        if (ambientLight) {
            ambientLight.intensity = 0.06 + 0.74 * cycleFactor;
            const nightAmb = new THREE.Color(0x090a12);
            const dayAmb = new THREE.Color(0xeef6ff);
            ambientLight.color.copy(nightAmb.clone().lerp(dayAmb, cycleFactor));
        }
        if (sunLight) {
            sunLight.intensity = 0.1 + 1.2 * cycleFactor;
        }

        // --- FLIGHT TIMER LOGIC (Uchadigan quti mantiqi!) ---
        if (isFlyingMode) {
            flightTimer -= dt;
            if (flightTimer <= 0) {
                isFlyingMode = false;
                showAlert("JETPACK REAKTIV TUGADI! ERGA QAYTAMIZ!", "pink");
            }
        }

        // --- DYNAMIC SCENE ELEMENT ACTIONS ---

        if (groundPath) {
            groundPath.material.map.offset.y -= gameSpeed * 0.00045 * (dt / 0.016);
        }

        // Parallax skyscrapers canyon loop
        buildings.forEach(b => {
            b.update(dt);
            
            const emissiveMult = 1.6 * (1 - cycleFactor);
            if (b.stripe1 && b.stripe2) {
                b.stripe1.material.emissiveIntensity = emissiveMult;
                b.stripe2.material.emissiveIntensity = emissiveMult;
            }

            if (b.windowGroup) {
                b.windowGroup.traverse(w => {
                    if (w.isMesh) {
                        w.material.emissiveIntensity = 1.6 * (1 - cycleFactor * 0.6);
                    }
                });
            }

            if (b.z > 25) {
                b.z = -450 - Math.random() * 50;
                b.group.position.z = b.z;
                b.x = b.side * (6.8 + Math.random() * 22);
                b.group.position.x = b.x;
            }
        });

        // Parallax neon lampposts loop
        lampposts.forEach(lp => {
            lp.update(dt);
            if (lp.bulb) {
                lp.bulb.material.emissiveIntensity = 2.2 * (1 - cycleFactor);
            }
            if (lp.z > 25) {
                lp.z = -450;
                lp.group.position.z = -450;
            }
        });

        // Parallax drifting Clouds loop
        clouds.forEach(c => {
            c.mesh.position.z += gameSpeed * 0.42 * dt * c.speed;
            if (c.mesh.position.z > 40) {
                c.mesh.position.z = -450 - Math.random() * 80;
                c.mesh.position.x = (Math.random() - 0.5) * 70;
                c.mesh.position.y = 18 + Math.random() * 9;
            }
        });

        // Drift digital sunlit particles
        pollen.forEach(p => {
            p.mesh.position.z += gameSpeed * 0.45 * dt;
            p.mesh.position.x += Math.sin(time * p.speed + p.timeOffset) * 0.035;
            p.mesh.position.y += Math.cos(time * p.speed + p.timeOffset) * 0.018;

            if (p.mesh.position.z > 20) {
                p.mesh.position.z = -450 - Math.random() * 30;
                p.mesh.position.x = (Math.random() - 0.5) * 20;
                p.mesh.position.y = 0.5 + Math.random() * 6.5;
            }
        });

        // Spawning flying hover-cars periodically
        if (Math.random() < 0.008) {
            hoverCars.push(new HoverCar3D());
        }

        // Update Hover-Cars
        for (let i = hoverCars.length - 1; i >= 0; i--) {
            const hc = hoverCars[i];
            hc.update(dt);
            if (hc.z > 40) {
                hc.destroy();
                hoverCars.splice(i, 1);
            }
        }

        // Spawning flapping cyber-birds periodically
        if (Math.random() < 0.006) {
            birds.push(new Bird3D());
        }

        // Update flapping birds
        for (let i = birds.length - 1; i >= 0; i--) {
            const b = birds[i];
            b.update(dt, time);
            if (b.z > 40) {
                b.destroy();
                birds.splice(i, 1);
            }
        }

        // Spawning Flying Mystery Power-up Boxes periodically! Every 12 seconds!
        powerBoxTimer += dt;
        if (powerBoxTimer >= 12.0 && distanceRun < LEVEL_DISTANCE_GOAL - 150) {
            const lane = Math.floor(Math.random() * 3) - 1;
            powerBoxes.push(new PowerBox3D(lane, -280));
            powerBoxTimer = 0;
        }

        // Update and Collide Flying Power-Up Boxes
        for (let i = powerBoxes.length - 1; i >= 0; i--) {
            const pb = powerBoxes[i];
            pb.update(dt, time);

            if (checkPowerBoxCollision(player, pb)) {
                pb.collected = true;
                
                isFlyingMode = true;
                flightTimer = FLIGHT_DURATION;
                
                audio.playPowerUpSFX();
                showAlert("UCHISH QUTISI! JETPACK REAKTIV KUCHI!", "gold");

                // Trigger large cyan booster spark explosions!
                for (let k = 0; k < 25; k++) {
                    particles.push(new Particle3D(
                        pb.group.position.x,
                        pb.group.position.y,
                        pb.group.position.z,
                        (Math.random() - 0.5) * 16,
                        Math.random() * 14 + 4,
                        (Math.random() - 0.5) * 16,
                        COLOR_CYAN, 0.15, 0.55
                    ));
                }

                // Immediately spawn a track of Sky Coins high up!
                spawnSkyCoins();

                pb.destroy();
                powerBoxes.splice(i, 1);
                continue;
            }

            if (pb.z > 15) {
                pb.destroy();
                powerBoxes.splice(i, 1);
            }
        }

        // Spawning abundant gold coins! Every 1.65 seconds!
        coinGroupTimer += dt;
        if (coinGroupTimer >= 1.65 && distanceRun < LEVEL_DISTANCE_GOAL - 100) {
            if (isFlyingMode) {
                // Spawn sky coin groups during flight mode!
                spawnSkyCoins();
            } else {
                spawnCoinGroup();
            }
            coinGroupTimer = 0;
        }

        // Update and Collide Gold Coins
        for (let i = coins.length - 1; i >= 0; i--) {
            const c = coins[i];
            c.update(dt);

            if (checkCoinCollision(player, c)) {
                c.collected = true;
                
                coinsCollected++;
                hudCoins.textContent = String(coinsCollected).padStart(3, '0');
                
                score += 50; 
                audio.playCoinSFX();
                
                if (coinsCollected % 10 === 0) {
                    showAlert(`TANGALAR YIG'ILDI! +${coinsCollected * 50} BALL!`, "gold");
                }
                
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

        // Spawning 3D Collectible Fruits
        fruitTimer += dt;
        if (fruitTimer >= 3.5 && distanceRun < LEVEL_DISTANCE_GOAL - 100) {
            const lane = Math.floor(Math.random() * 3) - 1;
            fruits.push(new Fruit3D(lane, -280));
            fruitTimer = 0;
        }

        // Update and Collide 3D Fruits
        for (let i = fruits.length - 1; i >= 0; i--) {
            const f = fruits[i];
            f.update(dt, time);

            if (checkFruitCollision(player, f)) {
                f.collected = true;
                score += 150; 
                
                showAlert("BONUS CHERRY MEVA! +150 BALL!", "pink");
                audio.playFruitSFX();

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

        // Spawning obstacles
        obstacleTimer += dt;
        if (obstacleTimer >= nextObstacleTime && distanceRun < LEVEL_DISTANCE_GOAL - 150) {
            obstacles.push(new Obstacle3D());
            obstacleTimer = 0;
            nextObstacleTime = Math.max(0.6, 1.7 - (gameSpeed * 0.014) + Math.random() * 0.35);
        }

        // Update Obstacles
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

                showAlert("DODGED! COMBO OSHDI! +180 BALL!", "cyan");
                spawnSparks3D(o.group.position.x, player.group.position.y + 0.5, o.z, COLOR_GOLD);
            }

            if (o.z > 15) {
                o.destroy();
                obstacles.splice(i, 1);
            }
        }

        // Spawn Finish Victory Gate when distance limit reached!
        if (distanceRun >= LEVEL_DISTANCE_GOAL && !victoryGate) {
            victoryGate = new VictoryGate3D(-280);
            showAlert("DIQQAT! FINISH GATE SPAWN BO'LDI! TEZROQ!", "gold");
            audio.playLevelUpSFX();
        }

        // Update and trigger Victory Gate collision
        if (victoryGate) {
            victoryGate.update(dt);
            
            if (victoryGate.z >= player.group.position.z) {
                triggerLevelVictory();
            }
        }

        // Update Player
        player.update(dt);

        // Accelerate runner
        distanceRun += gameSpeed * dt * 0.25; 
        score += dt * 18;
        if (gameSpeed < MAX_SPEED) {
            gameSpeed += 0.28 * dt;
        }

        currentScoreEl.textContent = String(Math.floor(score)).padStart(5, '0');
    } 
    
    else if (gameState === 'VICTORY') {
        // --- EPIC SLOW-MOTION MATRIX CAMERA ZOOM SPIN ---
        const slowDt = dt * 0.12; 
        
        if (victoryGate) {
            victoryGate.update(slowDt);
        }
        player.update(slowDt);

        camera.position.x = 8.5 * Math.sin(time * 0.45);
        camera.position.z = 8.5 * Math.cos(time * 0.45);
        camera.position.y = 2.8 + Math.sin(time * 0.2) * 1.5;
        camera.lookAt(player.group.position.x, player.group.position.y + 0.8, player.group.position.z);
    }

    // Particle engine update
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        if (p.life <= 0) {
            p.destroy();
            particles.splice(i, 1);
        }
    }

    // Camera Follow (Only in standard play states)
    if (player && gameState !== 'VICTORY') {
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

// Bootstrap Cyber City Scene
initThree();
requestAnimationFrame(tick);
