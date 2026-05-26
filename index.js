/**
 * NSK Groups — 3D Holographic Data-Scape JavaScript
 * Deep space volumetric starfield (5000 particles), brain network visualization,
 * SPA router, 3D card tilt, crystal structure diagram, HUD typewriter,
 * terminal typewriter, custom cursor, text scrambler, and all interactions.
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================
let starfieldCanvas, starfieldCtx;
let brainCanvas, brainCtx;
let stars = [];
let brainNodes = [];
let brainEdges = [];
let isStarfieldActive = true;
let mouseX = 0, mouseY = 0;

// ============================================================================
// 1. DEEP SPACE VOLUMETRIC STARFIELD — 5000 PARTICLES
// ============================================================================
function initStarfield() {
  starfieldCanvas = document.getElementById('starfield-canvas');
  if (!starfieldCanvas) return;
  
  starfieldCtx = starfieldCanvas.getContext('2d');
  resizeStarfield();
  window.addEventListener('resize', resizeStarfield);
  
  // Device-adaptive star count
  const isMobile = window.innerWidth < 768;
  const starCount = isMobile ? 1500 : 5000;
  
  // Generate deep space stars across a massive volume
  stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 3000,
      y: (Math.random() - 0.5) * 3000,
      z: Math.random() * 3000,
      // Color variation: white, green-tinted, blue-tinted
      colorType: Math.random() < 0.6 ? 0 : (Math.random() < 0.5 ? 1 : 2),
      // Size variation
      baseSize: Math.random() * 1.5 + 0.3,
      // Twinkle phase
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2
    });
  }
  
  animateStarfield();
}

function resizeStarfield() {
  if (!starfieldCanvas) return;
  starfieldCanvas.width = window.innerWidth;
  starfieldCanvas.height = window.innerHeight;
}

let starfieldTime = 0;

function animateStarfield() {
  if (!starfieldCtx || !starfieldCanvas) return;
  
  const w = starfieldCanvas.width;
  const h = starfieldCanvas.height;
  
  // Deep space background with subtle trail
  starfieldCtx.fillStyle = 'rgba(2, 4, 8, 0.15)';
  starfieldCtx.fillRect(0, 0, w, h);
  
  const cx = w / 2;
  const cy = h / 2;
  const focus = 500;
  
  starfieldTime += 0.016;
  
  stars.forEach(star => {
    // Slow forward drift through space
    star.z -= 0.3;
    
    // Recycle stars
    if (star.z <= 0) {
      star.x = (Math.random() - 0.5) * 3000;
      star.y = (Math.random() - 0.5) * 3000;
      star.z = 3000;
    }
    
    // 3D to 2D projection
    const sx = (star.x * focus) / star.z + cx;
    const sy = (star.y * focus) / star.z + cy;
    
    if (sx >= -10 && sx < w + 10 && sy >= -10 && sy < h + 10) {
      const depthRatio = 1 - star.z / 3000;
      const twinkle = Math.sin(starfieldTime * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.3 + 0.7;
      const size = star.baseSize * depthRatio * 2.5 * twinkle;
      const alpha = depthRatio * 0.9 * twinkle;
      
      let r, g, b;
      if (star.colorType === 0) {
        // White/bright stars
        r = 225; g = 245; b = 238;
      } else if (star.colorType === 1) {
        // Green-tinted stars (crystal theme)
        r = 29 + depthRatio * 80; g = 158 + depthRatio * 60; b = 117 + depthRatio * 40;
      } else {
        // Blue-tinted stars
        r = 55 + depthRatio * 60; g = 138 + depthRatio * 40; b = 221;
      }
      
      starfieldCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      starfieldCtx.beginPath();
      starfieldCtx.arc(sx, sy, Math.max(0.2, size), 0, Math.PI * 2);
      starfieldCtx.fill();
      
      // Add glow to close bright stars
      if (depthRatio > 0.8 && size > 1.5) {
        starfieldCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`;
        starfieldCtx.beginPath();
        starfieldCtx.arc(sx, sy, size * 3, 0, Math.PI * 2);
        starfieldCtx.fill();
      }
    }
  });
  
  requestAnimationFrame(animateStarfield);
}

// ============================================================================
// 2. BRAIN NETWORK VISUALIZATION
// ============================================================================
function initBrainNetwork() {
  brainCanvas = document.getElementById('brain-canvas');
  if (!brainCanvas) return;
  
  brainCtx = brainCanvas.getContext('2d');
  
  const panel = brainCanvas.parentElement;
  brainCanvas.width = panel.clientWidth;
  brainCanvas.height = panel.clientHeight;
  
  const w = brainCanvas.width;
  const h = brainCanvas.height;
  
  // Generate brain-like neural network nodes
  const nodeCount = 24;
  brainNodes = [];
  
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const radius = 30 + Math.random() * 50;
    brainNodes.push({
      x: w / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
      y: h / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 20,
      size: 2 + Math.random() * 3,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03
    });
  }
  
  // Generate edges (connections)
  brainEdges = [];
  for (let i = 0; i < brainNodes.length; i++) {
    for (let j = i + 1; j < brainNodes.length; j++) {
      const dx = brainNodes[i].x - brainNodes[j].x;
      const dy = brainNodes[i].y - brainNodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        brainEdges.push({ from: i, to: j, dist });
      }
    }
  }
  
  animateBrainNetwork();
}

let brainTime = 0;

function animateBrainNetwork() {
  if (!brainCtx || !brainCanvas) return;
  
  const w = brainCanvas.width;
  const h = brainCanvas.height;
  
  brainCtx.clearRect(0, 0, w, h);
  brainTime += 0.016;
  
  // Draw edges
  brainEdges.forEach(edge => {
    const a = brainNodes[edge.from];
    const b = brainNodes[edge.to];
    const alpha = (1 - edge.dist / 80) * 0.3;
    const pulse = Math.sin(brainTime * 2 + edge.from) * 0.1 + 0.2;
    
    brainCtx.strokeStyle = `rgba(29, 158, 117, ${alpha + pulse})`;
    brainCtx.lineWidth = 0.8;
    brainCtx.beginPath();
    brainCtx.moveTo(a.x, a.y);
    brainCtx.lineTo(b.x, b.y);
    brainCtx.stroke();
  });
  
  // Draw nodes
  brainNodes.forEach(node => {
    node.pulse += node.pulseSpeed;
    const pulseFactor = Math.sin(node.pulse) * 0.4 + 0.6;
    
    // Glow
    brainCtx.fillStyle = `rgba(29, 158, 117, ${0.1 * pulseFactor})`;
    brainCtx.beginPath();
    brainCtx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2);
    brainCtx.fill();
    
    // Core
    brainCtx.fillStyle = `rgba(34, 217, 152, ${0.6 * pulseFactor + 0.2})`;
    brainCtx.beginPath();
    brainCtx.arc(node.x, node.y, node.size * pulseFactor, 0, Math.PI * 2);
    brainCtx.fill();
  });
  
  // Traveling signal pulses along random edges
  if (brainEdges.length > 0) {
    const edgeIndex = Math.floor(brainTime * 3) % brainEdges.length;
    const edge = brainEdges[edgeIndex];
    const a = brainNodes[edge.from];
    const b = brainNodes[edge.to];
    const t = (brainTime * 2) % 1;
    const px = a.x + (b.x - a.x) * t;
    const py = a.y + (b.y - a.y) * t;
    
    brainCtx.fillStyle = 'rgba(34, 217, 152, 0.8)';
    brainCtx.beginPath();
    brainCtx.arc(px, py, 2, 0, Math.PI * 2);
    brainCtx.fill();
    
    brainCtx.fillStyle = 'rgba(34, 217, 152, 0.15)';
    brainCtx.beginPath();
    brainCtx.arc(px, py, 6, 0, Math.PI * 2);
    brainCtx.fill();
  }
  
  requestAnimationFrame(animateBrainNetwork);
}

// ============================================================================
// 3. SPA ROUTER & VIEW MANAGEMENT
// ============================================================================
function initRouter() {
  window.addEventListener('hashchange', handleRouting);
  handleRouting();
}

function handleRouting() {
  const rawHash = window.location.hash || '#home';
  const hashParts = rawHash.split('?');
  const hash = hashParts[0];
  const queryString = hashParts[1] || '';
  
  const routes = {
    '#home': 'home-view',
    '#about': 'about-view',
    '#ventures': 'ventures-view',
    '#contact': 'contact-view'
  };
  
  const targetViewId = routes[hash] || 'home-view';
  const targetView = document.getElementById(targetViewId);
  const currentView = document.querySelector('.page-view.active');
  
  if (targetView && targetView !== currentView) {
    if (currentView) {
      currentView.style.opacity = '0';
      setTimeout(() => {
        currentView.classList.remove('active');
        targetView.classList.add('active');
        
        window.scrollTo(0, 0);
        
        setTimeout(() => {
          targetView.style.opacity = '1';
          checkReveal();
        }, 50);
        
        handleQueryParams(queryString);
        
        if (hash === '#ventures') {
          setTimeout(initTerminalTypewriter, 600);
        }
      }, 400);
    } else {
      targetView.classList.add('active');
      targetView.style.opacity = '1';
      checkReveal();
      handleQueryParams(queryString);
      
      if (hash === '#ventures') {
        setTimeout(initTerminalTypewriter, 600);
      }
    }
  } else {
    handleQueryParams(queryString);
  }
  
  updateNavigationState(hash);
}

function handleQueryParams(queryString) {
  if (!queryString) return;
  const params = new URLSearchParams(queryString);
  const subject = params.get('subject');
  if (subject) {
    const selectEl = document.getElementById('form-subject');
    if (selectEl) selectEl.value = subject;
  }
}

function updateNavigationState(activeHash) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === activeHash);
  });
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === activeHash);
  });
}

// ============================================================================
// 4. NAVBAR SCROLL BEHAVIORS
// ============================================================================
let prevScrollY = 0;

function handleNavbarVisibility() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const currentScroll = window.scrollY;
  
  if (currentScroll > prevScrollY && currentScroll > 100) {
    navbar.classList.add('nav-hidden');
  } else {
    navbar.classList.remove('nav-hidden');
  }
  prevScrollY = currentScroll;
}

function handleNavScrolled() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  navbar.classList.toggle('nav-scrolled', window.scrollY > 80);
}

// ============================================================================
// 5. SCROLL REVEAL
// ============================================================================
function checkReveal() {
  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      el.classList.add('revealed');
    }
  });
}

// ============================================================================
// 6. 3D CARD TILT EFFECT
// ============================================================================
function initCardTilt() {
  document.querySelectorAll('.interactive-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      
      const rx = -(dy / cy) * 12;
      const ry = (dx / cx) * 12;
      
      card.style.transition = 'transform 0.08s ease';
      card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
      
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s ease';
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// ============================================================================
// 7. COUNT-UP STATS
// ============================================================================
function initStatsCounter() {
  const statsSection = document.getElementById('home-stats-bar');
  if (!statsSection) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-number').forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'), 10);
          const duration = 2000;
          const stepTime = 30;
          const totalSteps = duration / stepTime;
          const increment = target / totalSteps;
          let currentVal = 0;
          
          const interval = setInterval(() => {
            currentVal += increment;
            if (currentVal >= target) {
              stat.innerText = target;
              clearInterval(interval);
            } else {
              stat.innerText = Math.floor(currentVal);
            }
          }, stepTime);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(statsSection);
}

// ============================================================================
// 8. CRYSTAL STRUCTURE DIAGRAM — SVG DRAWING + REVEAL
// ============================================================================
function initStructureDiagram() {
  const crystalSection = document.querySelector('.crystal-structure');
  const paths = document.querySelectorAll('.crystal-path');
  const crystalChildren = document.querySelectorAll('.crystal-child-wrapper');
  
  if (!crystalSection) return;
  
  paths.forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        paths.forEach(path => path.classList.add('draw'));
        crystalChildren.forEach((child, index) => {
          setTimeout(() => child.classList.add('visible'), 600 + (index * 300));
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  observer.observe(crystalSection);
}

// ============================================================================
// 9. CUSTOM CURSOR
// ============================================================================
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  
  if (!cursor || !cursorDot || window.innerWidth <= 1024) return;
  
  let cursorX = -100, cursorY = -100;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });
  
  function updateCursorFrame() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * 0.35;
    cursorY += dy * 0.35;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(updateCursorFrame);
  }
  updateCursorFrame();
  
  window.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, input, select, textarea, .interactive-card, .redact-hover, .hud-data-block, .brain-network-panel');
    if (target) {
      cursor.style.width = '44px';
      cursor.style.height = '44px';
      cursor.style.backgroundColor = 'rgba(29, 158, 117, 0.06)';
      cursor.style.borderColor = 'var(--primary-glow)';
    } else {
      cursor.style.width = '28px';
      cursor.style.height = '28px';
      cursor.style.backgroundColor = 'transparent';
      cursor.style.borderColor = 'var(--primary)';
    }
  });
  
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
  });
}

// ============================================================================
// 10. TEXT SCRAMBLER (REDACTED TEXT)
// ============================================================================
function initTextScrambler() {
  document.querySelectorAll('.redact-hover').forEach(el => {
    const originalText = el.getAttribute('data-original') || el.innerText;
    let interval = null;
    
    el.addEventListener('mouseenter', () => {
      let iteration = 0;
      clearInterval(interval);
      
      interval = setInterval(() => {
        el.innerText = originalText
          .split("")
          .map((letter, index) => {
            if (index < iteration) return originalText[index];
            const glyphs = "X#@$%&*0123456789[]_!?";
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join("");
        
        if (iteration >= originalText.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 25);
    });
    
    el.addEventListener('mouseleave', () => {
      clearInterval(interval);
      el.innerText = originalText;
    });
  });
}

// ============================================================================
// 11. MOBILE MENU
// ============================================================================
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const overlay = document.getElementById('mobile-menu-overlay');
  const links = document.querySelectorAll('.mobile-nav-link, #mob-schedule-btn');
  
  if (!toggleBtn || !overlay) return;
  
  toggleBtn.addEventListener('click', () => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  
  function closeOverlay() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
  links.forEach(link => link.addEventListener('click', closeOverlay));
}

// ============================================================================
// 12. FORM HANDLING
// ============================================================================
function initFormHandling() {
  const contactForm = document.getElementById('nsk-contact-form');
  const successMsg = document.getElementById('form-success-msg');
  const errorMsg = document.getElementById('form-error-msg');
  
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('form-submit-button');
    submitBtn.innerText = "Transmitting Signal...";
    submitBtn.disabled = true;
    
    setTimeout(() => {
      submitBtn.innerHTML = 'Submit Inquiry <span class="submit-arrow">→</span>';
      submitBtn.disabled = false;
      
      successMsg.style.display = 'block';
      errorMsg.style.display = 'none';
      contactForm.reset();
      
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 5000);
    }, 1500);
  });
}

// ============================================================================
// 13. HUD TYPEWRITER (Hero Sidebar)
// ============================================================================
function initHUDTypewriter() {
  const hudItems = [
    { id: 'hud-sys', text: 'ONLINE' },
    { id: 'hud-ventures', text: '3' },
    { id: 'hud-signal', text: 'ACTIVE' },
    { id: 'hud-latency', text: '12ms' }
  ];
  
  hudItems.forEach((item, index) => {
    const el = document.getElementById(item.id);
    if (!el) return;
    
    el.textContent = '';
    const delay = 800 + (index * 600);
    
    setTimeout(() => {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        charIndex++;
        el.textContent = item.text.substring(0, charIndex);
        if (charIndex >= item.text.length) clearInterval(typeInterval);
      }, 60);
    }, delay);
  });
}

// ============================================================================
// 14. TERMINAL TYPEWRITER (Ventures Page)
// ============================================================================
let terminalInitialized = false;

function initTerminalTypewriter() {
  const terminal = document.getElementById('nitechspark-terminal');
  if (!terminal || terminalInitialized) return;
  
  const lines = terminal.querySelectorAll('.terminal-line[data-text]');
  if (!lines.length) return;
  
  terminalInitialized = true;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        typeTerminalLines(lines);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(terminal);
}

function typeTerminalLines(lines) {
  let lineIndex = 0;
  
  function typeLine() {
    if (lineIndex >= lines.length) return;
    
    const line = lines[lineIndex];
    const text = line.getAttribute('data-text');
    line.textContent = '';
    line.classList.add('typed');
    
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      line.textContent = text.substring(0, charIndex);
      
      if (charIndex >= text.length) {
        clearInterval(typeInterval);
        lineIndex++;
        setTimeout(typeLine, 200);
      }
    }, 35);
  }
  
  typeLine();
}

// ============================================================================
// 15. HUD LATENCY LIVE UPDATE
// ============================================================================
function initHUDLatency() {
  const latencyEl = document.getElementById('hud-latency');
  if (!latencyEl) return;
  
  setInterval(() => {
    const latency = Math.floor(Math.random() * 20) + 5;
    latencyEl.textContent = `${latency}ms`;
  }, 3000);
}

// ============================================================================
// 16. HUD STREAM DATA ANIMATION
// ============================================================================
function initHUDStream() {
  const streamLines = document.querySelectorAll('.hud-stream-line');
  if (!streamLines.length) return;
  
  setInterval(() => {
    streamLines.forEach(line => {
      const width = Math.floor(Math.random() * 60) + 20;
      line.style.width = `${width}%`;
    });
  }, 2000);
}

// ============================================================================
// 17. SCROLL INDICATOR
// ============================================================================
function initScrollIndicator() {
  const scrollArrow = document.getElementById('scroll-indicator-arrow');
  if (!scrollArrow) return;
  
  scrollArrow.addEventListener('click', () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  });
}

// ============================================================================
// 18. EXTERNAL LINKS
// ============================================================================
function initExternalLinks() {
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

// ============================================================================
// 19. PARALLAX EFFECT ON HERO ELEMENTS
// ============================================================================
function initParallax() {
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    
    const orbits = document.querySelector('.orbit-container');
    if (orbits) {
      orbits.style.transform = `translate(calc(-50% + ${x * 15}px), calc(-50% + ${y * 15}px))`;
    }
    
    const hudSidebar = document.getElementById('hud-sidebar');
    if (hudSidebar) {
      hudSidebar.style.transform = `translateY(calc(-50% + ${y * 5}px))`;
    }
    
    const brainPanel = document.getElementById('brain-network');
    if (brainPanel) {
      brainPanel.style.transform = `translate(${x * -8}px, ${y * -8}px)`;
    }
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Core systems
  initStarfield();
  initBrainNetwork();
  initRouter();
  initCustomCursor();
  initMobileMenu();
  initExternalLinks();
  
  // Visual effects
  initCardTilt();
  initStatsCounter();
  initStructureDiagram();
  initTextScrambler();
  initParallax();
  
  // HUD systems
  initHUDTypewriter();
  initHUDLatency();
  initHUDStream();
  
  // Interactions
  initFormHandling();
  initScrollIndicator();
  
  // Scroll events
  window.addEventListener('scroll', () => {
    checkReveal();
    handleNavbarVisibility();
    handleNavScrolled();
  });
  
  // Initial states
  handleNavScrolled();
  checkReveal();
  
  // Ventures terminal
  if (window.location.hash === '#ventures') {
    setTimeout(initTerminalTypewriter, 800);
  }
});
