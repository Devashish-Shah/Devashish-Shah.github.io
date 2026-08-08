/* ============================================================================
   main.js — the small amount of behaviour the site needs.

   WHAT IT DOES
     1. Theme        the light/dark button
     2. Active link  highlights the current page in the menu
     3. Mobile nav   the hamburger
     4. Lightbox     the full-screen image viewer on the Hobbies page
     5. Year         keeps the footer's copyright year current

   THE IMPORTANT PROPERTY: none of this is required to READ the site. With
   JavaScript switched off, every page still shows all its text, images and
   links. That is deliberate — it means a bug in this file can make the site
   slightly less convenient, but never broken.

   ONE FILE, ALL PAGES. Each part checks whether the thing it needs is on the
   page and quietly does nothing if not. That's why the lightbox code can live
   here even though only hobbies.html has a gallery.

   READING THIS IF YOU DON'T WRITE JAVASCRIPT
     function name() { … }        defines a named block of instructions
     document.querySelector('x')  finds the first element matching 'x',
                                  using the same syntax as the CSS file
     addEventListener('click', f) run f whenever this is clicked
     if (!thing) return;          "if it isn't here, stop" — this is the
                                  guard that makes each part page-agnostic
   ============================================================================ */

/* The whole file is wrapped in a function that runs itself. This keeps every
   name below private to this file, so nothing here can collide with anything
   else you might add later. The (function(){ … })() shape is the convention. */
