/**
* Template Name: Appland
* Template URL: https://bootstrapmade.com/free-bootstrap-app-landing-page-template/
* Updated: Aug 07 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();

/* ===== NeoPhone: unified tablet/iPad chat open/close helper =====
   Paste this as the chat helper in main.js (replace older helpers) or append near bottom of page.
   Idempotent: safe to paste once.
*/
(function () {
  if (window.__neophone_unified_installed) return;
  window.__neophone_unified_installed = true;

  const TABLET_BP = 1024;

  /* Reliable iPad detection (works when UA looks like desktop) */
  function isIpadDevice() {
    try {
      if (/iPad/.test(navigator.userAgent)) return true;
      if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
      if (/Macintosh/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent)) return true;
    } catch (e) {}
    return false;
  }

  /* Tablet/mobile check: iPad OR viewport thresholds */
  function isTabletOrMobile() {
    try {
      if (isIpadDevice()) return true;
      const w = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || 0;
      if (w <= 820) return true;      // mobile
      if (w <= TABLET_BP) return true; // tablet
    } catch (e) {}
    return false;
  }

  /* DOM helpers */
  function getChatRoot() {
    return document.getElementById('chat')
      || document.querySelector('[data-chat-root]')
      || document.querySelector('.chatbox')
      || document.querySelector('.chat')
      || document.querySelector('.chat-root');
  }
  function getToggle() {
    return document.getElementById('chatbotToggle') || document.querySelector('.chat-toggle-bubble');
  }

  /* Create a minimal toggle if missing */
  function ensureToggle() {
    let t = getToggle();
    if (t) return t;
    t = document.createElement('button');
    t.id = 'chatbotToggle';
    t.className = 'chat-toggle-bubble';
    t.type = 'button';
    t.setAttribute('aria-label', 'Open chat');
    t.innerText = 'Chat';
    // lightweight styling to ensure visible on most pages until CSS loads
    t.style.position = 'fixed';
    t.style.right = '18px';
    t.style.bottom = '18px';
    t.style.width = '56px';
    t.style.height = '56px';
    t.style.borderRadius = '999px';
    t.style.display = 'none';
    t.style.alignItems = 'center';
    t.style.justifyContent = 'center';
    t.style.zIndex = 99999;
    document.body.appendChild(t);
    return t;
  }

  /* Open and Close behaviors (forceful but safe) */
  function openChat() {
    const chat = getChatRoot();
    const toggle = ensureToggle();
    if (!chat) return;
    try {
      chat.classList.remove('mobile-hidden');
      chat.classList.add('mobile-open');
      chat.setAttribute('aria-hidden', 'false');
      chat.style.setProperty('display', 'block', 'important');
      chat.style.removeProperty('visibility');
      chat.style.removeProperty('opacity');
      if (toggle) toggle.style.setProperty('display', 'none', 'important');
      // optional: scroll to bottom of messages if present
      try { const thread = chat.querySelector('.thread, .messages, [role="log"]'); if (thread) thread.scrollTop = thread.scrollHeight; } catch(e){}
    } catch (e) {}
  }

  function closeChat() {
    const chat = getChatRoot();
    const toggle = ensureToggle();
    if (!chat) return;
    try {
      chat.classList.remove('mobile-open');
      chat.classList.add('mobile-hidden');
      chat.setAttribute('aria-hidden', 'true');
      // multiple style properties to beat competing CSS
      chat.style.setProperty('display', 'none', 'important');
      chat.style.setProperty('visibility', 'hidden', 'important');
      chat.style.setProperty('opacity', '0', 'important');
      chat.style.setProperty('pointer-events', 'none', 'important');
      if (toggle) setTimeout(()=>{ try { toggle.style.setProperty('display', 'flex', 'important'); } catch(e){} }, 140);
    } catch (e) {}
  }

  /* Bindings */
  function bindToggle() {
    const t = ensureToggle();
    if (t.__neo_toggle_bound) return;
    t.addEventListener('click', function (ev) {
      try { ev.preventDefault(); } catch(e) {}
      openChat();
    }, { passive: false });
    t.__neo_toggle_bound = true;
  }

  function findOpenButtons() {
    const set = new Set();
    document.querySelectorAll('.open-chat-mobile, [data-open-chat], a, button').forEach(el => set.add(el));
    // filter by text/aria containing "chat"
    return Array.from(set).filter(el => {
      const txt = (el.textContent || '').toLowerCase();
      const aria = ((el.getAttribute && el.getAttribute('aria-label')) || '').toLowerCase();
      return el.classList.contains('open-chat-mobile') || el.hasAttribute('data-open-chat') || txt.includes('chat') || aria.includes('chat');
    });
  }

  function bindOpenButtons() {
    const btns = findOpenButtons();
    btns.forEach(el => {
      if (el.__neo_open_bound) return;
      el.addEventListener('click', function (ev) {
        // only hijack on tablet/iPad
        if (!isTabletOrMobile()) return;
        try { ev.preventDefault(); } catch(e) {}
        openChat();
      }, { passive: false });
      el.__neo_open_bound = true;
    });
  }

  /* Delegated, scoped close handler (only fires for close inside chat root) */
  function installScopedClose() {
    if (document.__neo_scoped_close_installed) return;
    document.addEventListener('click', function (ev) {
      try {
        const candidate = ev.target && ev.target.closest && ev.target.closest('button, [data-close-chat], .chat-close, .btn-close, .close-chat, .chat__close');
        if (!candidate) return;
        const chat = getChatRoot();
        if (!chat) return;
        // only act if clicked close is inside the chat root
        if (!candidate.closest || !candidate.closest('#chat, .chatbox, .chat, .chat-root, [data-chat-root]')) return;
        try { ev.preventDefault(); } catch(e) {}
        // short guard to avoid race reopen
        if (window.__neophone_recentlyClosed) return;
        window.__neophone_recentlyClosed = true;
        closeChat();
        setTimeout(()=>{ window.__neophone_recentlyClosed = false; }, 800);
      } catch (e) {}
    }, { passive: false, capture: false });
    document.__neo_scoped_close_installed = true;
  }

  /* Rebind loop for dynamic content (runs a few times then stops) */
  function dynamicBindLoop() {
    bindToggle();
    bindOpenButtons();
    installScopedClose();
    let count = 0;
    const id = setInterval(function () {
      bindOpenButtons();
      bindToggle();
      count++;
      if (count > 8) clearInterval(id);
    }, 600);
  }

  /* Visibility on load/resize */
  function refreshToggleVisibility() {
    const t = getToggle();
    if (!t) return;
    if (isTabletOrMobile()) {
      // show toggle unless chat is open
      const chat = getChatRoot();
      if (chat && chat.classList.contains('mobile-open')) {
        t.style.setProperty('display', 'none', 'important');
      } else {
        t.style.setProperty('display', 'flex', 'important');
      }
    } else {
      t.style.setProperty('display', 'none', 'important');
    }
  }
  window.addEventListener('resize', function () { setTimeout(refreshToggleVisibility, 80); });

  /* Start once DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      dynamicBindLoop();
      setTimeout(refreshToggleVisibility, 260);
    });
    // also attempt after a short delay if DOMContentLoaded already fired
    setTimeout(function () { dynamicBindLoop(); refreshToggleVisibility(); }, 420);
  } else {
    dynamicBindLoop();
    setTimeout(refreshToggleVisibility, 260);
  }
})();
