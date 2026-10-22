/* The King Rugs — interactions */
(function () {
  "use strict";

  /* ----- Auto copyright year ----- */
  document.querySelectorAll(".js-year").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ----- Navbar scroll state + mobile menu close ----- */
  const nav = document.querySelector(".site-nav");
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Close mobile menu after tapping a link
    const collapseEl = document.getElementById("navbarNav");
    nav.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (!collapseEl || window.innerWidth >= 992) return;
        const instance =
          window.bootstrap && bootstrap.Collapse.getInstance(collapseEl);
        if (instance) instance.hide();
      });
    });
  }

  /* ----- Scroll reveal ----- */
  const revealEls = document.querySelectorAll(
    ".reveal, .feature-item, .collection-tile, .product-card"
  );
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ----- Hero image slider (3 images, auto every 10s, no arrows) ----- */
  const hero = document.querySelector(".hero");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    let index = 0;
    const DURATION = 10000;

    function goTo(i) {
      slides[index].classList.remove("active");
      index = (i + slides.length) % slides.length;
      slides[index].classList.add("active");
    }

    setInterval(function () {
      goTo(index + 1);
    }, DURATION);
  }

  /* ----- Featured Pieces: one image that flips to the next ----- */
  const flip = document.getElementById("featured-flip");
  if (flip) {
    const inner = flip.querySelector(".flip-inner");
    const front = flip.querySelector(".flip-front");
    const back = flip.querySelector(".flip-back");
    const images = Array.from(flip.querySelectorAll(".featured-flip-source img")).map((img) => ({
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt") || "",
    }));
    const INTERVAL = 1000;
    let index = 0;
    let turns = 0;
    let timer = null;

    function flipNext() {
      index = (index + 1) % images.length;
      turns += 1;
      const face = turns % 2 === 1 ? back : front;
      face.src = images[index].src;
      face.alt = images[index].alt;
      inner.style.transform = "rotateY(" + turns * 180 + "deg)";
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(flipNext, INTERVAL);
    }

    function stop() {
      clearInterval(timer);
    }

    if (images.length > 1) {
      flip.addEventListener("mouseenter", stop);
      flip.addEventListener("mouseleave", start);
      document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
      start();
    }
  }

  /* ----- Product lightbox / sliding gallery ----- */
  const productCards = Array.from(document.querySelectorAll("[data-gallery-item]"));
  if (!productCards.length) return;

  const items = productCards.map((card) => ({
    src: card.getAttribute("data-src") || card.querySelector("img")?.src,
    title: card.getAttribute("data-title") || "",
    desc: card.getAttribute("data-desc") || "",
  }));

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
    <div class="lightbox-inner">
      <button type="button" class="lightbox-btn lightbox-prev" aria-label="Previous">
        <i class="bi bi-chevron-left"></i>
      </button>
      <div class="lightbox-stage">
        <div class="lightbox-track"></div>
      </div>
      <button type="button" class="lightbox-btn lightbox-next" aria-label="Next">
        <i class="bi bi-chevron-right"></i>
      </button>
      <div class="lightbox-caption">
        <h3></h3>
        <p></p>
        <div class="lightbox-counter"></div>
      </div>
      <div class="lightbox-thumbs"></div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const track = lightbox.querySelector(".lightbox-track");
  const captionTitle = lightbox.querySelector(".lightbox-caption h3");
  const captionDesc = lightbox.querySelector(".lightbox-caption p");
  const counter = lightbox.querySelector(".lightbox-counter");
  const thumbs = lightbox.querySelector(".lightbox-thumbs");

  items.forEach((item, i) => {
    const slide = document.createElement("div");
    slide.className = "lightbox-slide";
    slide.innerHTML = `<img src="${item.src}" alt="${item.title}" loading="lazy">`;
    track.appendChild(slide);

    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.setAttribute("aria-label", item.title || "Image " + (i + 1));
    thumb.innerHTML = `<img src="${item.src}" alt="">`;
    thumb.addEventListener("click", () => show(i));
    thumbs.appendChild(thumb);
  });

  let current = 0;

  function updateCaption() {
    const item = items[current];
    captionTitle.textContent = item.title;
    captionDesc.textContent = item.desc;
    counter.textContent = current + 1 + " / " + items.length;
    thumbs.querySelectorAll("button").forEach((btn, i) => {
      btn.classList.toggle("active", i === current);
    });
    track.style.transform = "translateX(-" + current * 100 + "%)";
  }

  function show(i) {
    current = (i + items.length) % items.length;
    updateCaption();
    lightbox.classList.add("open");
    document.body.classList.add("lightbox-open");
  }

  function close() {
    lightbox.classList.remove("open");
    document.body.classList.remove("lightbox-open");
  }

  productCards.forEach((card, i) => {
    card.addEventListener("click", () => show(i));
    card.setAttribute("tabindex", "0");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        show(i);
      }
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", close);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => show(current + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  // Touch swipe in lightbox
  let lx = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      lx = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  track.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].screenX - lx;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    },
    { passive: true }
  );
})();
