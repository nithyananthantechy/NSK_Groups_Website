/**
 * NSK Groups — Corporate Site Interactions
 * Clean, lightweight, accessible JavaScript without heavy animations or canvas scripts.
 */

(function () {
  'use strict';

  // ============================================================================
  // 1. SCROLL REVEAL OBSERVER
  // ============================================================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;

    // If user prefers reduced motion, reveal all elements immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback for older browsers
      revealElements.forEach(el => el.classList.add('revealed'));
    }
  }

  // ============================================================================
  // 2. NAVBAR SCROLL BEHAVIOR
  // ============================================================================
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Add shadow when scrolled
          if (currentScrollY > 10) {
            navbar.classList.add('nav-scrolled');
          } else {
            navbar.classList.remove('nav-scrolled');
          }

          // Hide navbar when scrolling down fast, show on scroll up
          if (currentScrollY > 200 && currentScrollY > lastScrollY + 10) {
            navbar.classList.add('nav-hidden');
          } else if (currentScrollY < lastScrollY - 5) {
            navbar.classList.remove('nav-hidden');
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================================================
  // 3. MOBILE MENU OVERLAY
  // ============================================================================
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');
    const overlay = document.getElementById('mobile-menu-overlay');
    const menuLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !overlay) return;

    function openMenu() {
      overlay.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeMenu() {
      overlay.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    menuLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // ============================================================================
  // 4. ACTIVE NAVIGATION LINK STATE
  // ============================================================================
  function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const setLinksActive = (selector) => {
      document.querySelectorAll(selector).forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const isCurrent = (href === currentPath) || 
                          (currentPath === '' && href === 'index.html') ||
                          (href.endsWith(currentPath));

        if (isCurrent) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else if (!href.startsWith('#')) {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    };

    setLinksActive('.nav-link');
    setLinksActive('.mobile-nav-link');
  }

  // ============================================================================
  // 5. CONTACT FORM VALIDATION & HONEYPOT
  // ============================================================================
  function initContactForm() {
    const form = document.getElementById('nsk-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      // 1. Honeypot spam protection
      const honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value.trim() !== '') {
        e.preventDefault();
        return; // Bot detected, drop quietly
      }

      // 2. Validate inputs
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const subjectInput = document.getElementById('form-subject');
      const messageInput = document.getElementById('form-message');

      const errName = document.getElementById('err-name');
      const errEmail = document.getElementById('err-email');
      const errSubject = document.getElementById('err-subject');
      const errMessage = document.getElementById('err-message');
      const errAlert = document.getElementById('form-error-msg');
      const successAlert = document.getElementById('form-success-msg');

      let isValid = true;

      // Validate Name
      if (nameInput) {
        if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
          if (errName) errName.style.display = 'block';
          isValid = false;
        } else if (errName) {
          errName.style.display = 'none';
        }
      }

      // Validate Email
      if (emailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
          if (errEmail) errEmail.style.display = 'block';
          isValid = false;
        } else if (errEmail) {
          errEmail.style.display = 'none';
        }
      }

      // Validate Subject
      if (subjectInput) {
        if (!subjectInput.value) {
          if (errSubject) errSubject.style.display = 'block';
          isValid = false;
        } else if (errSubject) {
          errSubject.style.display = 'none';
        }
      }

      // Validate Message
      if (messageInput) {
        if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
          if (errMessage) errMessage.style.display = 'block';
          isValid = false;
        } else if (errMessage) {
          errMessage.style.display = 'none';
        }
      }

      if (!isValid) {
        e.preventDefault();
        if (errAlert) errAlert.style.display = 'block';
        if (successAlert) successAlert.style.display = 'none';
        return;
      }

      // Real asynchronous form submission via FormSubmit
      e.preventDefault();
      const submitBtn = document.getElementById('form-submit-button');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message →';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Message...';
      }
      if (errAlert) errAlert.style.display = 'none';
      if (successAlert) successAlert.style.display = 'none';

      const formData = {
        name: nameInput ? nameInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        phone: (document.getElementById('form-phone') || {}).value || 'Not provided',
        subject: subjectInput ? subjectInput.value : '',
        message: messageInput ? messageInput.value.trim() : '',
        _subject: 'New Business Inquiry — NSK Groups Website'
      };

      const actionUrl = form.getAttribute('action') || 'https://formsubmit.co/nithyananthan@nitechspark.site';
      const ajaxUrl = actionUrl.includes('/ajax/') ? actionUrl : actionUrl.replace('formsubmit.co/', 'formsubmit.co/ajax/');

      fetch(ajaxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
        const isSuccess = data.success === 'true' || data.success === true;
        const needsActivation = data.message && data.message.toLowerCase().includes('activ');

        if (needsActivation) {
          if (successAlert) {
            successAlert.style.backgroundColor = '#FEF3C7';
            successAlert.style.borderColor = '#FCD34D';
            successAlert.style.color = '#92400E';
            successAlert.innerHTML = '<strong>One-Time Setup Required:</strong> An activation email has been sent to <strong>nithyananthan@nitechspark.site</strong>. Please check your inbox (or Spam folder) and click the <strong>&ldquo;Activate Form&rdquo;</strong> button to begin receiving customer inquiries.';
            successAlert.style.display = 'block';
          }
        } else if (isSuccess) {
          if (successAlert) {
            successAlert.style.backgroundColor = '#DCFCE7';
            successAlert.style.borderColor = '#86EFAC';
            successAlert.style.color = '#166534';
            successAlert.textContent = '✓ Message received! We will respond to your inquiry within one business day.';
            successAlert.style.display = 'block';
          }
          form.reset();
        } else {
          if (errAlert) {
            errAlert.textContent = data.message || 'Unable to send message. Please contact us via WhatsApp or email nithyananthan@nitechspark.site.';
            errAlert.style.display = 'block';
          }
        }
      })
      .catch(error => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
        if (errAlert) {
          errAlert.textContent = 'Unable to send message. Please email nithyananthan@nitechspark.site or contact us on WhatsApp.';
          errAlert.style.display = 'block';
        }
      });
    });
  }

  // ============================================================================
  // INITIALIZATION ON DOM READY
  // ============================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initNavbarScroll();
    initMobileMenu();
    initActiveNav();
    initContactForm();
  });
})();
