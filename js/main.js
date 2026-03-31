// ====================================
// Main Application Entry Point
// ====================================

import { ParticleSystem } from './particles.js';
import { Navigation } from './navigation.js';
import { Terminal } from './terminal.js';
import { EasterEgg } from './easter-egg.js';
import { Modal } from './modal.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        const canvas = document.getElementById('particles-canvas');
        let particleSystem = null;

        try {
            particleSystem = new ParticleSystem(canvas);
            console.log('✦ Particle system initialized');
        } catch (err) {
            console.warn('WebGL not available:', err);
            canvas.style.display = 'none';
        }

        new Navigation();
        new Terminal();
        new Modal();
        new EasterEgg(particleSystem);

        this.initSmoothLinks();

        console.log(
            '%c🧠 The AI World %c— Built by Nithin Sai Kumar Kopparapu',
            'color: #f5d547; font-size: 16px; font-weight: bold;',
            'color: #8a8a9a; font-size: 12px;'
        );
        console.log(
            '%cHint: There\'s a hidden 🍌 somewhere on this page...',
            'color: #a855f7; font-size: 11px; font-style: italic;'
        );
    }

    initSmoothLinks() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new App());
