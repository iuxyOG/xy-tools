let currentMode = "normal";

function getTaxaShopee() {
  return currentMode === "normal" ? 0.14 : 0.20;
}

function formatarBRL(valor) {
  if (isNaN(valor) || !isFinite(valor)) {
    return "R$ 0,00";
  }
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/**
 * Calcula o preco de venda necessario para atingir uma margem desejada
 * descontando taxa Shopee, imposto e eventual taxa fixa.
 *
 * Formula base:
 *   P - (custo + extras + taxaShopee*P + imposto*P + taxaFixa) = margem * P
 *   => P * (1 - taxaShopee - imposto - margem) = custo+extras+taxaFixa
 *   => P = (custo+extras+taxaFixa) / (1 - taxaShopee - imposto - margem)
 */
function calcularPrecoPorMargem({ custo, extras, impostoPercent, margemPercent, taxaPercent }) {
  const base = custo + extras;
  const imposto = (impostoPercent || 0) / 100;
  const margem = (margemPercent || 0) / 100;

  const denom = 1 - taxaPercent - imposto - margem;
  if (denom <= 0) {
    return NaN;
  }

  const precoComFixa = (base + 4) / denom;
  const precoSemFixa = base / denom;

  // Shopee nao cobra taxa fixa acima de R$79
  return precoComFixa < 79 ? precoComFixa : precoSemFixa;
}

function calcular() {
  const custoEl = document.getElementById("custo");
  const extrasEl = document.getElementById("extras");
  const impostoEl = document.getElementById("imposto");
  const margemEl = document.getElementById("margem");
  const margemLabel = document.getElementById("margemLabel");
  const alertaEl = document.getElementById("alerta");
  const limiteInfo = document.getElementById("limiteInfo");
  const painelStatus = document.getElementById("painelStatus");

  const custo = parseFloat((custoEl.value || "").replace(",", ".")) || 0;
  const extras = parseFloat((extrasEl.value || "").replace(",", ".")) || 0;
  const imposto = parseFloat((impostoEl.value || "").replace(",", ".")) || 0;
  const margemPercent = parseFloat(margemEl.value || "0") || 0;

  if (margemLabel) {
    margemLabel.textContent = margemPercent.toFixed(0) + "%";
  }

  const taxaPercent = getTaxaShopee();
  const impostoFrac = imposto / 100;
  const margemFrac = margemPercent / 100;
  const espacoParaMargem = 1 - taxaPercent - impostoFrac;
  const folgaMinima = 0.1; // reserva minima para evitar precos irreais
  const margemMaxFrac = Math.max(0, espacoParaMargem - folgaMinima);
  const margemMaxPercent = Math.max(0, margemMaxFrac * 100);
  const margemUsadaFrac = Math.min(margemFrac, margemMaxFrac);
  const margemLimitada = margemFrac - margemUsadaFrac > 0.0001;

  if (limiteInfo) {
    if (espacoParaMargem <= 0) {
      limiteInfo.textContent = "Taxas + imposto ja ocupam 100% do preco.";
    } else {
      limiteInfo.textContent = `Margem viavel ate ~${margemMaxPercent.toFixed(0)}% considerando taxas, imposto e uma folga de 10%.`;
    }
  }

  let preco = 0;
  let alertaMsg = "";

  if (espacoParaMargem <= 0) {
    alertaMsg = "Taxa + imposto ultrapassam 100% do preco. Reduza o imposto ou altere o modo.";
  } else {
    preco = calcularPrecoPorMargem({
      custo,
      extras,
      impostoPercent: imposto,
      margemPercent: margemUsadaFrac * 100,
      taxaPercent
    });

    if (!isFinite(preco) || preco <= 0) {
      preco = 0;
      alertaMsg = "Ajuste os valores para encontrar um preco viavel.";
    } else if (margemLimitada) {
      alertaMsg = `Limitamos a margem para ${margemMaxPercent.toFixed(0)}% para caber taxa e imposto.`;
    }
  }

  const precoValido = preco > 0;
  const taxaShopeeValor = precoValido ? preco * taxaPercent : 0;
  const taxaFixaVal = precoValido && preco < 79 ? 4 : 0;
  const valorImposto = precoValido ? preco * impostoFrac : 0;
  const custosTotais = precoValido ? custo + extras + taxaShopeeValor + taxaFixaVal + valorImposto : custo + extras;
  const margemReais = precoValido ? preco - custosTotais : 0;

  document.getElementById("rpreco").textContent = formatarBRL(preco);
  document.getElementById("rcusto").textContent = formatarBRL(custo);
  document.getElementById("rextras").textContent = formatarBRL(extras);
  document.getElementById("rimposto").textContent = (imposto || 0).toFixed(2) + "%";
  document.getElementById("taxaPercent").textContent = (taxaPercent * 100).toFixed(0) + "%";
  document.getElementById("taxaNormal").textContent = formatarBRL(taxaShopeeValor);
  document.getElementById("taxaFixa").textContent = formatarBRL(taxaFixaVal);
  document.getElementById("custosTotais").textContent = formatarBRL(custosTotais);
  document.getElementById("lucro").textContent = formatarBRL(margemReais);

  if (alertaEl) {
    alertaEl.textContent = alertaMsg;
    alertaEl.className = alertaMsg ? "alerta show" : "alerta";
  }

  if (painelStatus) {
    if (alertaMsg) {
      painelStatus.textContent = "Revise os valores";
      painelStatus.className = "pill danger";
    } else if (margemLimitada) {
      painelStatus.textContent = "Margem limitada";
      painelStatus.className = "pill warning";
    } else {
      painelStatus.textContent = "Margem segura";
      painelStatus.className = "pill muted";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  if (splash) {
    setTimeout(() => splash.classList.add("hidden"), 900);
  }

  const inputs = document.querySelectorAll("#custo, #extras, #imposto, #margem");
  inputs.forEach((input) => {
    input.addEventListener("input", calcular);
  });

  const modeButtons = document.querySelectorAll(".mode-btn");
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
      calcular();
    });
  });

  calcular();
});
