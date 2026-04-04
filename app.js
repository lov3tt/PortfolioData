/* ═══════════════════════════════════════════
   BOBBY QUACH PORTFOLIO — app.js
   Handles: cursor, nav, particles, scroll
   reveals, counters, active links
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     CUSTOM CURSOR
  ───────────────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth follower via RAF
  (function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  })();

  // Cursor scale on interactive elements
  const interactives = document.querySelectorAll('a, button, .pill, .cert-card, .project-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2)';
      cursor.style.background = 'var(--gold)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.background = 'var(--red)';
    });
  });

  /* ─────────────────────────────────────────
     NAVBAR — scroll behaviour + active links
  ───────────────────────────────────────── */
  const navbar  = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  function updateNav() {
    // Scrolled class
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // Active link highlighting
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 130) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ─────────────────────────────────────────
     MOBILE MENU
  ───────────────────────────────────────── */
  const menuBtn    = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    // Animate hamburger → X
    const spans = menuBtn.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      const spans = menuBtn.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ─────────────────────────────────────────
     PARTICLE CANVAS
  ───────────────────────────────────────── */
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const PARTICLE_COUNT = 60;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x    = Math.random() * canvas.width;
      this.y    = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fade = Math.random() * 0.003 + 0.001;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.opacity -= this.fade;
      if (this.opacity <= 0 || this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 60, 84, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Subtle connection lines between nearby particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 60, 84, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ─────────────────────────────────────────
     SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
        // Trigger counter if in stats panel
        const vals = entry.target.querySelectorAll('[data-target]');
        vals.forEach(animateCounter);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─────────────────────────────────────────
     ANIMATED COUNTERS
  ───────────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1400;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ─────────────────────────────────────────
     SMOOTH SCROLL for all anchor links
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────
     PILL HOVER — staggered entrance
  ───────────────────────────────────────── */
  document.querySelectorAll('.skill-category').forEach(cat => {
    const pills = cat.querySelectorAll('.pill');
    pills.forEach((pill, i) => {
      pill.style.transitionDelay = `${i * 30}ms`;
    });
  });

  /* ─────────────────────────────────────────
     PROJECT CARD — tilt effect on hover
  ───────────────────────────────────────── */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      card.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
      card.style.transition = 'transform 0.05s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });

  /* ─────────────────────────────────────────
     CERT CARD — glow follows cursor
  ───────────────────────────────────────── */
  document.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
    });
  });

  /* ─────────────────────────────────────────
     TYPING EFFECT — hero role line
  ───────────────────────────────────────── */
  const roleEl = document.querySelector('.hero-role');
  if (roleEl) {
    const roles = [
      'Data Analyst · Full-Stack Developer · AI Practitioner',
      'CompTIA Data+ Certified',
      'UCF Coding Boot Camp Graduate',
      'AI-Native Workflow Expert',
    ];
    let roleIdx = 0;
    let charIdx = roles[0].length; // start fully typed
    let deleting = false;
    let typingTimeout;

    function typeRole() {
      const current = roles[roleIdx];
      if (deleting) {
        charIdx--;
        roleEl.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          roleIdx  = (roleIdx + 1) % roles.length;
          typingTimeout = setTimeout(typeRole, 400);
          return;
        }
        typingTimeout = setTimeout(typeRole, 28);
      } else {
        charIdx++;
        roleEl.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          typingTimeout = setTimeout(() => {
            deleting = true;
            typeRole();
          }, 2800);
          return;
        }
        typingTimeout = setTimeout(typeRole, 48);
      }
    }

    // Start the cycling after initial text is shown
    setTimeout(() => {
      deleting = true;
      typeRole();
    }, 3000);
  }

  /* ─────────────────────────────────────────
     SECTION LINE DECORATIONS
     (subtle animated border on section tags)
  ───────────────────────────────────────── */
  document.querySelectorAll('.section-tag').forEach(tag => {
    tag.insertAdjacentHTML('afterend', '<div class="section-tag-line" style="width:0;height:1px;background:var(--red);opacity:0.4;margin-bottom:24px;transition:width 0.8s ease;"></div>');
  });

  const tagLineObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const line = entry.target.nextElementSibling;
        if (line && line.classList.contains('section-tag-line')) {
          setTimeout(() => { line.style.width = '48px'; }, 200);
        }
        tagLineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.section-tag').forEach(tag => tagLineObserver.observe(tag));

  /* ─────────────────────────────────────────
     FOOTER YEAR (auto-update)
  ───────────────────────────────────────── */
  const footerCopy = document.querySelector('.footer-copy');
  if (footerCopy) {
    footerCopy.textContent = footerCopy.textContent.replace('2025', new Date().getFullYear());
  }

});
