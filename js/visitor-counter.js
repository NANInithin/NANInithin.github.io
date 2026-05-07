// ====================================
// Visitor Counter (hits.sh)
// ====================================

export class VisitorCounter {
    constructor() {
        this.counterEl = document.getElementById('visitor-count-number');
        if (this.counterEl) {
            this.fetchCount();
        }
    }

    async fetchCount() {
        const badgeUrl = 'https://hits.sh/naninithin.github.io.svg?view=today-total&style=flat-square';

        // The <img> tag in the footer still loads the badge (registering the hit).
        // We just need to read the count. Try multiple methods:

        const proxyUrls = [
            // Direct (in case hits.sh adds CORS support)
            badgeUrl,
            // CORS proxies
            `https://api.allorigins.win/raw?url=${encodeURIComponent(badgeUrl)}`,
            `https://corsproxy.io/?url=${encodeURIComponent(badgeUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(badgeUrl)}`
        ];

        for (const url of proxyUrls) {
            const count = await this.tryFetch(url);
            if (count !== null) {
                this.animateCount(count);
                return;
            }
        }

        console.warn('Visitor counter: all fetch methods failed');
    }

    async tryFetch(url) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(url, {
                mode: 'cors',
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!res.ok) return null;
            const svgText = await res.text();
            return this.parseCount(svgText);
        } catch (err) {
            return null;
        }
    }

    parseCount(svgText) {
        // Try "today / total" pattern in text nodes: >4 / 97<
        const slashMatch = svgText.match(/>\s*(\d+)\s*\/\s*(\d+)\s*</);
        if (slashMatch && slashMatch[2]) {
            return parseInt(slashMatch[2], 10);
        }

        // Try aria-label="hits: 4 / 97"
        const ariaMatch = svgText.match(/aria-label="[^"]*?(\d+)\s*\/\s*(\d+)/);
        if (ariaMatch && ariaMatch[2]) {
            return parseInt(ariaMatch[2], 10);
        }

        // Try title element: <title>hits: 4 / 97</title>
        const titleMatch = svgText.match(/<title>[^<]*?(\d+)\s*\/\s*(\d+)[^<]*<\/title>/);
        if (titleMatch && titleMatch[2]) {
            return parseInt(titleMatch[2], 10);
        }

        // Fallback: grab the last number in the SVG
        const numMatches = svgText.match(/>(\d+)</g);
        if (numMatches && numMatches.length > 0) {
            const lastNum = numMatches[numMatches.length - 1].replace(/[><]/g, '');
            return parseInt(lastNum, 10);
        }

        return null;
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
