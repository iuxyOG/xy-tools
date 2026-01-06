pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

const presetSelect = document.getElementById("preset");
const pdfFileInput = document.getElementById("pdfFile");
const outputFormatSelect = document.getElementById("outputFormat");
const colsInput = document.getElementById("cols");
const rowsInput = document.getElementById("rows");
const padXInput = document.getElementById("padX");
const padYInput = document.getElementById("padY");
const msgTextInput = document.getElementById("msgText");
const msgSizeInput = document.getElementById("msgSize");
const msgColorInput = document.getElementById("msgColor");
const posXInput = document.getElementById("posX");
const posYInput = document.getElementById("posY");
const previewEl = document.getElementById("preview");
const statusEl = document.getElementById("status");
const btnProcess = document.getElementById("btnProcess");
const btnSave = document.getElementById("btnSave");
const showBrandInput = document.getElementById("showBrand");

const presets = {
  shopee_a6: { name: "Shopee A6", cols: 1, rows: 1, padX: 0, padY: 0, output: "a6", pack: "single" },
  shopee_a4_2up: { name: "Shopee A4 2-up", cols: 1, rows: 1, padX: 0, padY: 0, output: "a4", pack: "a4_2up" },
  custom: { name: "Custom", cols: 1, rows: 1, padX: 0, padY: 0, output: "a6", pack: "single" }
};

const state = {
  pdf: null,
  etiquetas: [],
  pack: "single"
};

function setStatus(text) {
  if (!statusEl) return;
  statusEl.textContent = text;
}

function readNumber(el, fallback = 0) {
  const val = parseFloat(el?.value || fallback);
  return isFinite(val) ? val : fallback;
}

function applyPreset(key) {
  const cfg = presets[key] || presets.shopee_a6;
  colsInput.value = cfg.cols;
  rowsInput.value = cfg.rows;
  padXInput.value = cfg.padX;
  padYInput.value = cfg.padY;
  state.pack = cfg.pack || "single";

  // sync output select
  if (outputFormatSelect) outputFormatSelect.value = cfg.output || "a6";

  // brand toggle (only makes sense on A4)
  if (showBrandInput) showBrandInput.checked = (cfg.output === "a4") ? false : false;

  setStatus(`Preset aplicado: ${cfg.name || key}`);
}

(file) {
  const buffer = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data: buffer }).promise;
}

function overlayMensagem(ctx, w, h) {
  const text = (msgTextInput.value || "").trim();
  if (!text) return;
  const posX = Math.max(0, Math.min(100, readNumber(posXInput, 8))) / 100;
  const posY = Math.max(0, Math.min(100, readNumber(posYInput, 12))) / 100;
  const size = Math.max(8, Math.min(48, readNumber(msgSizeInput, 18)));
  ctx.fillStyle = msgColorInput.value || "#ff7a00";
  ctx.font = `bold ${size}px "Inter", "Space Grotesk", Arial`;
  ctx.textBaseline = "top";
  ctx.fillText(text, w * posX, h * posY);
}

async function extrairEtiquetas(pdf) {
  const cols = Math.max(1, Math.min(3, readNumber(colsInput, 2)));
  const rows = Math.max(1, Math.min(4, readNumber(rowsInput, 2)));
  const padX = Math.max(0, readNumber(padXInput, 0));
  const padY = Math.max(0, readNumber(padYInput, 0));

  const etiquetas = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;

    const etiquetaW = (canvas.width - padX * 2) / cols;
    const etiquetaH = (canvas.height - padY * 2) / rows;

    if (etiquetaW <= 0 || etiquetaH <= 0) {
      throw new Error("Recorte invalido: ajuste margens e grades.");
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sub = document.createElement("canvas");
        const subCtx = sub.getContext("2d");
        sub.width = etiquetaW;
        sub.height = etiquetaH;
        subCtx.drawImage(
          canvas,
          padX + c * etiquetaW,
          padY + r * etiquetaH,
          etiquetaW,
          etiquetaH,
          0,
          0,
          etiquetaW,
          etiquetaH
        );
        overlayMensagem(subCtx, etiquetaW, etiquetaH);
        etiquetas.push(sub.toDataURL("image/png"));
      }
    }
  }
  return etiquetas;
}

