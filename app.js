/**
 * Prathap A Portfolio - App Interactions & Logic
 ========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  initCustomCursor();
  initThemeManager();
  initMobileMenu();
  initScrollProgressBar();
  initScrollReveal();
  initInteractiveTilt();
  initFilters();
  initContactForm();
});

/**
 * 1. Custom Mouse Follower
 */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');
  
  if (!cursor || !follower) return;

  // Hide cursor on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate cursor position
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Smooth lagging follower
  function updateFollower() {
    // Lerp (Linear Interpolation) formula: Current + (Target - Current) * Ease
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    
    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  // Hover states
  const hoverables = document.querySelectorAll('a, button, input, textarea, .projects-filter-btn, .skills-tab-btn, .social-icon');
  
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering-link');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering-link');
    });
  });
}

/**
 * 2. Theme Manager (Dark / Light Mode)
 */
function initThemeManager() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  toggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Trigger cursor size flash on toggle
    const follower = document.getElementById('custom-cursor-follower');
    if (follower) {
      follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
      setTimeout(() => {
        follower.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 300);
    }
  });
}

/**
 * 3. Mobile Navigation Menu
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  
  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu when clicking links
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Close menu when resizing past mobile threshold
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
}

/**
 * 4. Scroll Progress Indicator & Sticky Header
 */
function initScrollProgressBar() {
  const progressBar = document.getElementById('scroll-progress-bar');
  const header = document.getElementById('header');
  if (!progressBar) return;

  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    // Progress calculation
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${scrollPercent}%`;

    // Header hiding/showing on scroll direction
    if (header) {
      if (window.scrollY > 100) {
        header.querySelector('.navbar').style.padding = '10px 24px';
        header.style.top = '10px';
        
        if (window.scrollY > lastScrollY) {
          // Scrolling down - hide header
          header.style.transform = 'translateY(-120%)';
        } else {
          // Scrolling up - show header
          header.style.transform = 'translateY(0)';
        }
      } else {
        header.querySelector('.navbar').style.padding = '16px 32px';
        header.style.top = '24px';
        header.style.transform = 'translateY(0)';
      }
    }
    
    lastScrollY = window.scrollY;
  }, { passive: true });
}

/**
 * 5. Scroll Reveal Observer
 */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // If it's a section containing stagger-items, animate them in sequence
        const staggers = entry.target.querySelectorAll('.stagger-item');
        if (staggers.length > 0) {
          staggers.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, index * 80);
          });
        }
        
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  };

  const observer = new IntersectionObserver(revealCallback, {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
  
  // Observe container sections for list item staggering
  const grids = document.querySelectorAll('.skills-grid, .projects-grid');
  grids.forEach(grid => observer.observe(grid));
}

/**
 * 6. Interactive 3D Card Tilt Effect
 */
function initInteractiveTilt() {
  const card = document.getElementById('tilt-card');
  if (!card) return;

  // Don't activate on touch screens
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const cardRect = card.getBoundingClientRect();
  const cardWidth = cardRect.width;
  const cardHeight = cardRect.height;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - cardWidth / 2;
    const y = e.clientY - rect.top - cardHeight / 2;

    // Convert mouse movement to rotations
    const rotateX = -(y / (cardHeight / 2)) * 12; // Max 12deg
    const rotateY = (x / (cardWidth / 2)) * 12;

    card.style.transform = `translate(-50%, -50%) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translate(-50%, -50%) rotateX(0deg) rotateY(0deg) scale(1)';
  });
}

/**
 * 7. Category Filters (Skills & Projects)
 */
function initFilters() {
  // Skills Filtering
  const skillTabs = document.querySelectorAll('.skills-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle button states
      skillTabs.forEach(btn => btn.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Projects Filtering
  const projectFilters = document.querySelectorAll('.projects-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  projectFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle button states
      projectFilters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        // Match logic
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.9)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 350);
        }
      });
    });
  });
}

/**
 * 8. Contact Form Management
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  if (!form || !submitBtn || !toast) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Extract inputs
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Construct WhatsApp message
    const formattedText = `Hi Prathap,\n\nMy name is *${name}* (${email}).\n\n*Subject:* ${subject}\n\n*Message:* ${message}`;
    const whatsappUrl = `https://wa.me/918870737352?text=${encodeURIComponent(formattedText)}`;

    // Disable button to prevent double click
    submitBtn.disabled = true;
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      Redirecting...
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"></circle>
        <path d="M4 12a8 8 0 0 1 8-8"></path>
      </svg>
    `;

    // Local keyframes injection for spinner
    if (!document.getElementById('spin-keyframes')) {
      const style = document.createElement('style');
      style.id = 'spin-keyframes';
      style.textContent = '@keyframes spin { 100% { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    // Simulate redirection delay
    setTimeout(() => {
      // Open WhatsApp chat in a new tab
      window.open(whatsappUrl, '_blank');

      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;

      // Show toast alert
      toastMessage.textContent = 'Redirecting to WhatsApp...';
      toast.classList.add('show');
      
      // Clear form inputs
      form.reset();

      // Clear toast after 4s
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
      
    }, 1200);
  });
}
