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
            ${data.github || data.huggingface || data.demo || data.website ? `
            <div class="modal__actions">
                ${data.website ? `<a href="${data.website}" target="_blank" rel="noopener" class="btn btn--primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Visit Website
                </a>` : ''}
                ${data.demo ? `<a href="${data.demo}" target="_blank" rel="noopener" class="btn btn--primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>
                    Live Demo
                </a>` : ''}
                ${data.github ? `<a href="${data.github}" target="_blank" rel="noopener" class="btn ${data.demo || data.website ? 'btn--outline' : 'btn--primary'}">
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
        this.overlay.style.zIndex = '';
        // Keep overflow hidden if space journey is active
        const sjActive = document.querySelector('.space-journey.active');
        if (!sjActive) document.body.style.overflow = '';
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
            'image-processing': {
                number: '04 — IMAGE PROCESSING',
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
            'gan': {
                number: '06 — GENERATIVE AI',
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
                number: '07 — LLM RESEARCH',
                title: 'Arithmetic LLM — Supervised Pretraining vs RL Fine-Tuning (v4)',
                badge: 'v4 Scratchpad CoT',
                description: 'A ~310M parameter decoder-only Transformer evaluating supervised pretraining against reinforcement learning fine-tuning for multi-digit arithmetic (+, -, ×) with up to 5-digit operands. Implements scratchpad Chain-of-Thought (CoT) and trained on Modal cloud A100-40GB / H100 GPUs across a 7-phase curriculum.',
                highlights: [
                    'Scratchpad Chain-of-Thought decoding resolving train/inference distribution mismatch',
                    'Achieved 95.00% overall accuracy across 5-digit addition, subtraction, and multiplication',
                    'Perfect 100% accuracy on 1–4 digit operands and 99.30% on 5-digit problems',
                    '100% accuracy on subtraction, 95.8% on addition, and 89.9% on multiplication',
                    'Supervised pretraining (20 epochs, 300k samples) + RL fine-tuning (15k episodes)',
                    'Modal cloud GPU pipeline with automated volume checkpoints and MLflow tracking'
                ],
                metrics: [
                    { value: '95.00%', label: '5-Digit Accuracy', color: '#22c55e' },
                    { value: '100%', label: '1–4 Digit Accuracy', color: 'var(--accent-active)' },
                    { value: '~310M', label: 'Decoder-Only Params', color: 'var(--accent-cyan)' },
                    { value: 'A100/H100', label: 'Modal Cloud GPU', color: '#f5d547' }
                ],
                tags: ['Transformers', 'Chain-of-Thought', 'Modal Cloud', 'PyTorch', 'MLflow', 'Reinforcement Learning', 'NLP'],
                github: 'https://github.com/NANInithin/Arithmetic-LLM-supervised-pretraining-vs-RL-finetuning'
            },
            'continual-learning': {
                number: '05 — CONTINUAL LEARNING',
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
                number: '08 — REINFORCEMENT LEARNING',
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
            'hf-quants': {
                number: '09 — OPEN-SOURCE CONTRIBUTIONS',
                title: 'Open-Source GGUF Quantizations on Hugging Face',
                badge: 'Open Source',
                description: 'An ongoing open-source contribution to the local-inference community: newly released and trending models converted into llama.cpp GGUF quantizations and published on Hugging Face with model cards, so they run on consumer hardware. Coverage spans compact 0.35B models up to a 36B-A4B mixture-of-experts, including text, vision-language, code and text-to-speech models. Many quants are produced with my AgentQuantix pipeline.',
                highlights: [
                    'K2-Horizon-MoVA-36B-A4B-GGUF — 48K+ downloads',
                    'K2-Horizon-7B-GGUF — 25K+ downloads',
                    'Muse-Glimmer-30B-GGUF — 25K+ downloads',
                    'Ling-3.0-tiny-GGUF — 16K+ downloads',
                    'K2-Horizon-3.7B-GGUF & MiniCPM5-2B-GGUF — 15K+ downloads each',
                    'Also: Nemotron-3.5-Lightning-30B-A3B, Instella-MoE-16B-A3B-Think, Granite 4.2, LFM2.5-VL, SenseNova-U1.5, Qwen3-TTS, VoxCPM2 and more'
                ],
                metrics: [
                    { value: '210K+', label: 'Total Downloads', color: '#22c55e' },
                    { value: '29', label: 'GGUF Model Repos', color: 'var(--accent-active)' },
                    { value: '0.35B–36B', label: 'Model Size Range', color: 'var(--accent-cyan)' },
                    { value: '120+', label: 'Community Likes', color: '#f5d547' }
                ],
                tags: ['Open Source', 'llama.cpp', 'GGUF', 'Quantization', 'HuggingFace', 'MoE', 'Local Inference'],
                huggingface: 'https://huggingface.co/NANI-Nithin'
            },
            'agent-keireki': {
                number: '10 — AI PRODUCT',
                title: 'Agent Keireki — Tailored Applications, Delivered',
                badge: 'Live Product',
                description: 'A production job-application assistant with a deliberately short Telegram flow: link once, send a job URL, pasted description or screenshot, receive a fit verdict, then generate a resume, cover letter, email, or all three — grounded only in the candidate\'s own experience. The web app provides the wallet, job history, artifact downloads and asynchronous job research across public job boards.',
                highlights: [
                    'Telegram bot + FastAPI web app + owner-only admin console + background research worker',
                    'Candidate-fit scoring before any document is generated',
                    'Rules-driven resume engine with automated evaluation and repair loop',
                    'Internal source-backed candidate profile that users can review or reject fact-by-fact',
                    'Universal job-link fetching with direct ATS adapters as fallback',
                    'Stripe-backed EUR wallet with an atomic ledger; isolated staging and production behind Caddy'
                ],
                metrics: [
                    { value: '1 Link', label: 'In → Full Application Out', color: 'var(--accent-active)' },
                    { value: '3', label: 'Artifacts: Resume · Letter · Email', color: '#22c55e' },
                    { value: 'Live', label: 'agentkeireki.com', color: 'var(--accent-cyan)' }
                ],
                tags: ['AI Agents', 'LLMs', 'FastAPI', 'Telegram Bot', 'PostgreSQL', 'SQLAlchemy', 'Stripe', 'ReportLab', 'Docker', 'Caddy'],
                website: 'https://agentkeireki.com/'
            },
            'agent-quantix': {
                number: '11 — AI AGENT / QUANTIZATION',
                title: 'AgentQuantix — Autonomous LLM Quantization Agent',
                badge: 'New Project',
                description: 'Autonomous CLI and MCP agent that scans trending Hugging Face models, computes local hardware feasibility (RAM, VRAM, peak disk, transfer and compute time), quantizes models to llama.cpp GGUF with imatrix calibration, validates loadability before publish, and uploads to Hugging Face with auto-generated model cards under two human-in-the-loop approval gates.',
                highlights: [
                    'Two strict human gates: user initiates research, user approves candidate models',
                    'Deterministic Hugging Face Hub REST API trending scraper filtering text base models',
                    'Hardware resource calculator: predicts peak disk, VRAM, RAM, and duration before committing',
                    'Overlapped quantization and upload queue: minimizes peak disk via immediate local purge after Hub upload',
                    'Full 29-type GGUF sweep with imatrix calibration on wikitext-2',
                    'Automatic loadability verification before publishing: refuses broken GGUFs and verifies real file sizes',
                    'Dual interface: standalone CLI and lightweight zero-dependency MCP server for AI harnesses (Claude Code, OpenRouter, Codex)'
                ],
                metrics: [
                    { value: '29 Types', label: 'GGUF Quant Sweep', color: 'var(--accent-active)' },
                    { value: '2 Gates', label: 'Human-in-the-Loop', color: '#22c55e' },
                    { value: '100+', label: 'Trending Models Scanned', color: 'var(--accent-cyan)' },
                    { value: 'CLI + MCP', label: 'Agent Protocol', color: '#f5d547' }
                ],
                tags: ['AI Agents', 'llama.cpp', 'GGUF', 'Quantization', 'HuggingFace', 'MCP', 'Python', 'uv'],
                github: 'https://github.com/NANInithin/AgentQuantix'
            },
            'cityquest-ai': {
                number: '12 — AI AGENT',
                title: 'CityQuest AI',
                description: 'A location-based game application that generates interactive games (scavenger hunts, hide-and-seek, tag) using AI. Uses a custom LoRA fine-tuned NVIDIA Nemotron-3-Nano-4B model to dynamically produce game content in structured JSON format based on real-world locations.',
                highlights: [
                    'Custom LoRA fine-tune of Nemotron-3-Nano-4B for domain-specific game generation',
                    'Structured JSON output schema for game data',
                    'GGUF quantized (Q4_K_M) for efficient local inference via llama.cpp',
                    'Custom dataset of ~840 training examples for location-based games',
                    'Model hosted on HuggingFace for easy deployment'
                ],
                metrics: [
                    { value: '4B', label: 'Base Model Params', color: 'var(--accent-active)' },
                    { value: '840', label: 'Training Examples', color: 'var(--accent-cyan)' },
                    { value: 'Q4_K_M', label: 'Quantization', color: '#22c55e' }
                ],
                tags: ['Nemotron', 'LoRA', 'Unsloth', 'llama.cpp', 'GGUF', 'Python', 'HuggingFace'],
                website: 'https://huggingface.co/spaces/build-small-hackathon/CityQuest-AI',
                github: 'https://github.com/NANInithin/CityQuest-AI',
                huggingface: 'https://huggingface.co/NANI-Nithin/CityQuest-Nemotron-3-Nano-4B-GGUF'
            },
            'agent-voca': {
                number: '13 — VOICE DICTATION & OBSERVER',
                title: 'AgentVoca — Model-Agnostic Voice Dictation Desktop App',
                badge: 'v0.4.0 Observer',
                description: 'A developer-first, model-agnostic voice dictation desktop app for macOS and Windows. Allows pairing any ASR provider (faster-whisper, local or remote) with any cleanup/LLM provider, inserting clean formatted text directly at the active cursor. Includes v0.4.0 Observer mode for multimodal session recording.',
                highlights: [
                    'Model-agnostic architecture: swap ASR (Whisper) or LLM cleanup providers with single-line config',
                    'Local-first & offline mode: runs fully local via faster-whisper without data leaving the machine',
                    'Observer mode (v0.4.0): records mic + screen keyframes + selections into formatted markdown & JSON sidecar',
                    'Built-in RapidOCR (ONNX) via onnxruntime for zero-config offline visual text extraction',
                    'Technical text preservation: protects code identifiers, URLs, file paths, and CLI flags from LLM alteration',
                    'Real-time streaming transcription, voice commands ("new paragraph", "scratch that"), and screenshot-to-text'
                ],
                metrics: [
                    { value: 'Local-First', label: 'Zero-Cloud Mode', color: '#22c55e' },
                    { value: 'v0.4.0', label: 'Observer Session Mode', color: 'var(--accent-active)' },
                    { value: '100%', label: 'Code & Syntax Safe', color: 'var(--accent-cyan)' }
                ],
                tags: ['Voice AI', 'faster-whisper', 'LLMs', 'RapidOCR', 'ONNX', 'Python', 'Desktop App'],
                github: 'https://github.com/NANInithin/AgentVoca'
            },
            'hanoi-xr': {
                number: '14 — EXTENDED REALITY',
                title: 'Tower of Hanoi — Extended Reality Game',
                description: 'An immersive Tower of Hanoi puzzle game built with WebXR, supporting both VR and AR modes. Features 3D disk manipulation, move counting, hint system, and cross-platform browser compatibility.',
                highlights: [
                    'WebXR-based VR and AR support',
                    '3D interactive disk manipulation',
                    'Hint system with optimal move suggestions',
                    'Leaderboard and move counter',
                    'Cross-platform desktop & immersive headset support'
                ],
                tags: ['Three.js', 'WebXR', 'JavaScript', 'VR', 'AR', '3D Graphics'],
                github: 'https://github.com/NANInithin/Hanoi_Tower_Extended-Reality',
                demo: 'https://NANInithin.github.io/Hanoi_Tower_Extended-Reality/'
            },
            'azure-ocr': {
                number: '15 — AI ENGINEERING',
                title: 'Azure OCR Job Matcher',
                badge: '42/42 Tests Passing',
                description: 'Production-grade candidate-to-job matching backend powered by Azure AI Document Intelligence and Large Language Models. Ingests unstructured candidate resumes (PDFs, images), extracts structured candidate profiles with field-level confidence scoring, and matches against parsed job descriptions with transparent decision evidence.',
                highlights: [
                    'Azure AI Document Intelligence OCR for text and layout extraction',
                    'Deterministic parsing rules with attached field-level confidence scores',
                    'Semantic job matching using vector embeddings and LLM-based scoring',
                    '42/42 unit and route-level evaluation tests passing in CI harness',
                    'Persisted artifact registry and saved match retrieval endpoints (FastAPI)',
                    'Skill gap analysis and explainable decision notes for recruiters'
                ],
                metrics: [
                    { value: '42/42', label: 'CI Tests Passing', color: '#22c55e' },
                    { value: '100%', label: 'Field Confidence Scoring', color: 'var(--accent-cyan)' },
                    { value: 'FastAPI', label: 'Modular Architecture', color: 'var(--accent-active)' }
                ],
                tags: ['Azure AI', 'OCR', 'FastAPI', 'LLMs', 'Python', 'Document Intelligence', 'CI/CD'],
                github: 'https://github.com/NANInithin/azure-ocr-job-matcher'
            }
        };
        return projects[id];
    }
}
