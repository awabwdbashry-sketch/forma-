/* ============================================================
   FORMA — animations.js
   Custom cursor + hover micro-interactions.
   Kept intentionally minimal: motion here only answers
   direct user input (mouse movement / hover), never plays
   on its own.
   ============================================================ */
(function () {
  "use strict";

  var cursor = document.getElementById("cursor");
  if (!cursor) return;

  var isCoarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (isCoarse) return;

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var curX = mouseX;
  var curY = mouseY;

  window.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function raf() {
    // gentle lag for a refined, weighted feel rather than 1:1 tracking
    curX += (mouseX - curX) * 0.18;
    curY += (mouseY - curY) * 0.18;
    cursor.style.transform = "translate(" + curX + "px," + curY + "px) translate(-50%,-50%)";
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  function bindHoverTargets() {
    var targets = document.querySelectorAll("[data-hover], a, button");
    targets.forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hover"); });
    });
  }
  bindHoverTargets();
})();

/* ============================================================
   Editorial gallery sections — reveal on scroll into view.
   Fires once per section; respects reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var sections = document.querySelectorAll(".editorial-block");
  if (!sections.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || typeof IntersectionObserver === "undefined") {
    sections.forEach(function (el) { el.classList.add("is-inview"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-inview");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.22 });

  sections.forEach(function (el) { observer.observe(el); });
})();
