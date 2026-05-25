/**
 * NSK Groups Website Core JavaScript Logic
 * Contains: SPA Router, 3D Canvas Starfield, Inertial Smooth Scroll, 
 * 3D Card Tilt, Count-Up Stats, Animated SVG Diagram, Custom Cursor, Redacted Text Scrambler
 */

// Global Variables
let currentY = 0;
let targetY = 0;
const scrollEase = 0.08; // Physics easing constant

let isStarfieldActive = false;
let starfieldCanvas = null;
let starfieldCtx = null;
let stars = [];

// ==========================================================================
// 1. SPA ROUTER & VIEW MANAGEMENT
// ==========================================================================
function initRouter() {
  window.addEventListener('hashchange', handleRouting);
  // Initial routing on page load
  handleRouting();
}

function handleRouting() {
  const rawHash = window.location.hash || '#home';
  // Split hash and query parameters
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
    // Fade out current page
    if (currentView) {
      currentView.style.opacity = '0';
      setTimeout(() => {
        currentView.classList.remove('active');
        targetView.classList.add('active');
        
        // Instantly reset scroll to top before fade-in
        window.scrollTo(0, 0);
        currentY = 0;
        targetY = 0;
        
        const content = document.getElementById('smooth-scroll-content');
        if (content && window.innerWidth > 1024) {
          content.style.transform = `translate3d(0, 0, 0)`;
        }
        
        // Recalculate scrolling viewport height
        updateScrollHeight();
        
        // Smooth fade-in
        setTimeout(() => {
          targetView.style.opacity = '1';
          checkReveal();
        }, 50);
        
        handleQueryParams(queryString);
      }, 400); // Matches CSS opacity transition duration
    } else {
      // First load, no current view to fade out
      targetView.classList.add('active');
      targetView.style.opacity = '1';
      updateScrollHeight();
      checkReveal();
      handleQueryParams(queryString);
    }
  } else {
    // Already on the same page, but query parameters might have changed
    handleQueryParams(queryString);
  }
  
  updateNavigationState(hash);
  
  // Starfield canvas should only render on the home page hero section
  if (hash === '#home') {
    if (!isStarfieldActive) {
      isStarfieldActive = true;
      animateStarfield();
    }
  } else {
    isStarfieldActive = false;
  }
}

function handleQueryParams(queryString) {
  if (!queryString) return;
  const params = new URLSearchParams(queryString);
  const subject = params.get('subject');
  if (subject) {
    const selectEl = document.getElementById('form-subject');
    if (selectEl) {
      selectEl.value = subject;
    }
  }
}

