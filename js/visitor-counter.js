// ====================================
// Visitor Counter (hits.sh)
// ====================================
//
// Strategy:
//  - The hidden <img> in the footer is the ONLY thing that registers a hit.
//  - We control whether that <img> loads by toggling its `src`.
//  - On first visit (no localStorage key), we let the <img> load (registers 1 hit).
//  - On repeat visits, we block the <img> from loading (0 new hits).
//  - To display the count, we fetch the SVG via a CORS proxy and parse the number.
//  - We cache the displayed count in localStorage so repeat visits still show a number
//    even if the fetch fails, and we only re-fetch every 6 hours to stay lightweight.

const STORAGE_KEY = 'portfolio_visitor_tracked';
const COUNT_CACHE_KEY = 'portfolio_visitor_count';
const COUNT_CACHE_TS_KEY = 'portfolio_visitor_count_ts';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

export class VisitorCounter {
    constructor() {
        this.counterEl = document.getElementById('visitor-count-number');
        this.pixelImg = document.getElementById('hits-pixel');
        if (!this.counterEl) return;

        this.handleHitRegistration();
        this.displayCount();
    }

    /**
     * Controls whether the hidden <img> registers a hit.
     * Only first-time visitors (no localStorage flag) trigger the image load.
     */
    handleHitRegistration() {
        const alreadyTracked = localStorage.getItem(STORAGE_KEY);

        if (this.pixelImg) {
            if (alreadyTracked) {
                // Returning visitor — don't promote data-src to src
                // The image never loads, so no hit is registered
                this.pixelImg.style.display = 'none';
            } else {
                // First-time visitor — promote data-src to src to register exactly 1 hit
                const realSrc = this.pixelImg.getAttribute('data-src');
                if (realSrc) {
                    this.pixelImg.setAttribute('src', realSrc);
                }
                localStorage.setItem(STORAGE_KEY, Date.now().toString());
            }
        }
    }

    /**
     * Fetches and displays the current total count.
     * Uses a cached value if available and fresh enough.
     */
    async displayCount() {
        // Check cache first
        const cachedCount = localStorage.getItem(COUNT_CACHE_KEY);
        const cachedTs = localStorage.getItem(COUNT_CACHE_TS_KEY);
        const now = Date.now();

        if (cachedCount && cachedTs && (now - parseInt(cachedTs, 10)) < CACHE_DURATION_MS) {
            this.animateCount(parseInt(cachedCount, 10));
            return;
        }

        // Fetch fresh count — use a slightly different URL parameter to avoid
        // registering an additional hit. hits.sh counts by URL path, so adding
        // a query param like `&extra=nocountjs` should not match the main counter
        // if the badge URL in the <img> is different. However, hits.sh typically
        // tracks by the full URL including query strings, so we need to use the
        // exact same URL to READ the count. We'll use CORS proxies only, which
        // fetch server-side and don't register as a browser hit from our domain.
        const badgeUrl = 'https://hits.sh/naninithin.github.io.svg?view=today-total&style=flat-square';

        const proxyUrls = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(badgeUrl)}`,
            `https://corsproxy.io/?url=${encodeURIComponent(badgeUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(badgeUrl)}`
        ];

        for (const url of proxyUrls) {
            const count = await this.tryFetch(url);
            if (count !== null) {
                // Cache the result
                localStorage.setItem(COUNT_CACHE_KEY, count.toString());
                localStorage.setItem(COUNT_CACHE_TS_KEY, now.toString());
                this.animateCount(count);
                return;
            }
        }

        // All fetches failed — show cached count if available, otherwise hide
        if (cachedCount) {
            this.animateCount(parseInt(cachedCount, 10));
        } else {
            console.warn('Visitor counter: all fetch methods failed, no cache available');
        }
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
