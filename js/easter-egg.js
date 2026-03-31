// ====================================
// Purple Banana Easter Egg
// Click hidden banana to toggle accent colors
// ====================================

export class EasterEgg {
    constructor(particleSystem) {
        this.banana = document.getElementById('easter-egg-banana');
        this.toast = document.getElementById('toast');
        this.particleSystem = particleSystem;
        this.isActive = false;
        this.timeout = null;

        if (!this.banana) return;
        this.init();
    }

    init() {
        this.banana.addEventListener('click', () => this.toggle());
    }

    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    activate() {
        this.isActive = true;

        // Toggle CSS class on root
        document.documentElement.classList.add('purple-mode');

        // Update Three.js particle color
        if (this.particleSystem) {
            this.particleSystem.setAccentColor('#a855f7');
        }

        // Show toast
        this.showToast();

        // Auto-revert after 15 seconds
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.deactivate(), 15000);
    }

    deactivate() {
        this.isActive = false;
        document.documentElement.classList.remove('purple-mode');

        if (this.particleSystem) {
            this.particleSystem.setAccentColor('#f5d547');
        }

        this.hideToast();
        clearTimeout(this.timeout);
    }

    showToast() {
        this.toast.classList.add('visible');
        setTimeout(() => this.hideToast(), 4000);
    }

    hideToast() {
        this.toast.classList.remove('visible');
    }
}
