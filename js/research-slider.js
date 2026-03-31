// ====================================
// Research Comparison Slider
// Draggable split-screen comparison
// ====================================

import { clamp } from './utils.js';

export class ResearchSlider {
    constructor() {
        this.slider = document.getElementById('comparison-slider');
        if (!this.slider) return;

        this.handle = document.getElementById('slider-handle');
        this.divider = document.getElementById('slider-divider');
        this.leftPanel = document.getElementById('slider-left');
        this.rightPanel = document.getElementById('slider-right');

        this.isDragging = false;
        this.position = 50; // percentage

        this.bindEvents();
    }

    bindEvents() {
        // Mouse events
        this.handle.addEventListener('mousedown', (e) => this.startDrag(e));
        this.slider.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());

        // Touch events
        this.handle.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
        this.slider.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: true });
        document.addEventListener('touchend', () => this.endDrag());
    }

    startDrag(e) {
        this.isDragging = true;
        this.slider.style.cursor = 'col-resize';
        this.updatePosition(e);
    }

    onDrag(e) {
        if (!this.isDragging) return;
        this.updatePosition(e);
    }

    endDrag() {
        this.isDragging = false;
        this.slider.style.cursor = 'col-resize';
    }

    updatePosition(e) {
        const rect = this.slider.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        this.position = clamp((x / rect.width) * 100, 10, 90);

        this.divider.style.left = `${this.position}%`;
        this.handle.style.left = `${this.position}%`;
        this.leftPanel.style.right = `${100 - this.position}%`;
        this.rightPanel.style.left = `${this.position}%`;
    }
}
