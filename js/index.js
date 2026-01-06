const AUTH_KEY = "xy-auth";

/** Returns a relative path back to project root (works in /, /pages, /pages/tools). */
function getRootRelativePath() {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.includes("/pages/tools/")) return "../../";
  if (path.includes("/pages/")) return "../";
  return "./";
}

function initPWA() {
  if (!("serviceWorker" in navigator)) return;
  const root = getRootRelativePath();
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(root + "sw.js").catch(() => {});
  });
}

function markActiveNav(page) {
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const isHome = page === "home" && href.includes("index");
    const match = page !== "home" && href.includes(page);
    if (isHome || match) {
      link.classList.add("active");
    }
  });
}

function handleSplash(page) {
  const splash = document.getElementById("splash");
  if (!splash) return;
  if (page === "login") return;
  setTimeout(() => {
    splash.classList.add("hidden");
  }, 1200);
}

function handleScrollReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  items.forEach((el) => observer.observe(el));
}

function initLoginPage() {
  const form = document.getElementById("login-form");
  const splash = document.getElementById("splash");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = form.querySelector("input[name='user']")?.value || "visitante";
    localStorage.setItem(AUTH_KEY, user);
    if (splash) splash.classList.remove("hidden");
    setTimeout(() => {
      window.location.href = getRootRelativePath() + "index.html";
    }, 900);
  });
}

function initAnchors() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;
    const id = link.getAttribute("href")?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function initSeoTool() {
  const form = document.getElementById("seo-form");
  const output = document.getElementById("seo-output");
  if (!form || !output) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = form.querySelector("input[name='seo-title']")?.value || "";
    const desc = form.querySelector("textarea[name='seo-desc']")?.value || "";
    const tags = form.querySelector("input[name='seo-tags']")?.value || "";
    const score = Math.min(100, title.length + desc.length + tags.split(',').length * 6);
    output.innerHTML = `
      <div class="pill success">Score ${score}%</div>
      <p><strong>Título:</strong> ${title || "Defina um título com palavra-chave"}</p>
      <p><strong>Descrição:</strong> ${desc || "Liste benefícios, uso e garantia"}</p>
      <p><strong>Tags:</strong> ${tags || "Inclua 5-8 tags relevantes"}</p>
    `;
    output.classList.add("visible");
  });
}

function initCouponTool() {
  const form = document.getElementById("coupon-form");
  const preview = document.getElementById("coupon-preview");
  if (!form || !preview) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = form.querySelector("input[name='cupom']")?.value || "XYTOOLS";
    const desconto = form.querySelector("input[name='desconto']")?.value || "10";
    const minimo = form.querySelector("input[name='minimo']")?.value || "0";
    const validade = form.querySelector("input[name='validade']")?.value || "7 dias";
    const codigo = `${nome.toUpperCase().replace(/\s+/g, '')}-${desconto}OFF`;
    preview.innerHTML = `
      <div class="pill info">${codigo}</div>
      <p><strong>Desconto:</strong> ${desconto}%</p>
      <p><strong>Mínimo:</strong> R$ ${minimo}</p>
      <p><strong>Validade:</strong> ${validade}</p>
    `;
    preview.classList.add("visible");
  });
}

function initTrackTool() {
  const form = document.getElementById("track-form");
  const list = document.getElementById("track-result");
  if (!form || !list) return;
  const steps = [
    "Etiqueta gerada",
    "Objeto coletado",
    "Em rota para centro",
    "Saiu para entrega",
    "Entregue"
  ];
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = form.querySelector("input[name='codigo']")?.value || "XY0001";
    const progress = Math.floor(Math.random() * steps.length) + 1;
    list.innerHTML = `<p><strong>Código:</strong> ${code}</p>` +
      steps.slice(0, progress).map((s, idx) => `<div class="step"><span>${idx + 1}</span> ${s}</div>`).join("");
    list.classList.add("visible");
  });
}

