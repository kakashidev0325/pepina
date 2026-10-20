const CONFIG = {
  tokenAddress: "",
  uniswapUrl: "",
  twitter: "",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getUniswapUrl() {
  if (CONFIG.uniswapUrl) return CONFIG.uniswapUrl;
  if (CONFIG.tokenAddress) return `https://app.uniswap.org/swap?outputCurrency=${CONFIG.tokenAddress}`;
  return "https://app.uniswap.org/swap";
}

function initContract() {
  const display = document.getElementById("ca-display");
  const copyBtn = document.getElementById("copy-ca");
  const toast = document.getElementById("copy-toast");
  const address = CONFIG.tokenAddress;

  if (!address) {
    display.textContent = "TBA";
    copyBtn.disabled = true;
    copyBtn.title = "Contract address coming soon";
    return;
  }

  display.textContent = address;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(address);
      copyBtn.classList.add("copied");
      copyBtn.textContent = "Copied";
      toast.textContent = "Contract address copied.";
      toast.classList.add("show");

      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = "Copy";
        toast.classList.remove("show");
      }, 2500);
    } catch {
      toast.textContent = "Copy failed — select and copy manually.";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2500);
    }
  });
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initSocialLinks() {
  const uniswapUrl = getUniswapUrl();

  document.querySelectorAll("[data-uniswap]").forEach((el) => {
    el.href = uniswapUrl;
  });

  document.querySelectorAll("[data-twitter]").forEach((el) => {
    if (CONFIG.twitter) el.href = CONFIG.twitter;
  });
}

function initReveal() {
  const groups = [
    ".section-head",
    ".section-lede:not(.tight)",
    ".banner-frame",
    ".banner-note",
    ".about-copy > *",
    ".meme-card",
    ".ca-box",
    ".token-board article",
    ".steps li",
    ".buy-cta",
    ".proof-bar p",
    ".footer-inner > *",
  ];

  const targets = [];
  groups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${Math.min(i, 6) * 90}ms`);
      targets.push(el);
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (reduceMotion || !counters.length || !("IntersectionObserver" in window)) return;

  const run = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };

    el.textContent = `0${suffix}`;
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => observer.observe(el));
}

function initTilt() {
  if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;

  document.querySelectorAll(".meme-card, .banner-frame").forEach((card) => {
    const max = card.classList.contains("banner-frame") ? 4 : 9;

    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

function initScrollEffects() {
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const heroImage = document.querySelector(".hero-image");
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle("scrolled", y > 24);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (!reduceMotion && heroImage && y < window.innerHeight * 1.2) {
      heroImage.style.setProperty("--parallax", `${y * 0.25}px`);
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );

  update();
}

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  initContract();
  initNav();
  initSocialLinks();
  initReveal();
  initCounters();
  initTilt();
  initScrollEffects();
});