function renderPreview() {
  if (!previewEl) return;
  if (!state.etiquetas.length) {
    previewEl.textContent = "Nenhuma etiqueta processada.";
    return;
  }
  previewEl.innerHTML = "";
  state.etiquetas.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "etiqueta-img";
    previewEl.appendChild(img);
  });
}

function baixarPdfFinal() {
  if (!state.etiquetas.length) {
    alert("Nenhuma etiqueta processada.");
    return;
  }

  const out = (outputFormatSelect?.value || "a6").toLowerCase();
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: out === "a4" ? "a4" : [100, 150] // 10x15
  });

  const placeImage = (src, x, y, w, h) => {
    doc.addImage(src, "PNG", x, y, w, h, undefined, "FAST");
  };

  const maybeBrand = (pageWidth, pageHeight) => {
    const allow = (out === "a4") && !!showBrandInput?.checked;
    if (!allow) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("XY Tools · Powered by XY Works", pageWidth / 2, pageHeight - 4, { align: "center" });
    doc.setTextColor(0);
  };

  if (out === "a4" && state.pack === "a4_2up") {
    // A4 com 2 etiquetas por folha (topo + base), ideal para Shopee.
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 3;   // mm
    const gap = 1;      // mm
    const baseW = 100;  // mm
    const baseH = 150;  // mm

    const scale = Math.min(
      (pageWidth - margin * 2) / baseW,
      (pageHeight - margin * 2 - gap) / (baseH * 2)
    );

    const w = baseW * scale;
    const h = baseH * scale;
    const x = (pageWidth - w) / 2;
    const y1 = margin;
    const y2 = margin + h + gap;

    for (let i = 0; i < state.etiquetas.length; i += 2) {
      if (i > 0) doc.addPage();

      placeImage(state.etiquetas[i], x, y1, w, h);
      if (state.etiquetas[i + 1]) placeImage(state.etiquetas[i + 1], x, y2, w, h);

      // linha de corte bem discreta
      doc.setDrawColor(210);
      doc.setLineWidth(0.1);
      doc.line(margin, y2 - (gap / 2), pageWidth - margin, y2 - (gap / 2));

      maybeBrand(pageWidth, pageHeight);
    }
  } else {
    // Saída padrão: 1 etiqueta por página (A6 10x15 ou A4 centralizada)
    state.etiquetas.forEach((src, idx) => {
      if (idx > 0) doc.addPage();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      if (out === "a4") {
        // centraliza em A4 com boa margem (impressão em folha)
        const margin = 10;
        const baseW = 100;
        const baseH = 150;
        const scale = Math.min((pageWidth - margin * 2) / baseW, (pageHeight - margin * 2) / baseH);
        const w = baseW * scale;
        const h = baseH * scale;
        const x = (pageWidth - w) / 2;
        const y = (pageHeight - h) / 2;
        placeImage(src, x, y, w, h);
        maybeBrand(pageWidth, pageHeight);
      } else {
        // A6 10x15: ocupa quase toda a etiqueta (ideal térmica)
        const margin = 2;
        const w = pageWidth - margin * 2;
        const h = pageHeight - margin * 2;
        placeImage(src, margin, margin, w, h);
      }
    });
  }

  doc.save("xy-tools-etiquetas-shopee.pdf");
}

async function processar() {
  if (!pdfFileInput.files.length) {
    alert("Selecione um PDF de etiquetas primeiro.");
    return;
  }
  setStatus("Processando PDF...", "muted");
  btnProcess.disabled = true;
  state.etiquetas = [];
  renderPreview();

  try {
    state.pdf = await carregarPdf(pdfFileInput.files[0]);
    state.etiquetas = await extrairEtiquetas(state.pdf);
    renderPreview();
    setStatus(`${state.etiquetas.length} etiquetas prontas`, "success");
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao processar PDF. Verifique se o arquivo e valido.");
    setStatus("Erro ao processar", "warning");
  } finally {
    btnProcess.disabled = false;
  }
}

function wireUI() {
  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => applyPreset(e.target.value));
  }
  if (pdfFileInput) {
    pdfFileInput.addEventListener("change", () => setStatus("Arquivo carregado. Clique em Processar."));
  }
  if (btnProcess) {
    btnProcess.addEventListener("click", processar);
  }
  if (btnSave) {
    btnSave.addEventListener("click", baixarPdfFinal);
  }
  applyPreset(presetSelect?.value || "shopee_a6");
}

document.addEventListener("DOMContentLoaded", () => {
  wireUI();
});
