// ====================================
// Space Journey — Immersive Three.js Experience
// Triggered by the banana easter egg
// ====================================

import * as THREE from 'three';

/* ─── Domain content ─── */
const DOMAINS = {
    'cv-edge': {
        title: 'Computer Vision Research & Engineering',
        color: '#22d3ee',
        planets: [
            {
                id: 'compact-vlm', title: 'Compact VLM Research',
                sub: '78% safety score — SmolVLM2 + QLoRA',
                color: '#f5d547', rings: true, size: 1.8
            },
            {
                id: 'uav-detection', title: 'UAV Vehicle Detection',
                sub: 'YOLOv11 + Transfer Learning',
                color: '#22d3ee', rings: false, size: 1.3
            },
            {
                id: 'edge-ai', title: 'Edge AI — Jetson',
                sub: 'Real-time inference on Jetson Nano & Xavier',
                color: '#a855f7', rings: true, size: 1.5
            },
            {
                id: 'image-processing', title: 'Image Processing',
                sub: 'Classical CV algorithms & filters',
                color: '#22c55e', rings: false, size: 1.1
            },
            {
                id: null, title: 'Saint-Gobain Internship',
                sub: 'CV for glass furnace monitoring',
                color: '#f97316', rings: true, size: 1.4
            },
            {
                id: null, title: 'Publications',
                sub: '2 Springer papers on vehicle detection',
                color: '#e2e8f0', rings: false, size: 1.2
            }
        ]
    },
    'rl-gen': {
        title: 'Machine Learning Research & Engineering',
        color: '#a855f7',
        planets: [
            {
                id: 'arithmetic-llm', title: 'Arithmetic LLM',
                sub: 'Supervised pretraining vs RL fine-tuning',
                color: '#f5d547', rings: true, size: 1.6
            },
            {
                id: 'dqn-cartpole', title: 'DQN CartPole',
                sub: 'Deep Q-Learning with experience replay',
                color: '#22d3ee', rings: true, size: 1.3
            },
            {
                id: 'gan', title: 'VAE vs GAN',
                sub: 'Synthetic data generation comparison',
                color: '#a855f7', rings: false, size: 1.5
            },
            {
                id: 'continual-learning', title: 'Continual Learning',
                sub: 'Multitask classification without forgetting',
                color: '#22c55e', rings: true, size: 1.2
            },
            {
                id: null, title: 'Transformers & NLP',
                sub: 'Attention mechanisms & language models',
                color: '#f97316', rings: false, size: 1.4
            },
            {
                id: null, title: 'MCP Hackathon',
                sub: 'Mistral AI — Facebook integration',
                color: '#e2e8f0', rings: true, size: 1.1
            }
        ]
    }
};

/* ─── Shaders ─── */
const PLANET_VERTEX = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const PLANET_FRAGMENT = `
    uniform vec3 uColor;
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    float hash(vec3 p) {
        p = fract(p * 0.3183099 + .1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                       mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                       mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }

    // Fractal Brownian Motion for terrain detail
    float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100.0);
        for (int i = 0; i < 6; i++) {
            v += a * noise(p);
            p = p * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec3 lightDir = normalize(vec3(0.6, 0.4, 0.8));
        float NdotL = max(dot(vNormal, lightDir), 0.0);

        // Multi-scale terrain
        float terrain = fbm(vPosition * 1.5 + uTime * 0.02);
        float detail = fbm(vPosition * 6.0 - uTime * 0.01);
        float clouds = smoothstep(0.45, 0.65, fbm(vPosition * 2.5 + uTime * 0.08));

        // Color regions — continents, oceans, clouds
        vec3 deepColor = uColor * 0.15;
        vec3 midColor = uColor * 0.65;
        vec3 highColor = uColor * 1.1;
        vec3 cloudColor = vec3(1.0, 1.0, 1.0) * 0.9;

        vec3 surfaceColor = mix(deepColor, midColor, smoothstep(0.3, 0.5, terrain));
        surfaceColor = mix(surfaceColor, highColor, smoothstep(0.55, 0.75, terrain + detail * 0.3));
        surfaceColor = mix(surfaceColor, cloudColor, clouds * 0.4);

        // Diffuse + ambient
        float ambient = 0.12;
        float diffuse = NdotL * 0.85;
        vec3 lit = surfaceColor * (ambient + diffuse);

        // Specular highlight
        vec3 viewDir = normalize(-vPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(vNormal, halfDir), 0.0), 40.0);
        lit += vec3(1.0) * spec * 0.25;

        // Fresnel rim glow
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 4.0);
        lit += uColor * fresnel * 0.35;

        // Terminator shadow softness
        float terminator = smoothstep(-0.05, 0.15, NdotL);
        lit *= terminator * 0.85 + 0.15;

        gl_FragColor = vec4(lit, 1.0);
    }
`;

