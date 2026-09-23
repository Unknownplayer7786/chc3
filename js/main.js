/* Care Homoeo Clinic: site interactions */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  root.classList.add("js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = doc.querySelector(".site-header");
  var menuToggle = doc.querySelector(".menu-toggle");
  var mobileMenu = doc.getElementById("mobile-menu");
  var actionBar = doc.querySelector(".action-bar");
  var toastEl = doc.getElementById("toast");
  var toastTimer = null;

  /* ---------- Footer year ---------- */
  var yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Toast ---------- */
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  /* ---------- Mobile menu ---------- */
  var menuCloseTimer = null;

  function openMenu() {
    if (!mobileMenu || !menuToggle) return;
    window.clearTimeout(menuCloseTimer);
    mobileMenu.hidden = false;
    // Force reflow so the transition runs
    void mobileMenu.offsetWidth;
    mobileMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    doc.body.classList.add("menu-open");
    var firstLink = mobileMenu.querySelector("a");
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  function closeMenu(returnFocus) {
    if (!mobileMenu || !menuToggle || mobileMenu.hidden) return;
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    doc.body.classList.remove("menu-open");
    menuCloseTimer = window.setTimeout(function () {
      mobileMenu.hidden = true;
    }, prefersReducedMotion ? 0 : 400);
    if (returnFocus) menuToggle.focus({ preventScroll: true });
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      if (menuToggle.getAttribute("aria-expanded") === "true") closeMenu(false);
      else openMenu();
    });

    mobileMenu.addEventListener("click", function (e) {
      var link = e.target.closest("a");
      if (link) closeMenu(false);
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        closeMenu(true);
      }
      // Keep keyboard focus inside the open menu
      if (e.key === "Tab" && menuToggle.getAttribute("aria-expanded") === "true") {
        var focusables = [menuToggle].concat(Array.prototype.slice.call(mobileMenu.querySelectorAll("a, button")));
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Close the menu if the viewport becomes desktop-sized
    var desktopMq = window.matchMedia("(min-width: 961px)");
    var onMq = function (mq) { if (mq.matches) closeMenu(false); };
    if (desktopMq.addEventListener) desktopMq.addEventListener("change", onMq);
    else if (desktopMq.addListener) desktopMq.addListener(onMq);
  }

  /* ---------- Header and action bar on scroll ---------- */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (actionBar) {
      var nearBottom = window.innerHeight + y >= doc.documentElement.scrollHeight - 40;
      actionBar.classList.toggle("is-visible", y > 480 && !nearBottom);
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Highlight the current section in the nav ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.primary-nav a[href^="#"]'));
  if ("IntersectionObserver" in window && navLinks.length) {
    var linkFor = {};
    navLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(linkFor).forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = doc.querySelectorAll(".reveal");
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    // Stagger siblings slightly
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      var siblings = parent ? parent.querySelectorAll(":scope > .reveal") : [];
      var idx = Array.prototype.indexOf.call(siblings, el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 80, 320) + "ms";
      revealObs.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Count-up numbers ---------- */
  var counters = doc.querySelectorAll(".count[data-count]");
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = String(target);
    }
    window.requestAnimationFrame(step);
  }
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObs.observe(el); });
  }

  /* ---------- Treatment filters ---------- */
  var filters = Array.prototype.slice.call(doc.querySelectorAll(".filter"));
  var cards = Array.prototype.slice.call(doc.querySelectorAll(".t-card"));
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      cards.forEach(function (card) {
        var show = cat === "all" || card.getAttribute("data-cat") === cat;
        card.hidden = !show;
        card.classList.remove("is-entering");
        if (show && !prefersReducedMotion) {
          void card.offsetWidth;
          card.classList.add("is-entering");
        }
      });
    });
  });

  /* ---------- FAQ: one open at a time (fallback for browsers without <details name>) ---------- */
  var faqs = Array.prototype.slice.call(doc.querySelectorAll("details.faq"));
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d && o.open) o.open = false; });
    });
  });

  /* ---------- Copy to clipboard ---------- */
  function fallbackCopy(text) {
    var ta = doc.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    doc.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = doc.execCommand("copy"); } catch (err) { ok = false; }
    doc.body.removeChild(ta);
    return ok;
  }
  doc.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () { toast("Copied to clipboard"); };
      var fail = function () { toast(fallbackCopy(text) ? "Copied to clipboard" : "Couldn't copy. Please copy it manually."); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fail);
      } else {
        fail();
      }
    });
  });

  /* ---------- Map: load the Google Maps iframe only when asked ---------- */
  var mapBtn = doc.getElementById("map-load");
  var mapWrap = doc.getElementById("map");
  if (mapBtn && mapWrap) {
    mapBtn.addEventListener("click", function () {
      var iframe = doc.createElement("iframe");
      iframe.src = "https://maps.google.com/maps?q=18.480146,73.889685&z=16&output=embed";
      iframe.title = "Map showing Care Homoeo Clinic, Fakhri Hills, Kondhwa, Pune";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.setAttribute("allowfullscreen", "");
      var facade = doc.getElementById("map-facade");
      mapWrap.appendChild(iframe);
      iframe.addEventListener("load", function () {
        if (facade && facade.parentNode) facade.parentNode.removeChild(facade);
      });
      mapBtn.disabled = true;
      mapBtn.textContent = "Loading map…";
    });
  }
})();
