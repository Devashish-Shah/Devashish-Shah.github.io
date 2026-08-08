/* ==========================================================================
   Devashish Shah — personal site
   One script for every page. Nothing here is required for the content to be
   readable: with JavaScript off you still get all text, images and links.

   1. Theme (light / dark) toggle
   2. Active nav link
   3. Mobile nav
   4. Gallery lightbox
   5. Footer year
   ========================================================================== */

(function () {
  "use strict";

  /* -- 1. Theme --------------------------------------------------------- */
  // The inline snippet in each page's <head> sets the theme before first paint
  // so there is no flash of the wrong colours. This just wires up the button.

  var STORAGE_KEY = "ds-theme";

  function store(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* private mode */ }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }

  function initTheme() {
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");

    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      store(next);
    });
  }

  /* -- 2. Active nav link ----------------------------------------------- */
  // The nav markup is identical on every page; this marks the current one so
  // you never have to hand-edit a class when adding a page.

  function initActiveLink() {
    var here = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a").forEach(function (a) {
      var target = a.getAttribute("href");
      if (target === here || (here === "" && target === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* -- 3. Mobile nav ----------------------------------------------------- */

  function initMobileNav() {
    var btn = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("primary-nav");
    if (!btn || !nav) return;

    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });

    // Close when a link is followed or the viewport grows past the breakpoint.
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) {
        nav.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* -- 4. Lightbox ------------------------------------------------------- */
  // Works on any page containing .gallery buttons. Each button holds an <img>
  // and an optional .cap element used as the caption.

  function initLightbox() {
    var gallery = document.querySelector("[data-gallery]");
    var box = document.getElementById("lightbox");
    if (!gallery || !box) return;

    var items = Array.prototype.slice.call(gallery.querySelectorAll("button"));
    if (!items.length) return;

    var imgEl = box.querySelector("[data-lb-img]");
    var capEl = box.querySelector("[data-lb-cap]");
    var numEl = box.querySelector("[data-lb-count]");
    var index = 0;
    var lastFocused = null;

    function show(i) {
      index = (i + items.length) % items.length;
      var thumb = items[index].querySelector("img");
      var cap = items[index].querySelector(".cap");
      // data-full lets you point the lightbox at a larger file than the thumb.
      imgEl.src = thumb.getAttribute("data-full") || thumb.src;
      imgEl.alt = thumb.alt || "";
      capEl.textContent = cap ? cap.textContent.trim() : "";
      numEl.textContent = (index + 1) + " / " + items.length;
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      box.classList.add("is-open");
      box.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      box.querySelector(".lb-close").focus();
    }

    function close() {
      box.classList.remove("is-open");
      box.setAttribute("hidden", "");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    items.forEach(function (btn, i) {
      btn.addEventListener("click", function () { open(i); });
    });

    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });

    // Click the backdrop (but not the image) to dismiss.
    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  /* -- 5. Footer year ---------------------------------------------------- */

  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* -- boot -------------------------------------------------------------- */

  function init() {
    initTheme();
    initActiveLink();
    initMobileNav();
    initLightbox();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
