// ====================================
// Visitor Counter (hits.sh)
// ====================================

export class VisitorCounter {
    constructor() {
        this.counterEl = document.getElementById('visitor-count-number');
        this.pixelImg = document.getElementById('hits-pixel');
        if (this.counterEl && this.pixelImg) {
            this.fetchCount();
        }
    }

    async fetchCount() {
        try {
            // Fetch the SVG badge which contains the count and also registers the hit
            const res = await fetch(
                'https://hits.sh/naninithin.github.io.svg?view=today-total&style=flat-square',
                { mode: 'cors' }
            );
            const svgText = await res.text();

            // Parse total count from SVG text nodes — hits.sh puts
            // "today / total" in the SVG, we want the total (second number)
            const matches = svgText.match(/>\s*(\d+)\s*\/\s*(\d+)\s*</);
            if (matches && matches[2]) {
                this.animateCount(parseInt(matches[2], 10));
            } else {
                // Fallback: try to find any number in the SVG
                const numMatch = svgText.match(/>(\d+)</g);
                if (numMatch && numMatch.length > 0) {
                    const lastNum = numMatch[numMatch.length - 1].replace(/[><]/g, '');
                    this.animateCount(parseInt(lastNum, 10));
                }
            }
        } catch (err) {
            console.warn('Visitor counter unavailable:', err);
            // Keep the dash as fallback
        }
    }

    animateCount(target) {
        if (!this.counterEl || target <= 0) return;

        const duration = 1200; // ms
        const steps = 30;
        const stepTime = duration / steps;
        let current = 0;

        const increment = () => {
            current += Math.ceil(target / steps);
            if (current >= target) {
                this.counterEl.textContent = target.toLocaleString();
                return;
            }
            this.counterEl.textContent = current.toLocaleString();
            setTimeout(increment, stepTime);
        };

        increment();
    }
}
