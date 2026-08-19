/**
 * Mohamed FARES SLIMANI - PORTFOLIO INTERACTION ENGINE
 * Features:
 * - Dynamic Neural Constellation Canvas
 * - Typewriter Animation with authentic roles
 * - Category Filtering (Skills & Projects)
 * - Interactive Project Details Modal
 * - Live GitHub API Synchronization
 * - Copy to Clipboard Toast (Email & Phone)
 * - Scroll Spy & Mobile Navigation
 */

// SVG Brand Icon Definitions for GitHub and LinkedIn (not bundled in Lucide core)
const BRAND_ICONS = {
  github: (size = 20) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  linkedin: (size = 20) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`
};

function refreshIcons(container = document) {
  if (window.lucide) {
    lucide.createIcons();
  }
  container.querySelectorAll('[data-lucide="github"]').forEach((el) => {
    const isSmall = el.style.width === '16px' || el.closest('.project-link') || el.closest('.btn');
    el.outerHTML = BRAND_ICONS.github(isSmall ? 16 : 20);
  });
  container.querySelectorAll('[data-lucide="linkedin"]').forEach((el) => {
    const isSmall = el.style.width === '16px' || el.closest('.btn');
    el.outerHTML = BRAND_ICONS.linkedin(isSmall ? 16 : 20);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Icons
  refreshIcons();

  // Update current copyright year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Initialize all interactive modules
  initCanvasAnimation();
  initTypewriter();
  initNavigation();
  initSkillsFilter();
  initProjectsFilter();
  initProjectModal();
  initGitHubRepos();
  initContactForm();
  initToast();
  initEasterEggs();
});

/* ==========================================================================
   1. Neural Constellation Canvas Background
   ========================================================================== */
function initCanvasAnimation() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: null, y: null, radius: 140 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particleCount = Math.min(Math.floor((width * height) / 16000), 75);
  const particles = [];

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.5 ? 'rgba(99, 102, 241, ' : 'rgba(6, 182, 212, ';
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const dirX = (dx / dist) * force * 1.5;
          const dirY = (dy / dist) * force * 1.5;
          this.x -= dirX;
          this.y -= dirY;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const opacity = (1 - dist / 120) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. Typewriter Effect
   ========================================================================== */
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const roles = [
    'Senior Mobile Engineer @ ICOSNET',
    'PhD Researcher in AI & Vision',
    'Flutter & Clean Architecture Craftsman',
    'University Adjunct Instructor (OS & AI)',
    'NVIDIA Certified Deep Learning Engineer'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      el.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35;
    } else {
      el.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 2200; // Pause at end of text
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   3. Header, ScrollSpy & Mobile Navigation
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const closeDrawer = document.getElementById('close-drawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const backToTop = document.getElementById('back-to-top');

  // Sticky Header & Back to Top
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    if (scrollPos > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (scrollPos > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // ScrollSpy
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${id}"]`);

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
        if (navLink) navLink.classList.add('active');
      }
    });
  });

  // Mobile Drawer Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
    });
  }

  if (closeDrawer && mobileDrawer) {
    closeDrawer.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
    });
  }

  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (mobileDrawer) mobileDrawer.classList.remove('open');
    });
  });

  // Back to Top Click
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   4. Skills Category Filtering
   ========================================================================== */