function updateNavigationState(activeHash) {
  const desktopLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  
  desktopLinks.forEach(link => {
    if (link.getAttribute('href') === activeHash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  mobileLinks.forEach(link => {
    if (link.getAttribute('href') === activeHash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ==========================================================================
// 2. PHYSICS SMOOTH SCROLL (INERTIAL SCROLL)
// ==========================================================================
function initSmoothScroll() {
  // Capture native window scroll events to update target scroll coordinates
  window.addEventListener('scroll', () => {
    targetY = window.scrollY;
    
    // Also trigger scroll-fade reveal checks on scroll
    checkReveal();
    
    // Hide/show navigation logic based on scrolling vector
    handleNavbarVisibility();
  });
  
  // Start the render loop for interpolating positions
  animateScrollLoop();
  
  // Keep scrolling bounds correct on resize
  window.addEventListener('resize', updateScrollHeight);
  // Wait for images/assets to finish loading to get accurate height
  window.addEventListener('load', updateScrollHeight);
}

function updateScrollHeight() {
  const content = document.getElementById('smooth-scroll-content');
  if (!content) return;
  
  if (window.innerWidth > 1024) {
    // Set the body height to match the translated content height to preserve the scrollbar
    document.body.style.height = `${content.getBoundingClientRect().height}px`;
  } else {
    // Reset to normal layout for mobile devices
    document.body.style.height = 'auto';
    content.style.transform = 'none';
  }
}

function animateScrollLoop() {
  if (window.innerWidth > 1024) {
    const content = document.getElementById('smooth-scroll-content');
    if (content) {
      // Lerp (Linear Interpolate) scroll coordinate
      currentY += (targetY - currentY) * scrollEase;
      
      // Keep calculation within bounds
      if (Math.abs(targetY - currentY) < 0.05) {
        currentY = targetY;
      }
      
      // Apply translation to container
      content.style.transform = `translate3d(0, ${-currentY}px, 0)`;
    }
  }
  requestAnimationFrame(animateScrollLoop);
}

// Navbar hide/show behaviors
let prevScrollY = 0;
const navbar = document.getElementById('navbar');

function handleNavbarVisibility() {
  const currentScroll = window.scrollY;
  
  if (currentScroll > prevScrollY && currentScroll > 100) {
    // Scrolling down: Hide Navbar
    navbar.classList.add('nav-hidden');
  } else {
    // Scrolling up: Show Navbar
    navbar.classList.remove('nav-hidden');
  }
  prevScrollY = currentScroll;
}

// Scroll down indicator click event
const scrollArrow = document.getElementById('scroll-indicator-arrow');
if (scrollArrow) {
  scrollArrow.addEventListener('click', () => {
    const targetScroll = window.innerHeight;
    if (window.innerWidth > 1024) {
      targetY = targetScroll;
    }
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  });
}

// ==========================================================================
// 3. 3D STARFIELD BACKGROUND (CANVAS INTERACTION)
// ==========================================================================
function initStarfield() {
  starfieldCanvas = document.getElementById('starfield');
  if (!starfieldCanvas) return;
  
  starfieldCtx = starfieldCanvas.getContext('2d');
  
  resizeStarfield();
  window.addEventListener('resize', resizeStarfield);
  
  // Populate stars list (3D coords)
  stars = [];
  const starCount = 180;
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 1000,
      y: (Math.random() - 0.5) * 1000,
      z: Math.random() * 1000
    });
  }
}

function resizeStarfield() {
  if (!starfieldCanvas) return;
  starfieldCanvas.width = starfieldCanvas.parentElement.clientWidth;
  starfieldCanvas.height = starfieldCanvas.parentElement.clientHeight;
}

function animateStarfield() {
  if (!isStarfieldActive || !starfieldCtx || !starfieldCanvas) return;
  
  // Semi-transparent overlay creates particle trail effects
  starfieldCtx.fillStyle = 'rgba(4, 6, 15, 0.15)';
  starfieldCtx.fillRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
  
  const cx = starfieldCanvas.width / 2;
  const cy = starfieldCanvas.height / 2;
  const focus = 300;
  
  // Angle cosines and sines for slow rotation
  const cosY = Math.cos(0.0008);
  const sinY = Math.sin(0.0008);
  const cosX = Math.cos(0.0004);
  const sinX = Math.sin(0.0004);
  
  stars.forEach(star => {
    // 3D rotation along Y axis
    let x1 = star.x * cosY - star.z * sinY;
    let z1 = star.z * cosY + star.x * sinY;
    
    // 3D rotation along X axis
    let y2 = star.y * cosX - z1 * sinX;
    let z2 = z1 * cosX + star.y * sinX;
    
    star.x = x1;
    star.y = y2;
    star.z = z2;
    
    // Projection depth calculation
    let pz = star.z + 500;
    if (pz <= 0) pz += 1000;
    if (pz > 1000) pz -= 1000;
    
    const sx = (star.x * focus) / pz + cx;
    const sy = (star.y * focus) / pz + cy;
    
    // Render point inside boundaries
    if (sx >= 0 && sx < starfieldCanvas.width && sy >= 0 && sy < starfieldCanvas.height) {
      const size = (1 - pz / 1000) * 2;
      const alpha = (1 - pz / 1000) * 0.8;
      
      starfieldCtx.fillStyle = `rgba(225, 245, 238, ${alpha})`;
      starfieldCtx.fillRect(sx, sy, size, size);
    }
  });
  
  requestAnimationFrame(animateStarfield);
}

// ==========================================================================
// 4. 3D CARD TILT EFFECT & GLOW OVERLAY
// ==========================================================================
function initCardTilt() {
  const cards = document.querySelectorAll('.interactive-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return; // Disable tilt on touch devices
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Center offsets
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      
      // Calculate rotation limits (up to 12 degrees tilt)
      const rx = -(dy / cy) * 10;
      const ry = (dx / cx) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Update light glow element position
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      // Smooth reset back to flat coordinates
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// ==========================================================================
// 5. COUNT-UP STATS ANIMATION
// ==========================================================================
function initStatsCounter() {
  const statsSection = document.getElementById('home-stats-bar');
  const statNumbers = document.querySelectorAll('.stat-number');
  
  if (!statsSection) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'), 10);
          const duration = 2000; // Count-up over 2 seconds
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
        // Run count-up once
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(statsSection);
}

// ==========================================================================
// 6. CONNECTING LINES DIAGRAM SVG PATHS DRAWING
// ==========================================================================
function initStructureDiagram() {
  const structureSection = document.querySelector('.structure-diagram-container');
  const paths = document.querySelectorAll('.drawing-path');
  const childBoxes = document.querySelectorAll('.child-box');
  
  if (!structureSection) return;
  
  // Set starting values to hide items
  paths.forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
  });
  
  childBoxes.forEach(box => {
    box.style.opacity = '0';
    box.style.transform = 'translateY(15px)';
    box.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Trigger SVG drawing lines
        paths.forEach(path => {
          path.classList.add('draw');
        });
        
        // Stagger child box entrances
        childBoxes.forEach((box, index) => {
          setTimeout(() => {
            box.style.opacity = '1';
            box.style.transform = 'translateY(0)';
          }, 400 + (index * 250));
        });
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  
  observer.observe(structureSection);
}

// ==========================================================================
// 7. CUSTOM CURSOR TRAILING MOUSE
// ==========================================================================
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  
  if (!cursor || !cursorDot) return;
  
  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Instantly translate inner dot
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });
  
  function updateCursorFrame() {
    // Lerped trailing ring coordinates
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * 0.12;
    cursorY += dy * 0.12;
    
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    
    requestAnimationFrame(updateCursorFrame);
  }
  updateCursorFrame();
  
  // Custom cursor hover scaling using delegation
  window.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, input, select, textarea, .interactive-card, .redact-hover');
    if (target) {
      cursor.style.width = '44px';
      cursor.style.height = '44px';
      cursor.style.backgroundColor = 'rgba(29, 158, 117, 0.06)';
      cursor.style.borderColor = 'var(--primary)';
    } else {
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.backgroundColor = 'transparent';
      cursor.style.borderColor = 'var(--primary)';
    }
  });
  
  // Make cursor invisible on leave
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
  });
}

