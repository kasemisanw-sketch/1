(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Floating particles ---------- */
  function initParticles() {
    const canvas = document.getElementById("particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = 0;
    let h = 0;
    const particles = [];
    const COUNT = prefersReducedMotion ? 28 : 55;

    function resize() {
      w = canvas.width = window.innerWidth * window.devicePixelRatio;
      h = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(initial) {
        this.x = Math.random() * w;
        this.y = initial ? Math.random() * h : h + 20;
        this.r = Math.random() * 2.2 + 0.4;
        this.speed = Math.random() * 0.35 + 0.12;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.012 + 0.004;
        this.alpha = Math.random() * 0.35 + 0.15;
      }
      step() {
        this.y -= this.speed * (window.devicePixelRatio || 1);
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.35;
        if (this.y < -10) this.reset(false);
      }
      draw() {
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
        glow.addColorStop(0, `rgba(232, 213, 168, ${this.alpha})`);
        glow.addColorStop(0.4, `rgba(201, 169, 98, ${this.alpha * 0.35})`);
        glow.addColorStop(1, "rgba(201, 169, 98, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    function loop() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.step();
        p.draw();
      }
      raf = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    if (!prefersReducedMotion) loop();
    else {
      ctx.fillStyle = "rgba(201, 169, 98, 0.06)";
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return function destroy() {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    const root = document.getElementById("countdownRoot");
    if (!root) return;
    const targetStr = root.dataset.target;
    const target = targetStr ? new Date(targetStr).getTime() : NaN;
    if (Number.isNaN(target)) return;

    const els = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]'),
    };

    let prev = {};

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function tick() {
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      diff -= days * 24 * 60 * 60 * 1000;
      const hours = Math.floor(diff / (60 * 60 * 1000));
      diff -= hours * 60 * 60 * 1000;
      const minutes = Math.floor(diff / (60 * 1000));
      diff -= minutes * 60 * 1000;
      const seconds = Math.floor(diff / 1000);

      const next = { days, hours, minutes, seconds };
      Object.keys(els).forEach((key) => {
        const el = els[key];
        if (!el) return;
        const val = key === "days" ? String(days) : pad(next[key]);
        if (prev[key] !== undefined && prev[key] !== val && !prefersReducedMotion) {
          el.classList.remove("tick");
          void el.offsetWidth;
          el.classList.add("tick");
        }
        el.textContent = val;
      });
      prev = { days: String(days), hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ---------- GSAP scroll + parallax ---------- */
  function initGsap() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const heroParallax = document.querySelector(".hero__parallax");
    if (heroParallax && !prefersReducedMotion) {
      gsap.to(heroParallax, {
        y: 80,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }

    document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (prefersReducedMotion) {
        gsap.set(el, { opacity: 1, y: 0, scale: 1 });
        return;
      }
      gsap.fromTo(
        el,
        { opacity: 0, y: 48, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    /* Gallery stagger */
    const gallery = document.querySelector(".gallery-grid");
    if (gallery && !prefersReducedMotion) {
      const items = gallery.querySelectorAll(".gallery-item");
      gsap.fromTo(
        items,
        { opacity: 0, y: 36, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.95,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gallery,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }

  /* ---------- Background music ---------- */
  function initMusic() {
    const audio = document.getElementById("bgMusic");
    const btn = document.getElementById("musicToggle");
    if (!audio || !btn) return;

    audio.volume = 0.35;

    function setPlaying(on) {
      btn.classList.toggle("is-playing", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }

    setPlaying(false);

    async function toggle() {
      try {
        if (audio.paused) {
          await audio.play();
          setPlaying(true);
        } else {
          audio.pause();
          setPlaying(false);
        }
      } catch {
        setPlaying(false);
      }
    }

    btn.addEventListener("click", toggle);

    audio.addEventListener("ended", () => setPlaying(false));
  }

  /* ---------- RSVP ---------- */
  function initRsvp() {
    const btn = document.getElementById("rsvpBtn");
    const toast = document.getElementById("rsvpToast");
    if (!btn || !toast) return;

    let t;
    btn.addEventListener("click", () => {
      btn.classList.remove("is-pressed");
      void btn.offsetWidth;
      btn.classList.add("is-pressed");
      toast.hidden = false;
      toast.classList.add("is-visible");
      clearTimeout(t);
      t = setTimeout(() => {
        toast.classList.remove("is-visible");
        setTimeout(() => {
          toast.hidden = true;
        }, 500);
      }, 3200);
    });
  }

  /* ---------- Boot ---------- */
  initParticles();
  initCountdown();
  initMusic();
  initRsvp();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGsap);
  } else {
    initGsap();
  }
})();
