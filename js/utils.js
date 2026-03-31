// ====================================
// Utility Functions
// ====================================

/**
 * Throttle function execution
 */
export function throttle(fn, delay) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last >= delay) {
            last = now;
            fn.apply(this, args);
        }
    };
}

/**
 * Debounce function execution
 */
export function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Linear interpolation
 */
export function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Map value from one range to another
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Simple simplex-like noise for animation variety
 */
export function pseudoNoise(x, y, t) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + t * 43.8954) * 43758.5453;
    return n - Math.floor(n);
}