// ==========================================================================
// 8. SCROLL REVEAL (FADE-UP ON SCROLL)
// ==========================================================================
function checkReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const elemTop = rect.top;
    
    // Reveal when element enters bounds (bottom 10% of window height)
    const triggerHeight = window.innerHeight * 0.92;
    
    if (elemTop < triggerHeight) {
      el.classList.add('revealed');
    }
  });
}

// ==========================================================================
// 9. CLASSIFIED REDACTED TEXT SCRAMBLER
// ==========================================================================
function initTextScrambler() {
  const redactElements = document.querySelectorAll('.redact-hover');
  
  redactElements.forEach(el => {
    const originalText = el.getAttribute('data-original') || el.innerText;
    let interval = null;
    
    el.addEventListener('mouseenter', () => {
      let iteration = 0;
      clearInterval(interval);
      
      interval = setInterval(() => {
        el.innerText = originalText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            // Classified random glyphs pool
            const glyphs = "X#@$%&*0123456789[]_!?";
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join("");
        
        if (iteration >= originalText.length) {
          clearInterval(interval);
        }
        iteration += 1 / 3;
      }, 25);
    });
    
    el.addEventListener('mouseleave', () => {
      clearInterval(interval);
      el.innerText = originalText;
    });
  });
}

// ==========================================================================
// 10. MOBILE HAMBURGER AND OVERLAY LOGIC
// ==========================================================================
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const overlay = document.getElementById('mobile-menu-overlay');
  const links = document.querySelectorAll('.mobile-nav-link, #mob-schedule-btn');
  
  if (!toggleBtn || !overlay) return;
  
  toggleBtn.addEventListener('click', () => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
  });
  
  function closeOverlay() {
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Resume scrolling
  }
  
  if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
  links.forEach(link => link.addEventListener('click', closeOverlay));
}

// ==========================================================================
// 11. FORM HANDLING & VALIDATION
// ==========================================================================
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
    
    // Simulate API request transmit
    setTimeout(() => {
      submitBtn.innerText = "Submit Inquiry";
      submitBtn.disabled = false;
      
      successMsg.style.display = 'block';
      errorMsg.style.display = 'none';
      contactForm.reset();
      
      // Clear alert after 5 seconds
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 5000);
      
      // Update wrapper dimensions
      updateScrollHeight();
    }, 1500);
  });
}

// Set up external links behavior globally (opens in new tab)
function initExternalLinks() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

// ==========================================================================
// INITIALIZATION CALLS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initExternalLinks();
  initCustomCursor();
  initMobileMenu();
  initRouter();
  initSmoothScroll();
  initStarfield();
  initCardTilt();
  initStatsCounter();
  initStructureDiagram();
  initTextScrambler();
  initFormHandling();
});
