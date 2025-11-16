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


/* ===== NeoPhone: Tablet/iPad chat toggle + open/close robust helper =====
   Paste once (before </body>) or into your main.js. Idempotent.
*/
(function () {
  if (window.__neophone_tablet_init) return;
  window.__neophone_tablet_init = true;

  const BP = window.__NEOPHONE_CHAT_BREAKPOINT || 1024;

  // Detect iPad reliably (works when iPad uses desktop UA)
  function isIpadDevice() {
    try {
      if (/iPad/.test(navigator.userAgent)) return true;
      // iPadOS 13+ reports MacIntel; maxTouchPoints > 1 is a reliable hint
      if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
      // Some iPads UA may contain "Macintosh" & "Mobile" – check for 'Mobile' too
      if (/Macintosh/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent)) return true;
    } catch (e) {}
    return false;
  }

  // Tablet or mobile check: width-based OR explicit iPad detection
  function isTabletOrMobile() {
    try {
      if (isIpadDevice()) return true;
      const w = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || 0;
      if (w <= 820) return true;   // mobile
      if (w <= BP) return true;    // tablet range
    } catch (e) {}
    return false;
  }

  // Utility: find the chat root with common selectors
  function getChatRoot() {
    return document.getElementById('chat')
      || document.querySelector('.chatbox')
      || document.querySelector('.chat')
      || document.querySelector('.chat-root')
      || document.querySelector('[data-chat-root]');
  }

  // ensure toggle exists
  function ensureToggle() {
    let toggle = document.getElementById('chatbotToggle') || document.querySelector('.chat-toggle-bubble');
    if (toggle) return toggle;

    toggle = document.createElement('button');
    toggle.id = 'chatbotToggle';
    toggle.className = 'chat-toggle-bubble';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open chat');
    toggle.style.display = 'none'; // CSS/media rules control visibility; JS toggles when needed
    toggle.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 5.5C3 4.12 4.12 3 5.5 3h13C19.88 3 21 4.12 21 5.5v8c0 1.38-1.12 2.5-2.5 2.5H9.7L6 20.5V16.0H5.5C4.12 16 3 14.88 3 13.5v-8z" fill="#fff" opacity="0.06"/><path d="M7 8h10M7 12h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(toggle);
    return toggle;
  }

  // Ensure a close button exists inside chat header; returns the button (or null)
  function ensureCloseBtn(chatRoot) {
    if (!chatRoot) return null;
    let closeBtn = chatRoot.querySelector('.chat-close, .close-chat, [data-close-chat]');
    if (closeBtn) return closeBtn;

    // create minimal close button if none exists
    try {
      const header = chatRoot.querySelector('.chat-head') || chatRoot;
      closeBtn = document.createElement('button');
      closeBtn.className = 'chat-close';
      closeBtn.setAttribute('aria-label', 'Close chat');
      closeBtn.title = 'Close chat';
      closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" fill="#334155"/></svg>';
      // append so it visually sits in header
      header.appendChild(closeBtn);
    } catch (e) {
      return null;
    }
    return closeBtn;
  }

  // open/close helpers (safe)
  function openChatMobile(chatRoot, toggle) {
    try {
      if (!chatRoot) return;
      chatRoot.classList.remove('mobile-hidden');
      chatRoot.classList.add('mobile-open');
      if (toggle) toggle.style.display = 'none';
      // scroll thread to bottom
      const thread = chatRoot.querySelector('.thread, .messages, [role="log"]');
      if (thread) thread.scrollTop = thread.scrollHeight;
      chatRoot.setAttribute('aria-hidden', 'false');
    } catch (e) {}
  }
  function closeChatMobile(chatRoot, toggle) {
    try {
      if (!chatRoot) return;
      chatRoot.classList.remove('mobile-open');
      setTimeout(function () {
        try {
          chatRoot.classList.add('mobile-hidden');
          if (toggle) toggle.style.display = 'flex';
          chatRoot.setAttribute('aria-hidden', 'true');
        } catch (e) {}
      }, 200);
    } catch (e) {}
  }

  // Find the site buttons that should open chat
  function findChatOpenButtons() {
    const set = new Set();
    document.querySelectorAll('.open-chat-mobile').forEach(el => set.add(el));
    document.querySelectorAll('[data-open-chat]').forEach(el => set.add(el));

    // fallback: anchors/buttons containing word 'chat' in text or aria-label
    document.querySelectorAll('a, button').forEach(el => {
      const txt = (el.textContent || '').trim().toLowerCase();
      const aria = ((el.getAttribute && el.getAttribute('aria-label')) || '').toLowerCase();
      if ((txt && txt.includes('chat')) || (aria && aria.includes('chat'))) set.add(el);
    });
    return Array.from(set);
  }

  // Bind open triggers (idempotent)
  function bindOpenTriggers(chatRoot, toggle) {
    const triggers = findChatOpenButtons();
    triggers.forEach(el => {
      if (el.__neophone_chat_bound) return;
      el.addEventListener('click', function (evt) {
        // Only hijack on tablet/iPad/mobile UX
        if (!isTabletOrMobile()) return;
        try { evt.preventDefault(); } catch (e) {}
        openChatMobile(chatRoot, toggle);
        // focus for accessibility
        try { const thread = chatRoot.querySelector('.thread, [role="log"]'); if (thread) thread.focus(); } catch (e) {}
      }, { passive: false });
      el.__neophone_chat_bound = true;
    });
  }

  // Main init - binds toggle, open triggers, and close logic
  function initChatBehavior() {
    const chat = getChatRoot();
    const toggle = ensureToggle();
    if (!chat) {
      // chat may be created later by other scripts; observe DOM and try again
      observeForChatCreation();
      return;
    }

    // ensure close exists
    const closeBtn = ensureCloseBtn(chat);

    // Bind toggle open (idempotent)
    if (!toggle.__neophone_bound_open) {
      toggle.addEventListener('pointerdown', function (ev) {
        try { ev.preventDefault(); } catch (e) {}
        openChatMobile(chat, toggle);
      }, { passive: false });
      toggle.__neophone_bound_open = true;
    }

    // Bind close using event delegation fallback (so it works even if closeBtn recreated)
    if (!document.__neophone_close_delegated) {
      document.addEventListener('click', function (ev) {
        const btn = (ev.target && ev.target.closest && ev.target.closest('.chat-close, .close-chat, [data-close-chat], .btn-close, .chat__close'));
        if (!btn) return;
        try { ev.preventDefault(); } catch (e) {}
        // guard against race: don't re-open if recently closed
        if (window.__neophone_recentlyClosed) return;
        // perform close (user intent wins; don't gate on isTabletOrMobile)
        window.__neophone_recentlyClosed = true;
        try { closeChatMobile(getChatRoot(), document.getElementById('chatbotToggle') || document.querySelector('.chat-toggle-bubble')); } catch (e) {}
        setTimeout(() => { window.__neophone_recentlyClosed = false; }, 700);
      }, { passive: false, capture: false });
      document.__neophone_close_delegated = true;
    }

    // Bind closeBtn direct (legacy) — keeps compatibility
    try {
      if (closeBtn && !closeBtn.__neophone_tablet_bound) {
        closeBtn.addEventListener('click', function (ev) {
          try { ev.preventDefault(); } catch (e) {}
          if (window.__neophone_recentlyClosed) return;
          window.__neophone_recentlyClosed = true;
          closeChatMobile(chat, toggle);
          setTimeout(() => { window.__neophone_recentlyClosed = false; }, 700);
        }, { passive: false });
        closeBtn.__neophone_tablet_bound = true;
      }
    } catch (e) {}

    // Bind open triggers (site buttons)
    bindOpenTriggers(chat, toggle);

    // Make sure toggle visibility follows device (exposed for resize handler)
    refreshToggleVisibility(chat, toggle);
  }

  // If chat may be created after load, watch the body for #chat
  function observeForChatCreation() {
    if (window.__neophone_observer_attached) return;
    const obs = new MutationObserver((records, o) => {
      const chat = getChatRoot();
      if (chat) {
        try { initChatBehavior(); } catch (e) {}
        o.disconnect();
        window.__neophone_observer_attached = false;
      }
    });
    try {
      obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
      window.__neophone_observer_attached = true;
    } catch (e) {}
  }

  // Show/hide toggle based on device
  function refreshToggleVisibility(chat, toggle) {
    try {
      if (!toggle) return;
      if (isTabletOrMobile()) {
        // If chat open, hide toggle
        if (chat && chat.classList.contains('mobile-open')) {
          toggle.style.display = 'none';
        } else {
          toggle.style.display = 'flex';
        }
      } else {
        // Desktop: hide toggle entirely
        toggle.style.display = 'none';
      }
    } catch (e) {}
  }

  // Debounced resize handler to re-evaluate
  let _rt;
  window.addEventListener('resize', function () {
    clearTimeout(_rt);
    _rt = setTimeout(function () {
      try {
        const chat = getChatRoot();
        const toggle = document.getElementById('chatbotToggle') || document.querySelector('.chat-toggle-bubble');
        refreshToggleVisibility(chat, toggle);
      } catch (e) {}
    }, 120);
  });

  // Initial run after DOM ready (idempotent)
  function startWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initChatBehavior);
      // also attempt after a brief delay in case other scripts run later
      window.setTimeout(initChatBehavior, 420);
    } else {
      initChatBehavior();
    }
  }

  startWhenReady();

})();

