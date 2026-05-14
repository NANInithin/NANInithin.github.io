// ====================================
// Easter Egg — Domain Selection → Space Journey
// Click hidden banana to launch an immersive voyage
// ====================================

import { SpaceJourney } from './space-journey.js';

export class EasterEgg {
    constructor(particleSystem, modal) {
        this.banana = document.getElementById('easter-egg-banana');
        this.choiceOverlay = document.getElementById('banana-choice-overlay');
        this.particleSystem = particleSystem;
        this.modal = modal;
        this.journey = null;

        if (!this.banana || !this.choiceOverlay) return;
        this.init();
    }

    init() {
        this.banana.addEventListener('click', () => this._showChoice());

        // Choice card click handlers
        this.choiceOverlay.querySelectorAll('.banana-choice__card').forEach(card => {
            card.addEventListener('click', () => {
                const domain = card.dataset.domain;
                this._launchJourney(domain);
            });
        });

        // Close overlay on backdrop click
        this.choiceOverlay.addEventListener('click', (e) => {
            if (e.target === this.choiceOverlay) this._hideChoice();
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.choiceOverlay.classList.contains('active')) {
                this._hideChoice();
            }
        });
    }

    _showChoice() {
        this.choiceOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    _hideChoice() {
        this.choiceOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    _launchJourney(domainKey) {
        this._hideChoice();

        // Destroy any previous journey
        if (this.journey) {
            this.journey.destroy();
        }

        this.journey = new SpaceJourney(this.modal);
        this.journey.launch(domainKey);
    }
}
