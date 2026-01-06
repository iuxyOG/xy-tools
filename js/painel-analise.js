function formatBRL(v) {
  if (!isFinite(v)) return "R$ 0,00";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const state = {
  fatChart: null,
  qtdChart: null
};

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("fileInput");
  if (input) {
    input.addEventListener("change", handleFile);
  }
});

function setStatus(text, tone = "muted") {
  const pill = document.getElementById("status-pill");
  if (!pill) return;
  pill.textContent = text;
  pill.className = `pill ${tone}`;
}

function handleFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  setStatus("Lendo arquivo...", "muted");
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws, { defval: null });
      if (!json.length) throw new Error("Planilha vazia.");
      processData(json);
      setStatus("Dados carregados", "success");
    } catch (err) {
      console.error(err);
      setStatus("Erro ao ler XLSX", "warning");
      alert(err.message || "Nao foi possivel ler o arquivo.");
    }
  };
  reader.onerror = () => {
    setStatus("Erro ao ler arquivo", "warning");
    alert("Falha ao ler o arquivo. Tente novamente.");
  };
  reader.readAsArrayBuffer(file);
}

function processData(rows) {
  if (!rows || !rows.length) return;

  const firstRow = rows[0];

  const colNome = findCol(firstRow, ["product name","nome do produto","item_name","product","sku name"]);
  const colSku  = findCol(firstRow, ["parent sku","parentsku","sku","item_sku"]);
  const colQtd  = findCol(firstRow, ["sales volume","quantity","sold qty","qtd","units"]);
  const colFat  = findCol(firstRow, ["gmv","total amount","faturamento","amount","revenue","total"]);

  const map = new Map();

  rows.forEach((r) => {
    const nome = (r[colNome] || r[colSku] || "Produto sem nome").toString();
    const qtd = Number(r[colQtd] || 0);
    const fat = Number(r[colFat] || 0);

    if (!map.has(nome)) {
      map.set(nome, { nome, qtd: 0, fat: 0 });
    }
    const item = map.get(nome);
    item.qtd += qtd;
    item.fat += fat;
  });

  const lista = Array.from(map.values()).sort((a, b) => b.fat - a.fat);

  const fatTotal = lista.reduce((s, i) => s + i.fat, 0);
  const qtdTotal = lista.reduce((s, i) => s + i.qtd, 0);
  const ticket = qtdTotal > 0 ? fatTotal / qtdTotal : 0;

  const resumo = document.getElementById("resumoGeral");
  if (resumo) resumo.hidden = false;
  document.getElementById("fatTotal").textContent = formatBRL(fatTotal);
  document.getElementById("unidades").textContent = qtdTotal.toString();
  document.getElementById("ticket").textContent = formatBRL(ticket);
  document.getElementById("skus").textContent = lista.length.toString();

  renderTabela(lista);
  renderCharts(lista);
}

function renderTabela(lista) {
  const tbody = document.querySelector("#tabelaProdutos tbody");
  const totalLinhas = document.getElementById("totalLinhas");
  if (!tbody) return;
  tbody.innerHTML = "";
  const linhas = lista.slice(0, 50);
  linhas.forEach((p) => {
    const tr = document.createElement("tr");
    const ticket = p.qtd > 0 ? p.fat / p.qtd : 0;
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.qtd}</td>
      <td>${formatBRL(p.fat)}</td>
      <td>${formatBRL(ticket)}</td>
    `;
    tbody.appendChild(tr);
  });
  if (totalLinhas) {
    totalLinhas.textContent = `${linhas.length} linhas`;
  }
}

function renderCharts(lista) {
  const topFat = lista.slice(0, 10);
  const topQtd = [...lista].sort((a, b) => b.qtd - a.qtd).slice(0, 10);

  const labelsFat = topFat.map((p) => p.nome.substring(0, 24));
  const valuesFat = topFat.map((p) => p.fat);
  const labelsQtd = topQtd.map((p) => p.nome.substring(0, 24));
  const valuesQtd = topQtd.map((p) => p.qtd);

  const palette = [
    "#ff8a3d", "#6dd3c2", "#6ea8ff", "#ffd166", "#c792ea",
    "#72efdd", "#f28b82", "#5ad1e6", "#8bc34a", "#b388ff"
  ];

  const ctxFat = document.getElementById("chartFaturamento")?.getContext("2d");
  const ctxQtd = document.getElementById("chartUnidades")?.getContext("2d");
  if (!ctxFat || !ctxQtd) return;

  if (state.fatChart) state.fatChart.destroy();
  if (state.qtdChart) state.qtdChart.destroy();

  state.fatChart = new Chart(ctxFat, {
    type: "bar",
    data: {
      labels: labelsFat,
      datasets: [{
        label: "Faturamento",
        data: valuesFat,
        backgroundColor: palette
      }]
    },
    options: chartOptions("Faturamento")
  });

  state.qtdChart = new Chart(ctxQtd, {
    type: "bar",
    data: {
      labels: labelsQtd,
      datasets: [{
        label: "Unidades",
        data: valuesQtd,
        backgroundColor: palette
      }]
    },
    options: chartOptions("Unidades")
  });
}

function chartOptions(label) {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y;
            return label === "Faturamento" ? formatBRL(v) : `${v} un`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#e8ecf5" },
        grid: { display: false }
      },
      y: {
        ticks: {
          color: "#9aa3b5",
          callback: (val) => label === "Faturamento" ? formatBRL(val) : val
        },
        grid: { color: "rgba(255,255,255,0.05)" }
      }
    }
  };
}

function findCol(row, names) {
  const keys = Object.keys(row);
  for (const key of keys) {
    const norm = key.toString().toLowerCase().trim();
    if (names.some((n) => norm.includes(n))) return key;
  }
  return keys[0];
}