const ATMOSPHERE_VERTEX = `
    varying vec3 vNormal;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const ATMOSPHERE_FRAGMENT = `
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.5);
        vec3 glow = uColor * 1.4;
        gl_FragColor = vec4(glow, intensity * 0.55);
    }
`;

/* ─── Star tunnel shaders ─── */
const STAR_VERTEX = `
    attribute float aSize;
    attribute float aSpeed;
    uniform float uTime;
    uniform float uWarp;
    varying float vAlpha;

    void main() {
        vec3 pos = position;
        // Move stars toward camera (negative Z)
        float z = mod(pos.z - uTime * aSpeed * uWarp, 200.0) - 100.0;
        pos.z = z;

        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        float depth = clamp(-mvPos.z / 100.0, 0.0, 1.0);
        vAlpha = (1.0 - depth) * 0.9 + 0.1;

        // Stretch stars during warp
        float stretch = 1.0 + uWarp * 0.5 * (1.0 - depth);
        gl_PointSize = aSize * (250.0 / -mvPos.z) * stretch;
        gl_PointSize = clamp(gl_PointSize, 1.0, 8.0);

        gl_Position = projectionMatrix * mvPos;
    }
`;

const STAR_FRAGMENT = `
    varying float vAlpha;
    uniform vec3 uColor;
    void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.1, d) * vAlpha;
        gl_FragColor = vec4(uColor, a);
    }