function initSkillsFilter() {
  const tabs = document.querySelectorAll('#skills-filter-tabs .filter-tab');
  const skillCards = document.querySelectorAll('#skills-grid .skill-card');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      skillCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. Projects Filtering
   ========================================================================== */
function initProjectsFilter() {
  const filterBtns = document.querySelectorAll('.proj-filter');
  const projectCards = document.querySelectorAll('#projects-grid .project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   6. Project Details Modal
   ========================================================================== */
const projectDetailsData = {
  orthoConnect: {
    title: 'orthoConnect — Practice Management System',
    category: 'Flutter Windows Desktop Application',
    repoUrl: 'https://github.com/MFaresSlimani/orthoConnect',
    overview:
      'A dedicated Windows desktop clinical practice management application built with Flutter Desktop for orthopedic doctors and clinics to digitalize patient consultations, diagnostic records, and appointment schedules.',
    keyFeatures: [
      'Engineered for Windows Desktop with Flutter, featuring custom desktop window chrome (bitsdojo_window).',
      'High-performance offline local database management powered by SQLite (sqflite_common_ffi).',
      'Clinical consultation tracking, prescription archiving, and patient history logging.',
      'Document and image attachment handling using native file pickers and path providers.',
      'Clean reactive state management with GetX.'
    ],
    techStack: ['Flutter Desktop', 'Dart', 'sqflite_common_ffi', 'bitsdojo_window', 'GetX', 'File Picker', 'Windows FFI']
  },
  Rizervitoo: {
    title: 'Rezervitoo — Algeria Tourism & Property Rental Platform',
    category: 'Mobile Application (Flutter)',
    repoUrl: 'https://github.com/MFaresSlimani/Rizervitoo',
    overview:
      'A feature-rich mobile tourism and property rental application covering 58 wilayas in Algeria, connecting travelers with holiday rentals, agencies, and local landmark guides.',
    keyFeatures: [
      'Explore properties, apartments, and villas across all Algerian wilayas with interactive maps.',
      'Supabase backend integration providing secure authentication, PostgreSQL database, and media storage.',
      'Agency directory and curated wilaya travel guides highlighting top regional attractions.',
      'Multilingual interface with full support for Arabic, English, and French.',
      'Modern glassmorphism UI with Lottie micro-animations, photo viewing, and image compression.',
      'Smooth state management and offline persistence with GetX and GetStorage.'
    ],
    techStack: ['Flutter', 'Dart', 'Supabase (PostgreSQL & Auth)', 'GetX', 'Lottie', 'Glassmorphism', 'PhotoView', 'Multilingual (AR/EN/FR)']
  },
  'EZ-Check-in': {
    title: 'EZ-Check-in — Event Entry & Fast QR Scanner (GDG Medea)',
    category: 'Event Tech Mobile Application (Flutter)',
    repoUrl: 'https://github.com/MFaresSlimani/EZ-Check-in',
    overview:
      'Engineered specifically for Google Developer Group (GDG) Medea tech conferences (DevFest, I/O Extended) to eliminate registration queues through sub-second camera QR verification.',
    keyFeatures: [
      'Sub-second QR badge scanner with instant visual status feedback and camera flash control.',
      'Optimized camera feed pipeline for rapid consecutive attendee scanning.',
      'Designed for GDG community volunteers to manage conference admissions with zero friction.',
      'Offline caching capabilities allowing uninterrupted check-in during network instability.'
    ],
    techStack: ['Flutter', 'Dart', 'qr_code_scanner', 'Camera SDK', 'Google Fonts', 'GDG Medea']
  },
  'Sandooq-app': {
    title: 'Musharek (مشارك) / Sandooq — Rotating Savings Circles',
    category: 'Fintech Mobile Application (Flutter)',
    repoUrl: 'https://github.com/MFaresSlimani/Sandooq-app',
    overview:
      'A modern fintech mobile application that digitalizes traditional community rotating savings and credit associations ("دوائر" / ROSCA), empowering groups to save securely and transparently.',
    keyFeatures: [
      'Create and explore community savings circles ("دوائر") with customizable contribution rounds.',
      'Automated payout cycle tracking and turn-based member fund distribution.',
      'Supabase backend integration for real-time circle updates, secure authentication, and member data.',
      'Custom Arabic typography (Cairo Google Font) with dark and light mode themes.',
      'Reactive state management and modular architecture built with GetX.'
    ],
    techStack: ['Flutter', 'Dart', 'GetX', 'Supabase', 'Cairo Typography', 'Material 3', 'Fintech Architecture']
  },
  optica_beta: {
    title: 'Optica — Optical Eyewear & Glasses Catalog',
    category: 'E-Commerce Mobile Application (Flutter)',
    repoUrl: 'https://github.com/MFaresSlimani/optica_beta',
    overview:
      'A sleek optical eyewear shopping and discovery application built with Flutter, allowing customers to explore designer frames, customize optical lenses, and select glasses tailored to their style.',
    keyFeatures: [
      'Interactive catalog showcasing optical glasses and sunglasses collections with high-res imagery.',
      'Custom wheel pickers for intuitive frame color and dimension selection.',
      'Smooth animations and responsive layouts engineered with GetX state management.',
      'Shopping cart and checkout flows designed for effortless mobile purchasing.'
    ],
    techStack: ['Flutter', 'Dart', 'GetX', 'Wheel Picker', 'Google Fonts', 'Mobile E-Commerce']
  },
  'algerianSignLanguage-avatar': {
    title: 'Algerian Sign Language 3D Avatar System',
    category: 'AI & Multimodal 3D Vision',
    repoUrl: 'https://github.com/MFaresSlimani/algerianSignLanguage-avatar',
    liveUrl: 'https://3dasl-avatar.vercel.app/',
    overview:
      'A pioneering assistive technology project synthesizing Algerian Sign Language (ASL) through a calibrated 3D animated human avatar, backed by the published 3DZSignDB dataset.',
    keyFeatures: [
      '3D kinematic keyframe and skeletal motion sequence synthesis for signs.',
      'Live interactive web deployment on Vercel (3dasl-avatar.vercel.app).',
      'Accompanying 3DZSignDB open science dataset on Zenodo (DOI: 10.5281/zenodo.15020376).',
      'Peer-reviewed and presented at Nafath Majlis, Qatar (DOI: 10.54455/mcn2804).',
      'Aimed at empowering hearing-impaired communities through automated gesture translation.'
    ],
    techStack: ['Three.js', 'WebGL', '3D Kinematics', 'Python NLP', 'Zenodo Dataset', 'Nafath Majlis']
  },
  'Retinal-AI': {
    title: 'Retinal Vessel Deep Learning Segmentation',
    category: 'PhD Doctoral Research (Boumerdès University)',
    repoUrl: 'https://github.com/MFaresSlimani',
    overview:
      'Advanced biomedical image processing pipeline applying deep convolutional networks (FR-UNet and Attention U-Net) to achieve high-accuracy micro-vessel segmentation in retinal fundus photography.',
    keyFeatures: [
      'Achieved a verified 0.815 F1-score benchmark on the CHASE_DB1 retinal dataset.',
      'Multi-scale feature aggregation with attention gates focusing on fine capillary structures.',
      'Preprocessing pipeline with CLAHE contrast enhancement and morphological filtering.',
      'Designed to assist ophthalmologists with early detection of diabetic retinopathy.'
    ],
    techStack: ['PyTorch', 'TorchVision', 'FR-UNet', 'Attention U-Net', 'OpenCV', 'CHASE_DB1', 'CUDA']
  }
};

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body-content');
  const closeBtn = document.getElementById('modal-close-btn');
  const detailButtons = document.querySelectorAll('.project-detail-btn');

  if (!modal || !modalBody) return;

  detailButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const projKey = btn.getAttribute('data-project');
      const data = projectDetailsData[projKey];

      if (!data) return;

      modalBody.innerHTML = `
        <div class="modal-header-section" style="margin-bottom: 1.5rem;">
          <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-cyan); text-transform: uppercase;">${data.category}</span>
          <h2 style="font-family: var(--font-heading); font-size: 1.6rem; color: #fff; margin-top: 0.3rem;">${data.title}</h2>
        </div>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.5rem;">${data.overview}</p>
        
        <h4 style="font-family: var(--font-heading); color: #fff; font-size: 1.1rem; margin-bottom: 0.8rem;">Key Highlights</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem;">
          ${data.keyFeatures.map((f) => `<li style="display: flex; gap: 0.6rem; font-size: 0.9rem; color: var(--text-main);"><span style="color: var(--accent-cyan); font-weight: bold;">&bull;</span> <span>${f}</span></li>`).join('')}
        </ul>

        <h4 style="font-family: var(--font-heading); color: #fff; font-size: 1.1rem; margin-bottom: 0.8rem;">Technologies & Architecture</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 2rem;">
          ${data.techStack.map((t) => `<span style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); padding: 0.25rem 0.7rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted);">${t}</span>`).join('')}
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          ${data.liveUrl ? `
            <a href="${data.liveUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
              <i data-lucide="globe" style="width:16px;height:16px;"></i> Live Demo
            </a>
          ` : ''}
          ${data.repoUrl && data.repoUrl !== 'https://github.com/MFaresSlimani' ? `
            <a href="${data.repoUrl}" target="_blank" rel="noopener" class="btn ${data.liveUrl ? 'btn-secondary' : 'btn-primary'} btn-sm">
              <i data-lucide="github" style="width:16px;height:16px;"></i> View Repository
            </a>
          ` : `
            <a href="${data.repoUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
              <i data-lucide="github" style="width:16px;height:16px;"></i> GitHub Profile
            </a>
          `}
        </div>
      `;

      refreshIcons(modalBody);
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

/* ==========================================================================
   7. Live GitHub API Repositories
   ========================================================================== */
async function initGitHubRepos() {
  const container = document.getElementById('github-repos-grid');
  if (!container) return;

  const fallbackRepos = [
    {
      name: 'Rizervitoo',
      description: 'Tourism and rental properties app in Algeria with Supabase & GetX.',
      language: 'Dart / Flutter',
      html_url: 'https://github.com/MFaresSlimani/Rizervitoo',
      stargazers_count: 0
    },
    {
      name: 'Sandooq-app',
      description: 'Fintech mobile app for rotating community savings circles ("دوائر").',
      language: 'Dart / Flutter',
      html_url: 'https://github.com/MFaresSlimani/Sandooq-app',
      stargazers_count: 0
    },
    {
      name: 'orthoConnect',
      description: 'Windows practice management application built with Flutter Desktop & SQLite.',
      language: 'Dart / Flutter Desktop',
      html_url: 'https://github.com/MFaresSlimani/orthoConnect',
      stargazers_count: 0
    },
    {
      name: 'EZ-Check-in',
      description: 'High-speed QR code ticket validation app built for GDG Medea conferences.',
      language: 'Dart / Flutter',
      html_url: 'https://github.com/MFaresSlimani/EZ-Check-in',
      stargazers_count: 1
    },
    {
      name: 'optica_beta',
      description: 'Optical eyewear store & glasses e-commerce mobile application in Flutter.',
      language: 'Dart / Flutter',
      html_url: 'https://github.com/MFaresSlimani/optica_beta',
      stargazers_count: 0
    },
    {
      name: 'algerianSignLanguage-avatar',
      description: '3D animated avatar translating text into Algerian Sign Language gestures.',
      language: 'Three.js / Python',
      html_url: 'https://github.com/MFaresSlimani/algerianSignLanguage-avatar',
      stargazers_count: 0
    }
  ];

  try {
    const response = await fetch('https://api.github.com/users/MFaresSlimani/repos?sort=updated&per_page=6');
    if (!response.ok) throw new Error('Network error');
    const repos = await response.json();

    if (repos && Array.isArray(repos) && repos.length > 0) {
      renderRepos(repos, container);
      return;
    }
    renderRepos(fallbackRepos, container);
  } catch (err) {
    renderRepos(fallbackRepos, container);
  }
}

function renderRepos(repos, container) {
  container.innerHTML = repos
    .slice(0, 6)
    .map(
      (repo) => `
      <a href="${repo.html_url}" target="_blank" rel="noopener" class="gh-repo-card">
        <div>
          <div class="gh-repo-header">
            <i data-lucide="git-fork"></i>
            <span class="gh-repo-name">${repo.name}</span>
          </div>
          <p class="gh-repo-desc">${repo.description || 'Public repository by @MFaresSlimani'}</p>
        </div>
        <div class="gh-repo-meta">
          <span><i data-lucide="code" style="width:12px;height:12px;display:inline;margin-right:3px;"></i>${repo.language || 'Code'}</span>
          <span><i data-lucide="star" style="width:12px;height:12px;display:inline;margin-right:3px;"></i>${repo.stargazers_count || 0}</span>
        </div>
      </a>
    `
    )
    .join('');

  refreshIcons(container);
}

/* ==========================================================================
   8. Contact Form & Clipboard Action
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.');
      return;
    }

    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn-spinner"></span> <span>Sending...</span>`;

    try {
      const response = await fetch('https://formsubmit.co/ajax/1cc6a7dbb378c25e778a17889f32705b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          _subject: `[Portfolio DM] ${subject || 'New Message'} - from ${name}`,
          message: message,
          _template: 'table'
        })
      });

      const result = await response.json();

      if (response.ok || result.success === 'true' || result.success === true) {
        showToast('Message sent successfully! I will reply soon.');
        form.reset();
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      // Fallback: If network block occurs, offer fallback
      showToast('Could not send automatically. Opening email client...');
      const mailtoUrl = `mailto:faresslimani0@gmail.com?subject=${encodeURIComponent(
        `[Portfolio Contact] ${subject} - from ${name}`
      )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      window.location.href = mailtoUrl;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      refreshIcons(submitBtn);
    }
  });
}

function initToast() {
  const copyHeroBtn = document.getElementById('hero-copy-email-btn');
  const copyActionBtn = document.getElementById('copy-email-action');
  const copyPhoneBtn = document.getElementById('copy-phone-action');

  function copyEmail() {
    const email = 'faresslimani0@gmail.com';
    navigator.clipboard
      .writeText(email)
      .then(() => {
        showToast('Email copied to clipboard: faresslimani0@gmail.com');
      })
      .catch(() => {
        showToast('faresslimani0@gmail.com');
      });
  }

  function copyPhone() {
    const phone = '+213 558 139 901';
    navigator.clipboard
      .writeText(phone)
      .then(() => {
        showToast('Phone number copied: +213 558 139 901');
      })
      .catch(() => {
        showToast('+213 558 139 901');
      });
  }

  if (copyHeroBtn) copyHeroBtn.addEventListener('click', copyEmail);
  if (copyActionBtn) copyActionBtn.addEventListener('click', copyEmail);
  if (copyPhoneBtn) copyPhoneBtn.addEventListener('click', copyPhone);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   9. Easter Eggs (Interactive Kitten Tsuki & Konami Code)
   ========================================================================== */
function initEasterEggs() {
  // --- A. Interactive Peeking Kitten (Tsuki) ---
  const kitten = document.getElementById('kitten-easter-egg');
  const bubble = document.getElementById('kitten-bubble');

  const meowPhrases = [
    'Meow! 🐾',
    'Purrr...',
    'You found Tsuki! 🌙',
    'Need a Senior Mobile Engineer?',
    'Building cool things with Flutter & AI',
    '100% bug-free (I ate all the bugs)',
    'Sehr gut!',
    '58 Wilayas of Algeria explored!',
    'Keep petting me!',
    'Flutter is awesome!'
  ];

  let petCount = 0;
  let phraseIdx = 0;
  const particleIcons = ['🐾', '✨', '❤️', '🌙', '⚡', '🐱', '💖'];

  if (kitten && bubble) {
    kitten.addEventListener('click', (e) => {
      petCount++;
      phraseIdx = (phraseIdx + 1) % meowPhrases.length;

      // Update speech bubble
      bubble.textContent = meowPhrases[phraseIdx];
      bubble.classList.add('show');

      // Spawn floating click particle
      const rect = kitten.getBoundingClientRect();
      const particle = document.createElement('div');
      particle.className = 'kitten-particle';
      particle.textContent = particleIcons[Math.floor(Math.random() * particleIcons.length)];
      particle.style.left = `${rect.left + rect.width / 2 + (Math.random() * 30 - 15)}px`;
      particle.style.top = `${rect.top - 10}px`;
      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 1200);

      // Secret Petting Achievement
      if (petCount === 7) {
        bubble.textContent = '🏆 Achievement Unlocked: Cat Whisperer! 🐾';
        showToast('🐱 You unlocked the Cat Whisperer achievement!');
      }

      // Hide bubble after 2.5s if not hovered
      setTimeout(() => {
        if (!kitten.matches(':hover')) {
          bubble.classList.remove('show');
        }
      }, 2500);
    });
  }

  // --- B. Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) ---
  const konamiSequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA'
  ];
  let konamiIndex = 0;

  window.addEventListener('keydown', (e) => {
    const code = e.code || e.key;
    const targetKey = konamiSequence[konamiIndex];

    if (code === targetKey || e.key.toLowerCase() === targetKey.replace('Key', '').toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        activatePartyMode();
      }
    } else {
      konamiIndex = 0;
    }
  });

  function activatePartyMode() {
    document.body.classList.add('party-mode');
    showToast('🎮 Konami Code Activated: Cyber Neon Mode! 🚀');

    if (bubble) {
      bubble.textContent = '⚡ PARTY TIME! ⚡';
      bubble.classList.add('show');
    }

    setTimeout(() => {
      document.body.classList.remove('party-mode');
    }, 10000);
  }

  // --- C. Developer Console Greeting ---
  try {
    console.log(
      `%c
 /\\_/\\  
( o.o )  Mohamed Fares Slimani (Tsuki)
 > ^ <   Senior Mobile Engineer & AI PhD Researcher
`,
      'color: #38bdf8; font-weight: bold; font-family: monospace; font-size: 14px;'
    );
    console.log(
      '%c🚀 Welcome, fellow developer! Explore the portfolio repository at https://github.com/MFaresSlimani',
      'color: #a78bfa; font-size: 12px; font-weight: 600;'
    );
  } catch (err) {
    // Silent
  }
}

