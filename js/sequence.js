/* ============================================================
   FORMA — sequence.js
   Drives the scroll-controlled architectural image sequence.

   How it works:
   - The #sequence section is very tall (1000vh). Its inner
     content is position:sticky, so it stays pinned to the
     viewport while the section scrolls underneath.
   - We read how far the user has scrolled through that tall
     section (0 → 1) and map it continuously onto the 10
     source frames (Frame_01.jpg → Frame_10.jpg).
   - Instead of hard-cutting between images, we crossfade the
     current frame into the next one based on the fractional
     scroll position, so the building appears to continuously
     transform rather than "slideshow" between stills.
   - Scrolling back up reverses the exact same mapping, so the
     sequence runs Frame 10 → Frame 01 in reverse, frame for
     frame.
   ============================================================ */
(function () {
  "use strict";

  var FRAME_COUNT = 10;
  var FRAME_PATH = "assets/images/sequence/Frame_";

  // Arabic stage name (short — used as label + eyebrow) and the
  // longer editorial line, one pair per frame. Only the pair for
  // the current frame is ever shown.
  var STAGES = [
    { name: "الفكرة",        line: "كل مشروع يبدأ بخط." },
    { name: "التكوين",       line: "من الخطوط تبدأ ملامح المكان." },
    { name: "الهيكل",        line: "الفكرة تتحول إلى بنية." },
    { name: "البناء",        line: "كل تفصيل له غايته." },
    { name: "الواجهة",       line: "حين تلتقي الهندسة بالجمال." },
    { name: "الخامة",        line: "المادة تمنح الشكل حضوره." },
    { name: "الحضور",        line: "العمارة لا تُرى فقط... بل تُشعر." },
    { name: "المساحة",       line: "ندخل إلى المكان." },
    { name: "التفاصيل",      line: "الضوء، الخامة، والفراغ." },
    { name: "الشكل النهائي", line: "حين تكتمل الفكرة." }
  ];

  var sequenceSection = document.getElementById("sequence");
  var imgA = document.getElementById("imgA");
  var imgB = document.getElementById("imgB");
  var labelIndex = document.getElementById("labelIndex");
  var labelName = document.getElementById("labelName");
  var progressFill = document.getElementById("progressFill");
  var editorialEl = document.getElementById("editorial");
  var editorialEyebrow = document.getElementById("editorialEyebrow");
  var editorialLine = document.getElementById("editorialLine");

  if (!sequenceSection || !imgA || !imgB) return;

  // Preload every frame so crossfades never show a blank flash.
  var frames = [];
  for (var i = 1; i <= FRAME_COUNT; i++) {
    var n = i < 10 ? "0" + i : "" + i;
    var im = new Image();
    im.src = FRAME_PATH + n + ".jpg";
    frames.push(im.src);
  }

  var currentA = -1;
  var currentB = -1;
  var ticking = false;

  function zeroPad(n) { return n < 10 ? "0" + n : "" + n; }

  function setSrc(imgEl, cache, index) {
    var src = frames[index];
    if (cache !== index) {
      imgEl.src = src;
    }
    return index;
  }

  var lastDisplayIndex = -1;

  function updateEditorial(displayIndex) {
    if (!editorialEl || !editorialEyebrow || !editorialLine) return;
    if (displayIndex === lastDisplayIndex) return;
    lastDisplayIndex = displayIndex;

    var stage = STAGES[displayIndex - 1];

    // Briefly fade the current line out, swap the text once hidden,
    // then fade the new line in — so only the active stage is ever
    // legible, and the change itself feels considered rather than
    // an abrupt cut.
    editorialEl.classList.add("is-transitioning");
    window.setTimeout(function () {
      editorialEyebrow.textContent = stage.name;
      editorialLine.textContent = stage.line;
      editorialEl.classList.remove("is-transitioning");
    }, 180);
  }

  function render() {
    ticking = false;

    var rect = sequenceSection.getBoundingClientRect();
    var sectionHeight = sequenceSection.offsetHeight - window.innerHeight;
    if (sectionHeight <= 0) return;

    // progress: 0 at the top of the section, 1 once it has fully
    // scrolled past (the sticky viewport releases).
    var scrolled = -rect.top;
    var progress = scrolled / sectionHeight;
    progress = Math.max(0, Math.min(1, progress));

    var t = progress * (FRAME_COUNT - 1); // 0 .. 9
    var frameA = Math.floor(t);
    var frameB = Math.min(frameA + 1, FRAME_COUNT - 1);
    var frac = t - frameA;

    currentA = setSrc(imgA, currentA, frameA);
    currentB = setSrc(imgB, currentB, frameB);

    imgA.style.opacity = String(1 - frac);
    imgB.style.opacity = String(frac);

    var displayIndex = Math.round(t) + 1;
    labelIndex.textContent = zeroPad(displayIndex) + " / " + zeroPad(FRAME_COUNT);
    labelName.textContent = STAGES[displayIndex - 1].name;

    progressFill.style.height = (progress * 100).toFixed(2) + "%";

    updateEditorial(displayIndex);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // Initial paint
  render();

  // Expose a re-render hook so main.js can trigger it once
  // images are fully loaded / loader is dismissed.
  window.__formaRenderSequence = render;
})();