(function () {
  "use strict";
  /* Opts into stricter error checking — mistakes throw instead of failing
     silently. Always worth having. */


  /* ==========================================================================
     1. THEME
     ==========================================================================
     Note what is NOT here: the code that sets the theme on page load. That
     lives inline in each page's <head>, because it has to run before anything
     is drawn to avoid a flash of the wrong colours. By the time this file
     loads, the theme is already applied — all that's left is the button.
     ========================================================================== */

  var STORAGE_KEY = "ds-theme";
  /* The name the choice is filed under in the browser. It must match the one
     used by the inline script in each page's <head>. If you change it, change
     it in all six places. */

  function store(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* Storage throws in private browsing and when cookies are blocked.
         Catching and ignoring means the toggle still works for that visit —
         the choice just isn't remembered next time. Better than an error. */
    }
  }

  /* Applies a theme: sets the attribute the CSS reacts to, then updates the
     button's labels so screen readers announce what it will do next. */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    /* documentElement is <html>. Setting data-theme="dark" there is the
       single switch that activates the whole dark palette in style.css. */

    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      /* condition ? a : b  is shorthand for if/else, in one expression. */
    }
  }

  function initTheme() {
    /* Re-apply whatever the inline script decided. This looks redundant, but
       it's what syncs the BUTTON's labels with the already-applied theme. */
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");

    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;   /* no button on this page — nothing to wire up */

    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      store(next);
    });
  }


  /* ==========================================================================
     2. ACTIVE NAV LINK
     ==========================================================================
     Works out which page is being viewed and marks that menu link, so you
     never have to hand-edit a "current page" class in five HTML files —
     a job that is easy to forget and looks sloppy when you do.

     It compares the filename in the address bar against each link's href.
     ========================================================================== */

  function initActiveLink() {
    var here = window.location.pathname.split("/").pop() || "index.html";
    /* pathname is like "/research.html". split("/") breaks it into pieces,
       .pop() takes the last one. The "|| index.html" handles the case where
       the address ends in a slash — the homepage — and pop() returns "". */

    document.querySelectorAll(".nav a").forEach(function (a) {
      var target = a.getAttribute("href");
      if (target === here || (here === "" && target === "index.html")) {
        a.setAttribute("aria-current", "page");
        /* aria-current is a real accessibility attribute announced by screen
           readers as "current page". style.css also uses it as the styling
           hook, so one attribute does both jobs. */
      }
    });
  }


  /* ==========================================================================
     3. MOBILE NAV — the hamburger
     ==========================================================================
     All this does is add and remove the class "is-open" on the menu. The CSS
     (section 10 of style.css) decides what that means, and only below 760px
     wide. Keeping the appearance in CSS and the state in JS is the tidy split.
     ========================================================================== */

  function initMobileNav() {
    var btn = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("primary-nav");
    if (!btn || !nav) return;

    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      /* toggle() removes the class if present, adds it if not, and returns
         true when the class ended up present. */
      btn.setAttribute("aria-expanded", String(open));
      /* Tells assistive tech whether the menu is currently open. */
    });

    /* Close the menu when a link inside it is followed. Without this, tapping
       a link on a phone leaves the menu hanging open over the new page. */
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
      /* closest("a") walks up from whatever was actually tapped until it
         finds a link. Necessary because the tap may land on something inside
         the link rather than the link itself. */
    });

    /* Close it if the window is widened past the breakpoint — otherwise the
       "open" state lingers invisibly and the menu misbehaves on the way back
       down. Mostly affects people rotating a tablet. */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) {
        nav.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }


  /* ==========================================================================
     4. LIGHTBOX — the full-screen image viewer
     ==========================================================================
     Runs on any page that has BOTH a container marked data-gallery AND the
     lightbox markup (id="lightbox"). On the other four pages it stops at the
     first check and costs nothing.

     It reads everything from the gallery itself — the image, the caption, the
     count — so adding a photo to hobbies.html requires no change here.
     ========================================================================== */

  function initLightbox() {
    var gallery = document.querySelector("[data-gallery]");
    var box = document.getElementById("lightbox");
    if (!gallery || !box) return;   /* not this page */

    var items = Array.prototype.slice.call(gallery.querySelectorAll("button"));
    if (!items.length) return;      /* gallery exists but is empty */
    /* Each gallery image is a <button>; this collects them into a list so we
       can move forwards and backwards through it. */

    var imgEl = box.querySelector("[data-lb-img]");     /* the big image   */
    var capEl = box.querySelector("[data-lb-cap]");     /* its caption     */
    var numEl = box.querySelector("[data-lb-count]");   /* the "3 / 6"     */
    var index = 0;                                      /* which one is up */
    var lastFocused = null;   /* remembers what was focused before opening,
                                 so the keyboard returns there on close */

    /* Fill the viewer with image number i. */
    function show(i) {
      index = (i + items.length) % items.length;
      /* The modulo makes the list wrap around: going forward from the last
         image lands on the first, and back from the first lands on the last.
         Adding items.length first keeps it correct for negative numbers. */

      var thumb = items[index].querySelector("img");
      var cap = items[index].querySelector(".cap");

      imgEl.src = thumb.getAttribute("data-full") || thumb.src;
      /* Prefer the large version if the HTML supplies one; otherwise reuse
         the thumbnail. That's what data-full in hobbies.html is for. */

      imgEl.alt = thumb.alt || "";
      capEl.textContent = cap ? cap.textContent.trim() : "";
      /* textContent, never innerHTML — it inserts text as text, which means
         a caption can never accidentally be interpreted as markup. */
      numEl.textContent = (index + 1) + " / " + items.length;
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      box.classList.add("is-open");
      box.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      /* Stops the page behind scrolling while the viewer is up. Undone on
         close, below. */
      box.querySelector(".lb-close").focus();
      /* Moves keyboard focus into the viewer, so Tab and Escape act on it. */
    }

    function close() {
      box.classList.remove("is-open");
      box.setAttribute("hidden", "");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
      /* Returns the keyboard to the thumbnail that was clicked, rather than
         dumping the user back at the top of the page. */
    }

    /* Wire each thumbnail to open the viewer at its own position. */
    items.forEach(function (btn, i) {
      btn.addEventListener("click", function () { open(i); });
    });

    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });

    /* Click the dark background to dismiss. The check matters: without it,
       clicking the image itself would also close the viewer. */
    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });

    /* Keyboard: Escape closes, arrows move. Expected behaviour for any
       full-screen viewer, and cheap to provide. */
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;   /* ignore when closed */
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }


  /* ==========================================================================
     5. FOOTER YEAR
     ==========================================================================
     Fills every <span data-year> with the current year, so the copyright line
     never quietly goes stale. The "2026" typed into the HTML is the fallback
     shown if JavaScript is off.
     ========================================================================== */

  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }


  /* ==========================================================================
     START EVERYTHING
     ==========================================================================
     Each init function is independent and safe to run on any page. To add a
     new behaviour, write another init function above and add a line here.
     ========================================================================== */

  function init() {
    initTheme();
    initActiveLink();
    initMobileNav();
    initLightbox();
    initYear();
  }

  /* Run as soon as the page structure is ready. The <script> tag sits at the
     end of the body, so normally it already is — but this handles the case
     where the file is cached and arrives early. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
