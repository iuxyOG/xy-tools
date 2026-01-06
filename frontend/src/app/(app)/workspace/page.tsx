"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch, resolvePublicUrl } from "@/lib/api";
import { Badge, Button, Card, Input } from "@/components/ui";

type ProjectStatus = "draft" | "generating" | "ready" | "failed";

type Project = {
  id: string;
  createdAt: string;
  updatedAt: string;
  productName: string;
  productType: string;
  targetAudience: string;
  specs: string;
  salesChannel: "Shopee";
  status: ProjectStatus;
  progress?: { stage: string; percent: number; updatedAt: string } | null;
  content?: { title: string; titleOptions: string[]; description: string } | null;
  media?: {
    originalUrl?: string | null;
    cutoutUrl?: string | null;
    catalogUrl?: string | null;
    measuresUrl?: string | null;
    packZipUrl?: string | null;
  } | null;
  lastError?: string | null;
};

type ImageMeta = {
  width: number;
  height: number;
  sizeLabel: string;
};

const steps = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Anúncio" },
  { id: 3, label: "Resultado" },
];

export default function WorkspacePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [audience, setAudience] = useState("");
  const [differentials, setDifferentials] = useState("");

  const [measures, setMeasures] = useState("");
  const [material, setMaterial] = useState("");
  const [packageContents, setPackageContents] = useState("");

  const [tone, setTone] = useState("Profissional");
  const [marketplace, setMarketplace] = useState("Shopee");

  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [descDraft, setDescDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);

  const canContinue = useMemo(() => Boolean(file), [file]);
  const canGenerate = useMemo(() => productName.trim() && category.trim() && audience.trim(), [productName, category, audience]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setImageMeta(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.width,
        height: img.height,
        sizeLabel: formatBytes(file.size),
      });
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!project?.content?.description || editingDesc) return;
    setDescDraft(project.content.description);
  }, [project?.content?.description, editingDesc]);

  useEffect(() => {
    if (!project?.id) return;
    if (project.status !== "generating") return;

    const t = window.setInterval(async () => {
      try {
        const fresh = await apiFetch<Project>(`/api/projects/${project.id}`);
        setProject(fresh);
      } catch {}
    }, 1500);

    return () => window.clearInterval(t);
  }, [project?.id, project?.status]);

  function onDropFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setFile(files[0]);
  }

  function buildSpecs() {
    const blocks = [
      `Diferenciais: ${differentials || "Não informado"}`,
      `Medidas: ${measures || "Não informado"}`,
      `Material: ${material || "Não informado"}`,
      `Conteúdo da embalagem: ${packageContents || "Não informado"}`,
      `Tom: ${tone}`,
      `Marketplace: ${marketplace}`,
    ];
    return blocks.join(", ");
  }

  async function handleGenerate() {
    setError(null);
    setSaveNote(null);
    setSaving(true);
    try {
      const fd = new FormData();
      if (file) fd.append("media", file);
      fd.append("productName", productName);
      fd.append("productType", category);
      fd.append("targetAudience", audience);
      fd.append("specs", buildSpecs());

      const created = await apiFetch<Project>("/api/projects", { method: "POST", body: fd });
      setProject(created);
      setStep(3);

      await apiFetch<Project>(`/api/projects/${created.id}/generate`, { method: "POST" });
    } catch (e: any) {
      setError(e?.message || "Falha ao criar projeto");
    } finally {
      setSaving(false);
    }
  }

  function copyText(text: string) {
    if (!text) return;
    navigator.clipboard?.writeText(text);
  }

  function copyAll() {
    if (!project?.content) return;
    const payload = `${project.content.title}\n\n${descDraft || project.content.description}`;
    copyText(payload);
  }

  function saveProject() {
    if (!project) return;
    setSaveNote("Projeto salvo localmente.");
    window.setTimeout(() => setSaveNote(null), 2200);
  }

  function exportAll() {
    copyAll();
    if (packUrl) window.open(packUrl, "_blank");
  }

  const packUrl = project?.media?.packZipUrl ? resolvePublicUrl(project.media.packZipUrl) : null;
  const imageList = [project?.media?.catalogUrl, project?.media?.measuresUrl, project?.media?.cutoutUrl].filter(Boolean) as string[];
  const hasResult = project?.status === "ready" && project.content;

  const sideMetrics = {
    credits: project ? 18 : 0,
    avgTime: project ? "2m 40s" : "—",
    score: project ? "92" : "—",
  };

  return (
    <div className="studio-layout">
      <div className="studio-main">
        <div className="studio-stepper">
          {steps.map((item, idx) => {
            const active = step === item.id;
            const done = step > item.id;
            return (
              <div key={item.id} className={`studio-step ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}>
                <div className="studio-step__dot">{item.id}</div>
                <div className="studio-step__label">{item.label}</div>
                {idx < steps.length - 1 ? <div className="studio-step__line" /> : null}
              </div>
            );
          })}
        </div>

        <div className="studio-stage">
          {step === 1 && (
            <Card className="studio-card animate-in">
              <div className="studio-card__header">
                <div>
                  <div className="studio-card__kicker">Etapa 1</div>
                  <h2>Upload</h2>
                  <p className="muted">Envie a imagem principal para gerar o anúncio.</p>
                </div>
                <Badge tone={file ? "success" : "warning"}>{file ? "Arquivo OK" : "Aguardando"}</Badge>
              </div>

              <div
                className={`studio-dropzone ${file ? "is-filled" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onDropFiles(e.dataTransfer.files);
                }}
              >
                <div className="studio-dropzone__icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 3l3.5 3.5-1.4 1.4L13 6.8V14h-2V6.8L9.9 7.9 8.5 6.5 12 3zm-6 14h12v2H6v-2z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Dropzone premium</div>
                  <div className="muted" style={{ marginTop: 4 }}>
                    Arraste uma imagem ou selecione um arquivo (JPG, PNG, WEBP).
                  </div>
                </div>
                <label className="btn">
                  Selecionar arquivo
                  <input type="file" accept="image/*" onChange={(e) => onDropFiles(e.target.files)} style={{ display: "none" }} />
                </label>
              </div>

              <div className="studio-preview">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" />
                    <div className="studio-preview__meta">
                      <div>
                        <div className="muted2">Nome do arquivo</div>
                        <div>{file?.name || "—"}</div>
                      </div>
                      <div>
                        <div className="muted2">Resolução</div>
                        <div>{imageMeta ? `${imageMeta.width} x ${imageMeta.height}` : "—"}</div>
                      </div>
                      <div>
                        <div className="muted2">Peso</div>
                        <div>{imageMeta?.sizeLabel || "—"}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="studio-preview__empty">
                    <div className="muted2">Preview aparecerá aqui após o upload.</div>
                  </div>
                )}
              </div>

              <div className="studio-actions">
                <Button variant="primary" disabled={!canContinue} onClick={() => setStep(2)}>
                  Continuar
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="studio-card animate-in">
              <div className="studio-card__header">
                <div>
                  <div className="studio-card__kicker">Etapa 2</div>
                  <h2>Configuração do anúncio</h2>
                  <p className="muted">Defina produto, specs e tom do anúncio antes da geração.</p>
                </div>
                <Badge tone={canGenerate ? "success" : "warning"}>{canGenerate ? "Pronto" : "Preencha"}</Badge>
              </div>

              <div className="studio-block">
                <div className="studio-block__title">Informações do Produto</div>
                <div className="studio-block__grid">
                  <Input label="Nome" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: Cadeira Office Prime" hint="Nome comercial que será exibido." />
                  <Input label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Cadeira ergonômica" hint="Categoria principal do produto." />
                  <Input label="Público-alvo" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex: profissionais em home office" hint="Para quem o anúncio será direcionado." />
                  <div className="ui-field">
                    <label className="ui-label muted2">Diferenciais</label>
                    <textarea className="textarea ui-input" value={differentials} onChange={(e) => setDifferentials(e.target.value)} placeholder="Ex: Encosto ajustável, base reforçada, espuma premium." rows={3} />
                    <div className="muted2">Liste até 3 diferenciais claros.</div>
                  </div>
                </div>
              </div>

              <div className="studio-block">
                <div className="studio-block__title">Especificações Técnicas</div>
                <div className="studio-block__grid">
                  <Input label="Medidas" value={measures} onChange={(e) => setMeasures(e.target.value)} placeholder="Ex: 120 x 60 x 60 cm" hint="Dimensões principais do produto." />
                  <Input label="Material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Ex: Aço + tecido premium" hint="Materiais ou acabamento." />
                  <div className="ui-field">
                    <label className="ui-label muted2">Conteúdo da embalagem</label>
                    <textarea className="textarea ui-input" value={packageContents} onChange={(e) => setPackageContents(e.target.value)} placeholder="Ex: 1 cadeira, 1 manual, kit de montagem." rows={3} />
                    <div className="muted2">Inclua itens relevantes para o cliente.</div>
                  </div>
                </div>
              </div>

              <div className="studio-block">
                <div className="studio-block__title">Estilo do Anúncio</div>
                <div className="studio-block__grid">
                  <div className="ui-field">
                    <label className="ui-label muted2">Tom</label>
                    <select className="input ui-input ui-select" value={tone} onChange={(e) => setTone(e.target.value)}>
                      <option>Profissional</option>
                      <option>Vendedor</option>
                      <option>Premium</option>
                      <option>Técnico</option>
                    </select>
                    <div className="muted2">Escolha o estilo de comunicação.</div>
                  </div>
                  <div className="ui-field">
                    <label className="ui-label muted2">Marketplace</label>
                    <select className="input ui-input ui-select" value={marketplace} onChange={(e) => setMarketplace(e.target.value)}>
                      <option>Shopee</option>
                      <option>Mercado Livre</option>
                      <option>TikTok</option>
                    </select>
                    <div className="muted2">Canal principal do anúncio.</div>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="ui-alert" data-tone="danger">
                  <div className="ui-alert__title">Erro</div>
                  <div className="ui-alert__content">{error}</div>
                </div>
              ) : null}

              <div className="studio-actions studio-actions--sticky">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button variant="primary" loading={saving} disabled={!canGenerate || saving} onClick={handleGenerate}>
                  {saving ? "Gerando..." : "Gerar anúncio"}
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="studio-card animate-in">
              <div className="studio-card__header">
                <div>
                  <div className="studio-card__kicker">Etapa 3</div>
                  <h2>Estúdio de Resultado</h2>
                  <p className="muted">Revise, edite e exporte os conteúdos gerados.</p>
                </div>
                <Badge tone={project?.status === "ready" ? "success" : "warning"}>
                  {project?.status === "ready"
                    ? "Gerado"
                    : project?.status === "failed"
                    ? "Falhou"
                    : project?.status === "generating"
                    ? "Gerando"
                    : "Aguardando"}
                </Badge>
              </div>

              {project?.status === "generating" ? (
                <div className="studio-skeleton">
                  <div className="skeleton" style={{ height: 18, width: "60%" }} />
                  <div className="skeleton" style={{ height: 120 }} />
                  <div className="skeleton" style={{ height: 180 }} />
                </div>
              ) : null}

              {!project ? (
                <div className="muted">Crie um projeto para visualizar os resultados.</div>
              ) : (
                <div className="studio-result-grid">
                  <Card className="studio-result-card">
                    <div className="studio-result__header">
                      <div>
                        <div className="studio-result__title">Título</div>
                        <div className="muted2">Preview do título gerado.</div>
                      </div>
                      {hasResult ? <Badge tone="success">Gerado</Badge> : <Badge>Em cache</Badge>}
                    </div>
                    <div className="codebox">{project.content?.title || "—"}</div>
                    <Button variant="ghost" disabled={!project.content?.title} onClick={() => copyText(project.content?.title || "")}>
                      Copiar
                    </Button>
                  </Card>

                  <Card className="studio-result-card">
                    <div className="studio-result__header">
                      <div>
                        <div className="studio-result__title">Descrição</div>
                        <div className="muted2">Prévia com scroll e edição.</div>
                      </div>
                      <Badge>Em cache</Badge>
                    </div>
                    {editingDesc ? (
                      <textarea className="textarea ui-input" value={descDraft} onChange={(e) => setDescDraft(e.target.value)} rows={8} />
                    ) : (
                      <div className="studio-description-preview">
                        {descDraft || project.content?.description || "—"}
                      </div>
                    )}
                    <div className="studio-result__actions">
                      <Button variant="ghost" disabled={!project.content?.description} onClick={() => copyText(descDraft || project.content?.description || "")}>
                        Copiar
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingDesc((prev) => !prev)}>
                        {editingDesc ? "Salvar" : "Editar"}
                      </Button>
                    </div>
                  </Card>

                  <Card className="studio-result-card">
                    <div className="studio-result__header">
                      <div>
                        <div className="studio-result__title">Pack de imagens</div>
                        <div className="muted2">Prévia dos assets gerados.</div>
                      </div>
                      {packUrl ? <Badge tone="success">Gerado</Badge> : <Badge>Em cache</Badge>}
                    </div>
                    <div className="studio-pack-grid">
                      {imageList.length ? (
                        imageList.map((url) => (
                          <img key={url} src={resolvePublicUrl(url)} alt="Preview pack" />
                        ))
                      ) : (
                        <>
                          <div className="skeleton" style={{ height: 110 }} />
                          <div className="skeleton" style={{ height: 110 }} />
                          <div className="skeleton" style={{ height: 110 }} />
                        </>
                      )}
                    </div>
                    <Button variant="primary" disabled={!packUrl} onClick={() => packUrl && window.open(packUrl, "_blank")}>
                      Baixar pack
                    </Button>
                  </Card>
                </div>
              )}

              <div className="studio-actions studio-actions--results">
                <Button variant="ghost" disabled={!project} onClick={saveProject}>
                  Salvar projeto
                </Button>
                <Link className="btn" href="/video-studio">
                  Criar vídeo <span className="muted2" style={{ fontSize: 12 }}>(BETA)</span>
                </Link>
                <Button variant="primary" disabled={!project} onClick={exportAll}>
                  Exportar tudo
                </Button>
              </div>
              {saveNote ? <div className="muted2">{saveNote}</div> : null}
            </Card>
          )}
        </div>
      </div>

      <aside className={`studio-side ${sideOpen ? "" : "is-collapsed"}`}>
        <Card className="studio-side__card">
          <div className="studio-side__header">
            <div>
              <div className="studio-card__kicker">Painel</div>
              <div style={{ fontWeight: 700 }}>Insights</div>
            </div>
            <button className="btn" type="button" onClick={() => setSideOpen((prev) => !prev)}>
              {sideOpen ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {sideOpen ? (
            <div className="studio-side__content">
              <div className="studio-side__item">
                <span className="muted2">Créditos consumidos</span>
                <strong>{sideMetrics.credits}</strong>
              </div>
              <div className="studio-side__item">
                <span className="muted2">Tempo médio</span>
                <strong>{sideMetrics.avgTime}</strong>
              </div>
              <div className="studio-side__item">
                <span className="muted2">Score de qualidade</span>
                <strong>{sideMetrics.score}</strong>
              </div>
              <div className="studio-side__hint">
                Indicadores simulados para análises rápidas durante o fluxo.
              </div>
            </div>
          ) : null}
        </Card>
      </aside>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}
