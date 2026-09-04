/* ============================================================
   FORMA — main.js
   Loading experience (real preload progress of the 10 sequence
   frames) + small nav / general wiring.
   ============================================================ */
(function () {
  "use strict";

  var FRAME_COUNT = 10;
  var FRAME_PATH = "assets/images/sequence/Frame_";

  var loader = document.getElementById("loader");
  var loaderFill = document.getElementById("loaderFill");
  var loaderCount = document.getElementById("loaderCount");

  var urls = [];
  for (var i = 1; i <= FRAME_COUNT; i++) {
    var n = i < 10 ? "0" + i : "" + i;
    urls.push(FRAME_PATH + n + ".jpg");
  }

  var loaded = 0;

  function updateProgress() {
    var pct = Math.round((loaded / urls.length) * 100);
    if (loaderFill) loaderFill.style.width = pct + "%";
    if (loaderCount) loaderCount.textContent = zeroPad2(pct) + "%";
  }

  function zeroPad2(n) { return n < 10 ? "0" + n : "" + n; }

  function frameDone() {
    loaded++;
    updateProgress();
    if (loaded >= urls.length) {
      finishLoading();
    }
  }

  function finishLoading() {
    // brief pause so 100% is visible before the reveal
    setTimeout(function () {
      document.body.style.overflow = "";
      if (loader) loader.classList.add("is-hidden");
      if (typeof window.__formaRenderSequence === "function") {
        window.__formaRenderSequence();
      }
    }, 280);
  }

  function preload() {
    document.body.style.overflow = "hidden";
    urls.forEach(function (src) {
      var img = new Image();
      img.onload = frameDone;
      img.onerror = frameDone; // never block the experience on one bad asset
      img.src = src;
    });
  }

  // Safety net: never trap the visitor behind the loader.
  var safety = setTimeout(finishLoading, 6000);
  var originalFinish = finishLoading;
  finishLoading = function () {
    clearTimeout(safety);
    originalFinish();
  };

  preload();
  updateProgress();

  // ---- Nav: smooth in-page anchors already handled by CSS
  // (scroll-behavior: smooth). Close/blur focus after click for
  // a tidy keyboard state.
  var navLinks = document.querySelectorAll(".nav__link, .hero__cta, .reveal__cta, .contact__cta");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      link.blur();
    });
  });
})();
