const CONFIG = {
  tokenAddress: "0x90a36713577d661e8f3ae0085dfed7f4460a2e71",
  uniswapUrl: "",
  twitter: "https://x.com/pepinaonrobin",
};

const CHAIN = {
  chainId: "0x1237",
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
  uniswapChain: "robinhood",
  bridgeUrl: "https://portal.arbitrum.io/bridge?destinationChain=robinhood-chain",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getUniswapUrl() {
  if (CONFIG.uniswapUrl) return CONFIG.uniswapUrl;
  const params = new URLSearchParams({ chain: CHAIN.uniswapChain, inputCurrency: "NATIVE" });
  if (CONFIG.tokenAddress) params.set("outputCurrency", CONFIG.tokenAddress);
  return `https://app.uniswap.org/swap?${params}`;
}

function getExplorerUrl() {
  const base = CHAIN.blockExplorerUrls[0];
  return CONFIG.tokenAddress ? `${base}/token/${CONFIG.tokenAddress}` : base;
}

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("copy-toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function initContract() {
  const display = document.getElementById("ca-display");
  const copyBtn = document.getElementById("copy-ca");
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
      showToast("Contract address copied.");

      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = "Copy";
      }, 2500);
    } catch {
      showToast("Copy failed — select and copy manually.");
    }
  });
}

function initAddChain() {
  const btn = document.getElementById("add-chain");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const { ethereum } = window;
    if (!ethereum) {
      showToast("No EVM wallet found. Install MetaMask, Rabby, or Robinhood Wallet.");
      return;
    }

    try {
      await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN.chainId }] });
      showToast("Switched to Robinhood Chain.");
    } catch (err) {
      if (err && err.code === 4902) {
        try {
          const { uniswapChain, bridgeUrl, ...params } = CHAIN;
          await ethereum.request({ method: "wallet_addEthereumChain", params: [params] });
          showToast("Robinhood Chain added to your wallet.");
        } catch {
          showToast("Robinhood Chain was not added.");
        }
      } else {
        showToast("Network switch cancelled.");
      }
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

  document.querySelectorAll("[data-explorer]").forEach((el) => {
    el.href = getExplorerUrl();
  });

  document.querySelectorAll("[data-bridge]").forEach((el) => {
    el.href = CHAIN.bridgeUrl;
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
    ".x-card",
    ".token-board article",
    ".net-actions",
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

function initRain() {
  const canvas = document.querySelector(".hero-rain");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;
  let drops = [];
  let width = 0;
  let height = 0;
  let running = false;
  let last = 0;

  const makeDrop = (randomY) => {
    const depth = Math.random();
    return {
      x: Math.random() * (width + 200) - 100,
      y: randomY ? Math.random() * height : -40 - Math.random() * height * 0.3,
      len: 10 + depth * 22,
      speed: 650 + depth * 900,
      alpha: 0.08 + depth * 0.32,
      thick: 0.6 + depth * 0.9,
    };
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(420, (width * height) / 5200));
    drops = Array.from({ length: count }, () => makeDrop(true));
  };

  const slant = 0.18;

  const frame = (now) => {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";

    for (const d of drops) {
      d.y += d.speed * dt;
      d.x += d.speed * slant * dt;
      if (d.y - d.len > height || d.x > width + 100) Object.assign(d, makeDrop(false));

      ctx.strokeStyle = `rgba(200, 222, 255, ${d.alpha})`;
      ctx.lineWidth = d.thick;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * slant, d.y - d.len);
      ctx.stroke();
    }

    requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };

  resize();
  window.addEventListener("resize", resize);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else running = false;
    }).observe(hero);
  } else {
    start();
  }

  setTimeout(() => canvas.classList.add("on"), 900);
}

function initMoon() {
  const moon = document.querySelector(".hero-moon");
  const image = document.querySelector(".hero-image");
  if (!moon || !image) return;

  const MOON = { x: 0.884, y: 0.141, size: 0.11 };

  const place = () => {
    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    if (!iw || !ih) return;

    const w = image.clientWidth;
    const h = image.clientHeight;
    const scale = Math.max(w / iw, h / ih);
    const rw = iw * scale;
    const rh = ih * scale;
    const [px, py] = getComputedStyle(image).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
    const x = (w - rw) * (isNaN(px) ? 0.5 : px) + MOON.x * rw;
    const y = (h - rh) * (isNaN(py) ? 0.5 : py) + MOON.y * rh;

    moon.style.setProperty("--moon-x", `${x}px`);
    moon.style.setProperty("--moon-y", `${y}px`);
    moon.style.setProperty("--moon-size", `${MOON.size * rw}px`);
    moon.hidden = x < -rw * MOON.size || x > w + rw * MOON.size;
  };

  if (image.complete) place();
  else image.addEventListener("load", place);
  window.addEventListener("resize", place);
}

function initDrips() {
  if (reduceMotion) return;

  document.querySelectorAll("[data-drips]").forEach((el) => {
    const count = el.classList.contains("banner-frame") ? 9 : 5;
    for (let i = 0; i < count; i++) {
      const drip = document.createElement("i");
      drip.className = "drip";
      drip.setAttribute("aria-hidden", "true");
      drip.style.setProperty("--x", `${(4 + Math.random() * 92).toFixed(1)}%`);
      drip.style.setProperty("--len", `${Math.round(10 + Math.random() * 22)}px`);
      drip.style.setProperty("--dur", `${(4.5 + Math.random() * 5).toFixed(2)}s`);
      drip.style.setProperty("--delay", `${(-Math.random() * 9).toFixed(2)}s`);
      el.appendChild(drip);
    }
  });
}

function initScrollEffects() {
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const heroImage = document.querySelector(".hero-image");
  const heroMoon = document.querySelector(".hero-moon");
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle("scrolled", y > 24);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (!reduceMotion && heroImage && y < window.innerHeight * 1.2) {
      heroImage.style.setProperty("--parallax", `${y * 0.25}px`);
      if (heroMoon) heroMoon.style.setProperty("--parallax", `${y * 0.25}px`);
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
  initAddChain();
  initNav();
  initSocialLinks();
  initReveal();
  initCounters();
  initTilt();
  initRain();
  initMoon();
  initDrips();
  initScrollEffects();
});