`;


export class SpaceJourney {
    constructor(modal) {
        this.modal = modal;
        this.container = document.getElementById('space-journey-container');
        this.canvas = document.getElementById('space-journey-canvas');
        this.hud = document.getElementById('space-journey-hud');
        this.isActive = false;
        this.clock = new THREE.Clock();
        this.planets = [];
        this.planetData = [];
        this.currentPlanetIndex = -1;
        this.warpSpeed = 0;
        this.targetWarp = 0;
        this.cameraPath = [];
        this.journeyProgress = 0;
        this.isTransitioning = false;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredPlanet = null;
        this.nebulaClouds = [];
        this.score = 0;
        this.exploredPlanets = new Set();
        this.isPaused = false;
        this._nextPlanetTimer = null;
        this._hideInfoTimer = null;

        this._onResize = this._onResize.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._animFrame = null;
    }

    launch(domainKey) {
        const domain = DOMAINS[domainKey];
        if (!domain || this.isActive) return;

        this.isActive = true;
        this.domainData = domain;
        this.planetData = domain.planets;
        this.currentPlanetIndex = -1;
        this.journeyProgress = 0;
        this.score = 0;
        this.exploredPlanets = new Set();

        // Show container
        this.container.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Build HUD
        this._buildHUD(domain);

        // Init Three.js scene
        this._initScene();
        this._createStarfield();
        this._createNebula();
        this._createPlanets();
        this._buildCameraPath();

        // Bind events
        window.addEventListener('resize', this._onResize);
        this.canvas.addEventListener('click', this._onClick);
        this.canvas.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('keydown', this._onKeyDown);

        // Start warp-in
        this.targetWarp = 3.0;
        setTimeout(() => this._goToNextPlanet(), 2500);

        // Start render loop
        this.clock.start();
        this._animate();
    }

    destroy() {
        this.isActive = false;

        // Cancel animation
        if (this._animFrame) cancelAnimationFrame(this._animFrame);

        // Remove events
        window.removeEventListener('resize', this._onResize);
        this.canvas.removeEventListener('click', this._onClick);
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('keydown', this._onKeyDown);

        // Dispose Three.js
        if (this.renderer) {
            this.scene.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                }
            });
            this.renderer.dispose();
            this.renderer = null;
        }

        this.planets = [];
        this.container.classList.remove('active');
        document.body.style.overflow = '';
        this.hud.innerHTML = '';
        this.canvas.style.cursor = '';
    }

    /* ──────────────────────── Three.js Setup ──────────────────────── */

    _initScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000008, 0.008);

        this.camera = new THREE.PerspectiveCamera(
            70, window.innerWidth / window.innerHeight, 0.1, 500
        );
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000008);

        // Ambient + directional light
        this.scene.add(new THREE.AmbientLight(0x111122, 0.5));
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(5, 3, 7);
        this.scene.add(dir);
    }

    /* ──────────────────────── Starfield ──────────────────────── */

    _createStarfield() {
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 2] = Math.random() * 200 - 100;
            sizes[i] = Math.random() * 2.5 + 0.5;
            speeds[i] = Math.random() * 15 + 8;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uWarp: { value: 0 },
                uColor: { value: new THREE.Color('#ffffff') }
            },
            vertexShader: STAR_VERTEX,
            fragmentShader: STAR_FRAGMENT,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.starfield = new THREE.Points(geo, mat);
        this.scene.add(this.starfield);
    }

    /* ──────────────────────── Nebula / Milky Way ──────────────────────── */

    _createNebula() {
        this.nebulaClouds = [];
        const colors = [0x1a0044, 0x001a44, 0x110022, 0x002233, 0x0a0028, 0x002211, 0x180033, 0x001133];
        // Spread nebula clouds along entire travel path
        const totalDepth = this.planetData.length * 40 + 80;
        for (let i = 0; i < 20; i++) {
            const geo = new THREE.PlaneGeometry(80 + Math.random() * 60, 40 + Math.random() * 50);
            const mat = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                transparent: true,
                opacity: 0.06 + Math.random() * 0.07,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 60,
                50 - (i / 20) * totalDepth
            );
            mesh.rotation.z = Math.random() * Math.PI;
            mesh.rotation.x = (Math.random() - 0.5) * 0.5;
            mesh.userData.baseY = mesh.position.y;
            this.nebulaClouds.push(mesh);
            this.scene.add(mesh);
        }
    }

    /* ──────────────────────── Planets ──────────────────────── */

    _createPlanets() {
        const spacing = 40;
        this.planets = [];

        this.planetData.forEach((data, i) => {
            const group = new THREE.Group();
            const z = -i * spacing - 30;
            const x = (i % 2 === 0 ? -1 : 1) * (6 + Math.random() * 4);
            const y = (Math.random() - 0.5) * 6;
            group.position.set(x, y, z);

            // Planet sphere
            const radius = data.size;
            const geo = new THREE.IcosahedronGeometry(radius, 6);
            const mat = new THREE.ShaderMaterial({
                uniforms: {
                    uColor: { value: new THREE.Color(data.color) },
                    uTime: { value: 0 }
                },
                vertexShader: PLANET_VERTEX,
                fragmentShader: PLANET_FRAGMENT
            });
            const sphere = new THREE.Mesh(geo, mat);
            sphere.userData = { planetIndex: i, projectId: data.id };
            group.add(sphere);

            // Atmosphere glow
            const atmosGeo = new THREE.IcosahedronGeometry(radius * 1.35, 4);
            const atmosMat = new THREE.ShaderMaterial({
                uniforms: {
                    uColor: { value: new THREE.Color(data.color) }
                },
                vertexShader: ATMOSPHERE_VERTEX,
                fragmentShader: ATMOSPHERE_FRAGMENT,
                transparent: true,
                side: THREE.BackSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            group.add(new THREE.Mesh(atmosGeo, atmosMat));

            // Orbital rings
            if (data.rings) {
                const ringGeo = new THREE.TorusGeometry(radius * 2.4, 0.06, 12, 96);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: data.color,
                    transparent: true,
                    opacity: 0.35,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = Math.PI * 0.35;
                ring.rotation.y = Math.random() * 0.5;
                group.add(ring);
            }

            // Point light from planet
            const light = new THREE.PointLight(data.color, 0.5, 20);
            group.add(light);

            // Hide planet until camera approaches
            group.visible = false;
            this.planets.push({ group, sphere, data, index: i, revealed: false, baseY: y });
            this.scene.add(group);
        });
    }

    /* ──────────────────────── Camera path ──────────────────────── */

    _buildCameraPath() {
        this.cameraPath = [];
        // Starting position
        this.cameraPath.push({
            pos: new THREE.Vector3(0, 0, 50),
            lookAt: new THREE.Vector3(0, 0, 0),
            duration: 2.0
        });

        // Waypoint for each planet
        this.planets.forEach(p => {
            const pp = p.group.position;
            this.cameraPath.push({
                pos: new THREE.Vector3(pp.x * 0.3, pp.y * 0.3, pp.z + 12),
                lookAt: new THREE.Vector3(pp.x, pp.y, pp.z),
                duration: 4.0
            });
        });
    }

    _goToNextPlanet() {
        if (!this.isActive) return;

        this.currentPlanetIndex++;
        if (this.currentPlanetIndex >= this.planets.length) {
            // Journey complete — show finale and auto-close
            this._showFinale();
            return;
        }

        const waypoint = this.cameraPath[this.currentPlanetIndex + 1]; // +1 because idx 0 is start
        this.isTransitioning = true;

        // Warp speed while traveling
        this.targetWarp = 2.5;

        const startPos = this.camera.position.clone();
        const startLook = this._getCurrentLookAt();
        const duration = waypoint.duration * 1000;
        const startTime = performance.now();

        const animateTransition = (now) => {
            if (!this.isActive) return;
            const t = Math.min((now - startTime) / duration, 1);
            const ease = this._easeInOutCubic(t);

            // Interpolate camera position
            this.camera.position.lerpVectors(startPos, waypoint.pos, ease);

            // Interpolate look-at
            const currentLook = new THREE.Vector3().lerpVectors(startLook, waypoint.lookAt, ease);
            this.camera.lookAt(currentLook);

            // Slow warp near planet
            if (t > 0.5) {
                this.targetWarp = 0.15;
            }

            if (t < 1) {
                requestAnimationFrame(animateTransition);
            } else {
                this.isTransitioning = false;
                this.targetWarp = 0.08;
                this._showPlanetInfo(this.currentPlanetIndex);

                // Proceed to next after longer pause (7s)
                this._hideInfoTimer = setTimeout(() => {
                    if (this.isPaused) return; // will resume later
                    this._hidePlanetInfo();
                    this._nextPlanetTimer = setTimeout(() => this._goToNextPlanet(), 800);
                }, 7000);
            }
        };

        requestAnimationFrame(animateTransition);
    }

    _getCurrentLookAt() {
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        return this.camera.position.clone().add(dir.multiplyScalar(10));
    }

    _easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /* ──────────────────────── HUD ──────────────────────── */

    _buildHUD(domain) {
        this.hud.innerHTML = `
            <div class="sj-hud__top">
                <div class="sj-hud__domain">${domain.title}</div>
                <div class="sj-hud__score" id="sj-score">&#11088; 0 pts</div>
                <button class="sj-hud__exit" id="sj-exit">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    EXIT VOYAGE
                </button>
            </div>
            <div class="sj-hud__progress" id="sj-progress">
                ${domain.planets.map((_, i) => `<div class="sj-hud__dot" data-idx="${i}"></div>`).join('')}
            </div>
            <div class="sj-hud__planet-info" id="sj-planet-info"></div>
            <div class="sj-hud__hint">Click planets to explore and earn points</div>
        `;

        document.getElementById('sj-exit').addEventListener('click', () => this.destroy());
    }

    _updateScoreHUD() {
        const el = document.getElementById('sj-score');
        if (el) {
            el.textContent = `\u2B50 ${this.score} pts`;
            el.classList.add('sj-hud__score--flash');
            setTimeout(() => el.classList.remove('sj-hud__score--flash'), 600);
        }
    }

    _showPlanetInfo(index) {
        const data = this.planetData[index];
        const infoEl = document.getElementById('sj-planet-info');
        if (!infoEl) return;

        infoEl.innerHTML = `
            <div class="sj-planet-card" style="--planet-color: ${data.color}">
                <div class="sj-planet-card__number">${String(index + 1).padStart(2, '0')}</div>
                <h3 class="sj-planet-card__title">${data.title}</h3>
                <p class="sj-planet-card__sub">${data.sub}</p>
                ${data.id ? '<span class="sj-planet-card__cta">Click planet to explore →</span>' : ''}
            </div>
        `;
        infoEl.classList.add('visible');

        // Update progress dots
        const dots = document.querySelectorAll('.sj-hud__dot');
        dots.forEach((d, i) => {
            d.classList.toggle('active', i <= index);
            d.classList.toggle('current', i === index);
        });
    }

    _hidePlanetInfo() {
        const infoEl = document.getElementById('sj-planet-info');
        if (infoEl) infoEl.classList.remove('visible');
    }

    _showFinale() {
        const infoEl = document.getElementById('sj-planet-info');
        if (!infoEl) return;

        const maxScore = this.planetData.length * 100;
        const pct = Math.round((this.score / maxScore) * 100);

        infoEl.innerHTML = `
            <div class="sj-planet-card sj-planet-card--finale" style="--planet-color: ${this.domainData.color}">
                <div class="sj-planet-card__number">\u2726</div>
                <h3 class="sj-planet-card__title">Voyage Complete</h3>
                <p class="sj-planet-card__sub">You explored ${this.exploredPlanets.size}/${this.planetData.length} planets</p>
                <div class="sj-finale__score">\u2B50 ${this.score} points (${pct}%)</div>
                <button class="sj-finale__btn" id="sj-return">Return to Portfolio</button>
            </div>
        `;
        infoEl.classList.add('visible');

        document.getElementById('sj-return').addEventListener('click', () => this.destroy());

        this.targetWarp = 0.5;
    }

    /* ──────────────────────── Interaction ──────────────────────── */

    _onClick(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const spheres = this.planets.filter(p => p.group.visible).map(p => p.sphere);
        const intersects = this.raycaster.intersectObjects(spheres);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const idx = hit.userData.planetIndex;
            const projectId = hit.userData.projectId;

            // Award score if not already explored
            if (!this.exploredPlanets.has(idx)) {
                this.exploredPlanets.add(idx);
                this.score += projectId ? 100 : 50;
                this._updateScoreHUD();
            }

            if (projectId && this.modal) {
                // Pause the voyage while exploring
                this._pauseJourney();
                const overlay = document.getElementById('modal-overlay');
                if (overlay) overlay.style.zIndex = '800';
                this.modal.openProject(projectId);

                // Resume when modal closes
                const checkClosed = setInterval(() => {
                    if (!this.modal.isOpen) {
                        clearInterval(checkClosed);
                        this._resumeJourney();
                    }
                }, 300);
            }
        }
    }

    _onMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const spheres = this.planets.filter(p => p.group.visible).map(p => p.sphere);
        const intersects = this.raycaster.intersectObjects(spheres);

        if (intersects.length > 0 && intersects[0].object.userData.projectId) {
            this.canvas.style.cursor = 'pointer';
            this.hoveredPlanet = intersects[0].object;
        } else {
            this.canvas.style.cursor = '';
            this.hoveredPlanet = null;
        }
    }

    _onKeyDown(e) {
        if (e.key === 'Escape') {
            // If modal is open, let modal handle ESC first
            if (this.modal && this.modal.isOpen) return;
            this.destroy();
        }
    }

    _pauseJourney() {
        this.isPaused = true;
        if (this._hideInfoTimer) { clearTimeout(this._hideInfoTimer); this._hideInfoTimer = null; }
        if (this._nextPlanetTimer) { clearTimeout(this._nextPlanetTimer); this._nextPlanetTimer = null; }
    }

    _resumeJourney() {
        this.isPaused = false;
        // Continue to next planet after a brief pause
        this._hideInfoTimer = setTimeout(() => {
            this._hidePlanetInfo();
            this._nextPlanetTimer = setTimeout(() => this._goToNextPlanet(), 800);
        }, 2000);
    }

    _onResize() {
        if (!this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /* ──────────────────────── Render Loop ──────────────────────── */

    _animate() {
        if (!this.isActive) return;
        this._animFrame = requestAnimationFrame(() => this._animate());

        const elapsed = this.clock.getElapsedTime();
        const camZ = this.camera.position.z;

        // Smooth warp speed
        this.warpSpeed += (this.targetWarp - this.warpSpeed) * 0.03;

        // Update starfield — follow camera so stars always surround viewer
        if (this.starfield) {
            this.starfield.material.uniforms.uTime.value = elapsed;
            this.starfield.material.uniforms.uWarp.value = this.warpSpeed;
            this.starfield.position.z = camZ - 50;
        }

        // Animate nebula clouds — gentle drift
        this.nebulaClouds.forEach((cloud, i) => {
            cloud.position.y = cloud.userData.baseY + Math.sin(elapsed * 0.15 + i) * 3;
            cloud.rotation.z += 0.0003;
        });

        // Progressive planet reveal — only show when camera is within 35 units
        this.planets.forEach(p => {
            const dist = camZ - p.group.position.z;
            if (!p.revealed && dist < 35 && dist > -5) {
                p.group.visible = true;
                p.revealed = true;
                p.group.scale.setScalar(0.01);
            }
            // Scale-in animation for newly revealed planets
            if (p.revealed && p.group.scale.x < 1) {
                const s = Math.min(p.group.scale.x + 0.02, 1);
                p.group.scale.setScalar(s);
            }
        });

        // Rotate visible planets
        this.planets.forEach(p => {
            if (!p.group.visible) return;
            p.sphere.rotation.y += 0.003;
            p.sphere.rotation.x += 0.001;
            if (p.sphere.material.uniforms) {
                p.sphere.material.uniforms.uTime.value = elapsed;
            }
            p.group.position.y = p.baseY + Math.sin(elapsed * 0.5 + p.index) * 0.5;
        });

        // Hovered planet glow
        this.planets.forEach(p => {
            if (!p.group.visible) return;
            const scale = p.sphere === this.hoveredPlanet ? 1.15 : 1.0;
            p.sphere.scale.setScalar(scale + Math.sin(elapsed * 2) * 0.02);
        });

        this.renderer.render(this.scene, this.camera);
    }
}