function initPriceTool() {
  const form = document.getElementById("price-form");
  const box = document.getElementById("price-output");
  if (!form || !box) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const custo = parseFloat(form.querySelector("input[name='custo']")?.value || "0");
    const conc = parseFloat(form.querySelector("input[name='conc']")?.value || "0");
    const margem = parseFloat(form.querySelector("input[name='margem']")?.value || "20");
    const sugerido = Math.max(conc - 1, (custo / (1 - margem / 100)).toFixed(2));
    box.innerHTML = `<div class="pill success">Preço sugerido: R$ ${sugerido}</div>`;
    box.classList.add("visible");
  });
}

function initPlannerTool() {
  const form = document.getElementById("planner-form");
  const out = document.getElementById("planner-output");
  if (!form || !out) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const turno = form.querySelector("select[name='turno']")?.value || "Manhã";
    const foco = form.querySelector("input[name='foco']")?.value || "Campanha";
    const acao = form.querySelector("textarea[name='acao']")?.value || "Revisar anúncios";
    out.innerHTML = `<div class="pill accent">${turno}</div><p><strong>Foco:</strong> ${foco}</p><p>${acao}</p>`;
    out.classList.add("visible");
  });
}

function initFreteTool() {
  const form = document.getElementById("frete-form");
  const out = document.getElementById("frete-output");
  if (!form || !out) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const peso = parseFloat(form.querySelector("input[name='peso']")?.value || "0");
    const prazo = form.querySelector("input[name='prazo']")?.value || "2 dias";
    const base = 9.9 + peso * 1.2;
    out.innerHTML = `<div class="pill info">Frete estimado: R$ ${base.toFixed(2)}</div><p><strong>Prazo:</strong> ${prazo}</p>`;
    out.classList.add("visible");
  });
}

function initFxTool() {
  const form = document.getElementById("fx-form");
  const out = document.getElementById("fx-output");
  if (!form || !out) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const usd = parseFloat(form.querySelector("input[name='usd']")?.value || "1");
    const rate = 5.1;
    out.innerHTML = `<div class="pill success">R$ ${(usd * rate).toFixed(2)} (taxa 5.1)</div>`;
    out.classList.add("visible");
  });
}

function initTagsTool() {
  const form = document.getElementById("tags-form");
  const out = document.getElementById("tags-output");
  if (!form || !out) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = form.querySelector("input[name='produto']")?.value || "";
    const words = texto.split(/\s+/).filter((w) => w.length > 3).slice(0, 8);
    out.innerHTML = `<div class="pill info">Tags</div><p>${words.join(', ') || 'Adicione palavras do produto'}</p>`;
    out.classList.add("visible");
  });
}

function initAutoBuilder() {
  const form = document.getElementById("auto-form");
  const log = document.getElementById("auto-log");
  if (!form || !log) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const evento = form.querySelector("select[name='evento']")?.value;
    const canal = form.querySelector("select[name='canal']")?.value;
    const msg = form.querySelector("textarea[name='mensagem']")?.value || "Mensagem automática";
    const snippet = `// Exemplo JS\nfetch('https://api.xytools.local/webhook', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ evento: '${evento}', canal: '${canal}', mensagem: '${msg}' })\n});\n\n# Python requests\nimport requests\nrequests.post('https://api.xytools.local/webhook', json={\n  'evento': '${evento}', 'canal': '${canal}', 'mensagem': '${msg}'\n})`;
    const card = document.createElement("div");
    card.className = "log-card";
    card.innerHTML = `<div class="pill info">${evento} → ${canal}</div><pre>${snippet}</pre>`;
    log.prepend(card);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initPWA();
  const page = document.body.dataset.page || "home";
  markActiveNav(page);
  if (page === "login") {
    initLoginPage();
  } else {
    handleSplash(page);
  }
  handleScrollReveal();
  initAnchors();
  initSeoTool();
  initCouponTool();
  initTrackTool();
  initPriceTool();
  initPlannerTool();
  initFreteTool();
  initFxTool();
  initTagsTool();
  initAutoBuilder();
});
