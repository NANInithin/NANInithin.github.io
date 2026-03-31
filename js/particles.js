// ====================================
// Three.js Anti-Gravity Particle System
// GPU-optimized with shader-based physics
// ====================================

import * as THREE from 'three';

export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);
        this.clock = new THREE.Clock();
        this.isDestroyed = false;

        this.init();
        this.createParticles();
        this.createConnections();
        this.bindEvents();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.z = 50;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance'
        });

        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
    }

    createParticles() {
        const count = 600;
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const phases = new Float32Array(count);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

            scales[i] = Math.random() * 2 + 0.5;
            phases[i] = Math.random() * Math.PI * 2;
            speeds[i] = Math.random() * 0.5 + 0.2;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

        // Custom shader material — all physics on GPU
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uAccentColor: { value: new THREE.Color('#f5d547') },
                uSecondaryColor: { value: new THREE.Color('#22d3ee') }
            },
            vertexShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                uniform vec2 uResolution;

                attribute float aScale;
                attribute float aPhase;
                attribute float aSpeed;

                varying float vAlpha;
                varying float vColorMix;

                void main() {
                    vec3 pos = position;

                    // Anti-gravity drift
                    float t = uTime * aSpeed;
                    pos.y += sin(t * 0.7 + aPhase) * 1.5;
                    pos.x += cos(t * 0.5 + aPhase * 1.3) * 1.0;
                    pos.z += sin(t * 0.3 + aPhase * 0.7) * 0.8;

                    // Secondary wobble for organic feel
                    pos.x += sin(t * 1.2 + aPhase * 2.0) * 0.3;
                    pos.y += cos(t * 0.9 + aPhase * 1.5) * 0.4;

                    // Mouse repulsion (world space)
                    vec2 mouseWorld = uMouse * vec2(50.0, 30.0);
                    vec2 toMouse = pos.xy - mouseWorld;
                    float dist = length(toMouse);
                    float repulsion = 8.0 / (dist * dist + 2.0);
                    pos.xy += normalize(toMouse + vec2(0.001)) * repulsion;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

                    // Size attenuation
                    gl_PointSize = aScale * (200.0 / -mvPosition.z);
                    gl_PointSize = max(gl_PointSize, 1.0);

                    gl_Position = projectionMatrix * mvPosition;

                    // Varyings
                    float depth = clamp(-mvPosition.z / 60.0, 0.0, 1.0);
                    vAlpha = (1.0 - depth) * 0.6 + 0.1;
                    vColorMix = sin(aPhase * 3.0 + uTime * 0.2) * 0.5 + 0.5;
                }
            `,
            fragmentShader: `
                uniform vec3 uAccentColor;
                uniform vec3 uSecondaryColor;

                varying float vAlpha;
                varying float vColorMix;

                void main() {
                    // Circular point
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    if (dist > 0.5) discard;

                    // Soft edge
                    float alpha = smoothstep(0.5, 0.15, dist) * vAlpha;

                    // Color mix between accent and secondary
                    vec3 color = mix(uAccentColor, uSecondaryColor, vColorMix);

                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        this.particleCount = count;
    }

    createConnections() {
        // Neural network connections between nearby particles
        const lineCount = 200;
        const linePositions = new Float32Array(lineCount * 6);
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1a2a4a,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.connections = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.connections);
        this.lineCount = lineCount;
    }

    updateConnections() {
        const positions = this.particles.geometry.attributes.position.array;
        const linePositions = this.connections.geometry.attributes.position.array;
        const time = this.clock.getElapsedTime();
        let lineIdx = 0;
        const maxConnections = this.lineCount;
        const threshold = 12;

        // Sample a subset of particles for connections
        for (let i = 0; i < this.particleCount && lineIdx < maxConnections; i += 4) {
            const aPhase = this.particles.geometry.attributes.aPhase.array[i];
            const aSpeed = this.particles.geometry.attributes.aSpeed.array[i];
            const t = time * aSpeed;

            let x1 = positions[i * 3] + Math.sin(t * 0.7 + aPhase) * 0 + Math.cos(t * 0.5 + aPhase * 1.3) * 1.0;
            let y1 = positions[i * 3 + 1] + Math.sin(t * 0.7 + aPhase) * 1.5;
            let z1 = positions[i * 3 + 2];

            for (let j = i + 4; j < this.particleCount && lineIdx < maxConnections; j += 4) {
                const bPhase = this.particles.geometry.attributes.aPhase.array[j];
                const bSpeed = this.particles.geometry.attributes.aSpeed.array[j];
                const t2 = time * bSpeed;

                let x2 = positions[j * 3] + Math.cos(t2 * 0.5 + bPhase * 1.3) * 1.0;
                let y2 = positions[j * 3 + 1] + Math.sin(t2 * 0.7 + bPhase) * 1.5;
                let z2 = positions[j * 3 + 2];

                const dx = x2 - x1;
                const dy = y2 - y1;
                const dz = z2 - z1;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < threshold) {
                    const idx = lineIdx * 6;
                    linePositions[idx] = x1;
                    linePositions[idx + 1] = y1;
                    linePositions[idx + 2] = z1;
                    linePositions[idx + 3] = x2;
                    linePositions[idx + 4] = y2;
                    linePositions[idx + 5] = z2;
                    lineIdx++;
                }
            }
        }

        // Clear remaining lines
        for (let i = lineIdx * 6; i < this.lineCount * 6; i++) {
            linePositions[i] = 0;
        }

        this.connections.geometry.attributes.position.needsUpdate = true;
    }

    bindEvents() {
        // Mouse tracking — normalize to -1..1 range
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Resize handling (debounced)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (this.isDestroyed) return;
                const aspect = window.innerWidth / window.innerHeight;
                this.camera.aspect = aspect;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.particles.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
            }, 100);
        });
    }

    setAccentColor(hex) {
        this.particles.material.uniforms.uAccentColor.value.set(hex);
    }

    animate() {
        if (this.isDestroyed) return;

        requestAnimationFrame(() => this.animate());

        const elapsed = this.clock.getElapsedTime();

        // Smooth mouse following
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        // Update uniforms
        this.particles.material.uniforms.uTime.value = elapsed;
        this.particles.material.uniforms.uMouse.value.copy(this.mouse);

        // Update connections periodically (every 3 frames for perf)
        if (Math.floor(elapsed * 60) % 3 === 0) {
            this.updateConnections();
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.isDestroyed = true;
        this.renderer.dispose();
        this.particles.geometry.dispose();
        this.particles.material.dispose();
        this.connections.geometry.dispose();
        this.connections.material.dispose();
    }
}
