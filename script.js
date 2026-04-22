const revealItems = document.querySelectorAll(".reveal");
const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const downloadTargets = document.querySelectorAll('a[download="absolute-boosting.deb"]');
const boostButton = document.getElementById("boost-demo-btn");
const boostFeedback = document.getElementById("boost-feedback");
const networkPath = document.getElementById("network-path");
const countNodes = document.querySelectorAll("[data-count]");
const faqItems = document.querySelectorAll(".faq-item");

const meterState = {
  cpu: { current: 10, target: 10 },
  ram: { current: 48, target: 48 },
  disk: { current: 10, target: 10 },
  network: { current: 24, target: 24 }
};

const boostProfiles = [
  {
    feedback: "Boost concluído: serviços de fundo reduzidos e memória otimizada.",
    values: { cpu: 7, ram: 31, disk: 8, network: 19 }
  },
  {
    feedback: "Perfil competitivo aplicado: menor interferência e resposta mais estável.",
    values: { cpu: 6, ram: 28, disk: 7, network: 16 }
  },
  {
    feedback: "Sistema recalibrado: limpeza executada e prioridades atualizadas.",
    values: { cpu: 8, ram: 34, disk: 9, network: 20 }
  }
];

let boostIndex = 0;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setVisible(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(setVisible, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    topbar.classList.toggle("menu-open");
  });
}

faqItems.forEach((item) => {
  const trigger = item.querySelector(".faq-trigger");
  if (!trigger) return;

  trigger.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    faqItems.forEach((entry) => {
      entry.classList.remove("active");
      entry.querySelector(".faq-trigger")?.setAttribute("aria-expanded", "false");
    });

    if (!isActive) {
      item.classList.add("active");
      trigger.setAttribute("aria-expanded", "true");
    }
  });
});

downloadTargets.forEach((target) => {
  target.addEventListener("click", () => {
    target.classList.add("is-downloading");
    window.setTimeout(() => target.classList.remove("is-downloading"), 700);
  });
});

function drawWave() {
  if (!networkPath) return;

  const points = [];
  const width = 240;
  const height = 72;
  const steps = 12;

  for (let index = 0; index <= steps; index += 1) {
    const x = (width / steps) * index;
    const y = clamp(38 - meterState.network.current * 0.55 + Math.sin(Date.now() / 550 + index) * 9, 10, 58);
    points.push(`${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  networkPath.setAttribute("d", points.join(" "));
}

function updateMeters() {
  Object.entries(meterState).forEach(([key, item]) => {
    item.current += (item.target - item.current) * 0.12;
    if (Math.abs(item.target - item.current) < 0.2) {
      item.current = item.target;
    }

    const bar = document.querySelector(`[data-meter-bar="${key}"]`);
    const text = document.querySelector(`[data-meter-text="${key}"]`);
    const rounded = Math.round(item.current);

    if (bar) bar.style.width = `${rounded}%`;
    if (text) text.textContent = `${rounded}%`;
  });

  drawWave();
  window.requestAnimationFrame(updateMeters);
}

function randomizeIdleMeters() {
  meterState.cpu.target = clamp(8 + Math.random() * 9, 6, 18);
  meterState.ram.target = clamp(38 + Math.random() * 18, 28, 62);
  meterState.disk.target = clamp(8 + Math.random() * 7, 6, 20);
  meterState.network.target = clamp(18 + Math.random() * 12, 12, 38);
}

function runBoostDemo() {
  if (!boostButton) return;

  const profile = boostProfiles[boostIndex % boostProfiles.length];
  boostIndex += 1;

  boostButton.disabled = true;
  boostButton.textContent = "Executando...";
  boostFeedback.textContent = "Analisando processos, limpando resíduos e aplicando perfil de desempenho.";

  window.setTimeout(() => {
    Object.entries(profile.values).forEach(([key, value]) => {
      meterState[key].target = value;
    });
    boostFeedback.textContent = profile.feedback;
  }, 700);

  window.setTimeout(() => {
    boostButton.disabled = false;
    boostButton.textContent = "Executar Boost";
    randomizeIdleMeters();
  }, 3000);
}

if (boostButton) {
  boostButton.addEventListener("click", runBoostDemo);
}

function animateCount(node) {
  const target = Number(node.dataset.count);
  if (!target) return;

  let current = 0;
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    current = Math.round(target * progress);
    node.textContent = `+${current}K`;
    if (progress < 1) window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
}

if ("IntersectionObserver" in window && countNodes.length > 0) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  countNodes.forEach((node) => countObserver.observe(node));
} else {
  countNodes.forEach((node) => animateCount(node));
}

const gradientContainer = document.createElementNS("http://www.w3.org/2000/svg", "defs");
const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
linearGradient.setAttribute("id", "gradient");
linearGradient.setAttribute("x1", "0%");
linearGradient.setAttribute("y1", "0%");
linearGradient.setAttribute("x2", "100%");
linearGradient.setAttribute("y2", "0%");

const stopA = document.createElementNS("http://www.w3.org/2000/svg", "stop");
stopA.setAttribute("offset", "0%");
stopA.setAttribute("stop-color", "#9a58ff");

const stopB = document.createElementNS("http://www.w3.org/2000/svg", "stop");
stopB.setAttribute("offset", "100%");
stopB.setAttribute("stop-color", "#4a84ff");

linearGradient.append(stopA, stopB);
gradientContainer.appendChild(linearGradient);
networkPath?.ownerSVGElement?.prepend(gradientContainer);

window.setInterval(randomizeIdleMeters, 2400);
randomizeIdleMeters();
updateMeters();
