// ====================================
// Terminal Typing Animation
// Character-by-character with syntax highlighting
// ====================================

export class Terminal {
    constructor() {
        this.output = document.getElementById('terminal-output');
        if (!this.output) return;

        this.hasTyped = false;
        this.typingSpeed = 12; // ms per character
        this.lineDelay = 100;

        this.initObserver();
    }

    initObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !this.hasTyped) {
                    this.hasTyped = true;
                    this.startTyping();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(this.output);
    }

    async startTyping() {
        // Clear the cursor placeholder
        this.output.innerHTML = '';

        const lines = [
            { text: '$ cat skills.yaml', cls: 'prompt-line' },
            { text: '', cls: 'blank' },
            { text: '# --- Nithin\'s Tech Stack ---', cls: 'comment' },
            { text: '', cls: 'blank' },
            { text: 'deep_learning:', cls: 'key' },
            { text: '  frameworks: [PyTorch, TensorFlow, Keras]', cls: 'nested' },
            { text: '  architectures: [CNNs, GANs, Transformers, VLMs]', cls: 'nested' },
            { text: '  techniques: [Transfer Learning, QLoRA, PEFT]', cls: 'nested' },
            { text: '', cls: 'blank' },
            { text: 'computer_vision:', cls: 'key' },
            { text: '  tools: [OpenCV, YOLO (v4/v8/v11), 3D Processing]', cls: 'nested' },
            { text: '  tasks: [Object Detection, Segmentation, Tracking]', cls: 'nested' },
            { text: '  models: [SmolVLM, CLIP, SAM]', cls: 'nested' },
            { text: '', cls: 'blank' },
            { text: 'mlops_devops:', cls: 'key' },
            { text: '  containers: [Docker, Kubernetes, RHOCP]', cls: 'nested' },
            { text: '  platforms: [Linux, HELM, Prometheus]', cls: 'nested' },
            { text: '', cls: 'blank' },
            { text: 'hardware:', cls: 'key' },
            { text: '  edge: [Jetson Nano, Jetson Xavier]', cls: 'nested' },
            { text: '', cls: 'blank' },
            { text: 'programming:', cls: 'key' },
            { text: '  languages: [Python, C, MATLAB]', cls: 'nested' },
            { text: '  data: [NumPy, Pandas, Scikit-learn]', cls: 'nested' },
        ];

        for (const line of lines) {
            await this.typeLine(line);
        }

        // Final cursor
        const cursor = document.createElement('span');
        cursor.className = 'terminal__cursor';
        this.output.appendChild(cursor);
    }

    typeLine(lineData) {
        return new Promise((resolve) => {
            const { text, cls } = lineData;

            if (cls === 'blank') {
                this.output.appendChild(document.createElement('br'));
                setTimeout(resolve, 30);
                return;
            }

            const lineEl = document.createElement('div');
            this.output.appendChild(lineEl);

            if (cls === 'prompt-line') {
                // Type the whole prompt line
                this.typeText(lineEl, text, 'terminal__command', resolve);
                return;
            }

            // Build colored content
            const coloredHTML = this.colorize(text, cls);

            let charIdx = 0;
            const stripped = text;

            const typeChar = () => {
                if (charIdx < stripped.length) {
                    charIdx++;
                    // Render partial colorized text
                    lineEl.innerHTML = this.colorize(stripped.substring(0, charIdx), cls);
                    setTimeout(typeChar, this.typingSpeed);
                } else {
                    lineEl.innerHTML = coloredHTML;
                    setTimeout(resolve, this.lineDelay);
                }
            };

            typeChar();
        });
    }

    typeText(el, text, className, callback) {
        let i = 0;
        const span = document.createElement('span');
        span.className = className;
        el.appendChild(span);

        const interval = setInterval(() => {
            if (i < text.length) {
                span.textContent += text[i];
                i++;
            } else {
                clearInterval(interval);
                setTimeout(callback, this.lineDelay * 2);
            }
        }, this.typingSpeed);
    }

    colorize(text, cls) {
        if (cls === 'comment') {
            return `<span class="terminal__comment">${this.escapeHtml(text)}</span>`;
        }

        if (cls === 'key') {
            const parts = text.match(/^(\s*)([\w_]+)(:.*)?$/);
            if (parts) {
                const indent = parts[1] || '';
                const key = parts[2] || '';
                const rest = parts[3] || '';
                return `${indent}<span class="terminal__key">${key}</span>${this.escapeHtml(rest)}`;
            }
        }

        if (cls === 'nested') {
            return text.replace(/^(\s+)([\w_]+):\s*\[([^\]]*)\]/, (_, indent, key, values) => {
                const coloredValues = values.split(',').map(v =>
                    `<span class="terminal__value">${v.trim()}</span>`
                ).join(', ');
                return `${indent}<span class="terminal__key">${key}</span>: <span class="terminal__bracket">[</span>${coloredValues}<span class="terminal__bracket">]</span>`;
            }).replace(/^(\s+)([\w_]+):\s*([^\[].*)$/, (_, indent, key, value) => {
                return `${indent}<span class="terminal__key">${key}</span>: <span class="terminal__value">${value.trim()}</span>`;
            });
        }

        if (cls === 'nested-comment') {
            return text.replace(/^(\s+- )(\w+)(\s+)(#.*)$/, (_, prefix, lang, space, comment) => {
                return `${prefix}<span class="terminal__value">${lang}</span>${space}<span class="terminal__comment">${comment}</span>`;
            });
        }

        return this.escapeHtml(text);
    }

    escapeHtml(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
