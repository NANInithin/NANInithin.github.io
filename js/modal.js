// ====================================
// Project Detail Modal System
// ====================================

export class Modal {
    constructor() {
        this.overlay = document.getElementById('modal-overlay');
        this.content = document.getElementById('modal-content');
        this.closeBtn = document.getElementById('modal-close');
        this.isOpen = false;
        if (!this.overlay) return;
        this.bindEvents();
    }

    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });

        document.querySelectorAll('.project-card[data-project]').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.project;
                this.openProject(id);
            });
        });
    }

    openProject(id) {
        const data = this.getProjectData(id);
        if (!data) return;

        this.content.innerHTML = `
            <div class="modal__header">
                <span class="modal__number">${data.number}</span>
                <h2 class="modal__title">${data.title}</h2>
                ${data.badge ? `<span class="tag tag--accent">${data.badge}</span>` : ''}
            </div>
            <p class="modal__desc">${data.description}</p>
            ${data.highlights ? `
            <div class="modal__section">
                <h3 class="modal__subtitle">Key Highlights</h3>
                <ul class="modal__highlights">
                    ${data.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
            </div>` : ''}
            ${data.metrics ? `
            <div class="modal__section">
                <h3 class="modal__subtitle">Results</h3>
                <div class="modal__metrics">
                    ${data.metrics.map(m => `
                        <div class="metric-card">
                            <div class="metric-card__value" style="color:${m.color || 'var(--accent-active)'}">${m.value}</div>
                            <div class="metric-card__label">${m.label}</div>
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}
            <div class="modal__section">
                <h3 class="modal__subtitle">Tech Stack</h3>
                <div class="modal__tags">${data.tags.map(t => `<span class="tag tag--accent">${t}</span>`).join('')}</div>
            </div>
            ${data.github || data.huggingface ? `
            <div class="modal__actions">
                ${data.github ? `<a href="${data.github}" target="_blank" rel="noopener" class="btn btn--primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    View Repository
                </a>` : ''}
                ${data.huggingface ? `<a href="${data.huggingface}" target="_blank" rel="noopener" class="btn btn--outline" style="border-color:var(--accent-cyan);color:var(--accent-cyan);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 14.5c-.828 0-1.5-.895-1.5-2s.672-2 1.5-2 1.5.895 1.5 2-.672 2-1.5 2zm3 0c-.828 0-1.5-.895-1.5-2s.672-2 1.5-2 1.5.895 1.5 2-.672 2-1.5 2zm-6.25-5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm9.5 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/></svg>
                    View on HuggingFace
                </a>` : ''}
            </div>` : ''}
        `;

        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
    }

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }

    getProjectData(id) {
        const projects = {
            'compact-vlm': {
                number: '01 — VLM RESEARCH',
                title: 'Mitigating Hallucination in Compact Vision-Language Models',
                badge: 'Featured Research',
                description: 'Investigated visual reliability in compact VLMs (<3B params), analyzing "Sycophancy" — the tendency to agree with leading questions regardless of visual evidence. Engineered solutions via Chain-of-Thought prompting and QLoRA fine-tuning on SmolVLM2-2.2B.',
                highlights: [
                    'Designed the "Purple Banana Test" to validate vision encoder functionality',
                    'Discovered 93.75% hallucination rate on adversarial leading questions',
                    'Implemented custom Chain-of-Thought "Visual Audit" prompt — reduced hallucinations by 44%',
                    'QLoRA fine-tuning achieved 78% safety score with only 100 training examples',
                    'Trained on consumer GPU (RTX 4060, 8GB VRAM) in under 1 hour',
                    'Created balanced "Yin-Yang" dataset (50% real objects, 50% phantom traps)'
                ],
                metrics: [
                    { value: '93.75%', label: 'Base Hallucination', color: '#ef4444' },
                    { value: '21.88%', label: 'After Fine-Tuning', color: '#22c55e' },
                    { value: '78%', label: 'Safety Score', color: 'var(--accent-active)' },
                    { value: '2.2B', label: 'Parameters', color: 'var(--accent-cyan)' }
                ],
                tags: ['SmolVLM2', 'QLoRA', 'PyTorch', 'Chain-of-Thought', 'PEFT', 'COCO', 'Transformers', 'CUDA 12.8'],
                github: 'https://github.com/NANInithin/Compact-VLM',
                huggingface: 'https://huggingface.co/NANI-Nithin/SmolVLM-Hallucination-Defense'
            },
            'uav-detection': {
                number: '02 — UAV VISION',
                title: 'Vehicle Detection & Speed Estimation for UAV',
                description: 'Designed an innovative UAV-based signaling system to improve road efficiency and prevent vehicle collisions at intersections. Uses aerial video feeds to detect, track, and estimate vehicle speeds in real-time.',
                highlights: [
                    'Real-time vehicle detection from aerial drone footage',
                    'Speed estimation via frame-to-frame displacement analysis',
                    'Transfer learning on YOLOv11 for domain adaptation',
                    'Intersection collision prevention signaling system'
                ],
                tags: ['YOLOv11', 'Transfer Learning', 'Python', 'OpenCV', 'Object Tracking'],
                github: 'https://github.com/NANInithin/Vehicle-speed-estimation-through-aerial-videos'
            },
            'edge-ai': {
                number: '03 — EDGE AI',
                title: 'Traffic Analysis via Edge AI Modules',
                description: 'Real-time vehicle detection, classification, and counting deployed on NVIDIA edge AI hardware. Trained YOLOv4 with transfer learning achieving high MAP, and deployed optimized models on resource-constrained devices.',
                highlights: [
                    'Deployed on NVIDIA Jetson Nano and Jetson Xavier',
                    'YOLOv4-tiny optimized for edge inference',
                    'Real-time vehicle counting and classification',
                    'Hand gesture recognition via transfer learning'
                ],
                tags: ['YOLOv4', 'Jetson Nano', 'Jetson Xavier', 'Transfer Learning', 'Edge AI', 'TensorRT'],
                github: null
            },
            'gan': {
                number: '04 — GENERATIVE AI',
                title: 'Synthetic Data Generation — VAE vs GAN',
                description: 'Comparative study of Variational Autoencoders and Generative Adversarial Networks for synthetic data generation. Trained models to augment training datasets, improving downstream classifier performance.',
                highlights: [
                    'Compared VAE and GAN architectures for data synthesis',
                    'Generated synthetic training samples to augment small datasets',
                    'Evaluated impact on classifier accuracy improvement',
                    'End-to-end pipeline from generation to evaluation'
                ],
                tags: ['GANs', 'VAE', 'PyTorch', 'Data Augmentation', 'Generative Models'],
                github: 'https://github.com/NANInithin/Generative-Models-VAE-vs-GAN'
            },
            'arithmetic-llm': {
                number: '05 — LLM RESEARCH',
                title: 'Arithmetic LLM — Supervised Pretraining vs RL Fine-Tuning',
                description: 'Investigating whether small language models can learn arithmetic through supervised pretraining versus reinforcement learning fine-tuning. Explores the effectiveness of different training paradigms for mathematical reasoning.',
                highlights: [
                    'Custom arithmetic dataset generation pipeline',
                    'Supervised pretraining on arithmetic operations',
                    'RL-based fine-tuning for improved reasoning',
                    'Comparative analysis of training paradigms'
                ],
                tags: ['Transformers', 'RL', 'PyTorch', 'NLP', 'Mathematical Reasoning'],
                github: 'https://github.com/NANInithin/Arithmetic-LLM-supervised-pretraining-vs-RL-finetuning'
            },
            'continual-learning': {
                number: '06 — CONTINUAL LEARNING',
                title: 'Continual Learning for Multitask Image Classification',
                description: 'Explored continual learning strategies to enable neural networks to learn multiple image classification tasks sequentially without catastrophic forgetting of previously learned knowledge.',
                highlights: [
                    'Multi-task image classification across different domains',
                    'Mitigated catastrophic forgetting',
                    'Evaluated various continual learning strategies',
                    'Benchmark across multiple datasets'
                ],
                tags: ['Continual Learning', 'PyTorch', 'CNNs', 'Image Classification', 'Transfer Learning'],
                github: 'https://github.com/NANInithin/Continual-Learning-for-Multitask-Image-Classification'
            },
            'dqn-cartpole': {
                number: '07 — REINFORCEMENT LEARNING',
                title: 'Deep Q-Learning — CartPole-v1',
                description: 'Implementation of Deep Q-Network (DQN) to solve the classic CartPole-v1 environment from OpenAI Gym. Demonstrates core RL concepts including experience replay, target networks, and epsilon-greedy exploration.',
                highlights: [
                    'DQN with experience replay buffer',
                    'Target network for training stability',
                    'Epsilon-greedy exploration strategy',
                    'Solved CartPole-v1 benchmark'
                ],
                tags: ['DQN', 'Reinforcement Learning', 'PyTorch', 'OpenAI Gym', 'Deep Learning'],
                github: 'https://github.com/NANInithin/deep-q-learning-cartpole-v1'
            },
            'hanoi-xr': {
                number: '08 — EXTENDED REALITY',
                title: 'Tower of Hanoi — Extended Reality Game',
                description: 'An immersive Tower of Hanoi puzzle game built with WebXR, supporting both VR and AR modes. Features 3D disk manipulation, move counting, hint system, and cross-platform browser compatibility.',
                highlights: [
                    'WebXR-based VR and AR support',
                    '3D interactive disk manipulation',
                    'Hint system with optimal move suggestions',
                    'Leaderboard and move counter'
                ],
                tags: ['Three.js', 'WebXR', 'JavaScript', 'VR', 'AR', '3D Graphics'],
                github: 'https://github.com/NANInithin/Hanoi_Tower_Extended-Reality'
            },
            'image-processing': {
                number: '09 — IMAGE PROCESSING',
                title: 'Image Processing Experiments',
                description: 'Collection of image processing techniques and experiments implemented in Jupyter Notebooks. Covers classical computer vision algorithms, filters, transformations, and analysis methods.',
                highlights: [
                    'Classical image processing algorithms',
                    'Filter and transformation operations',
                    'Jupyter Notebook based experiments',
                    'Foundation for computer vision workflows'
                ],
                tags: ['OpenCV', 'Python', 'Jupyter', 'Image Processing', 'Computer Vision'],
                github: 'https://github.com/NANInithin/NANIimage-processing'
            },
            'embedded-systems': {
                number: '10 — EMBEDDED SYSTEMS',
                title: 'Embedded Systems Projects',
                description: 'Collection of embedded systems projects implemented in C, covering microcontroller programming, sensor interfaces, and real-time control systems.',
                highlights: [
                    'Microcontroller programming in C',
                    'Sensor interfacing and data acquisition',
                    'Real-time control implementations'
                ],
                tags: ['C', 'Embedded Systems', 'Microcontrollers', 'IoT'],
                github: 'https://github.com/NANInithin/NANI_embedded-systems'
            },
            'arduino': {
                number: '11 — IoT & HARDWARE',
                title: 'Arduino Projects',
                description: 'Hardware projects using Arduino platforms, demonstrating sensor integration, actuator control, and IoT prototyping with C++.',
                highlights: [
                    'Arduino-based hardware prototyping',
                    'Sensor integration projects',
                    'IoT and connected device experiments'
                ],
                tags: ['Arduino', 'C++', 'IoT', 'Hardware', 'Sensors'],
                github: 'https://github.com/NANInithin/NANIarduino'
            }
        };
        return projects[id];
    }
}
