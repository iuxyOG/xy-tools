"use client";

import { useMemo, useState } from "react";
import { apiFetch, resolvePublicUrl } from "../../../lib/api";
import { Badge, Button, Card, Input } from "../../../components/ui";

type VideoBetaResult = {
  previewUrl: string;
  downloadUrl: string;
  durationSec: number;
};

export default function VideoStudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [productName, setProductName] = useState("");
  const [highlight1, setHighlight1] = useState("");
  const [highlight2, setHighlight2] = useState("");
  const [highlight3, setHighlight3] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoBetaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(() => {
    return Boolean(file && productName.trim() && highlight1.trim() && highlight2.trim() && highlight3.trim());
  }, [file, productName, highlight1, highlight2, highlight3]);

  async function handleGenerate() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("media", file);
      fd.append("productName", productName);
      fd.append("highlight1", highlight1);
      fd.append("highlight2", highlight2);
      fd.append("highlight3", highlight3);

      const data = await apiFetch<VideoBetaResult>("/api/video-beta/generate", {
        method: "POST",
        body: fd,
      });
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Falha ao gerar vídeo beta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: ".01em" }}>Video Studio</h1>
            <Badge tone="warning">BETA</Badge>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            Gere um MP4 com zoom/pan, blur de fundo e watermark para pré-visualização.
          </div>
        </div>
      </div>

      <div className="grid" style={{ gap: 16, gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, .9fr)" }}>
        <Card className="dash-card">
          <div style={{ fontWeight: 700, fontSize: 16 }}>Briefing do vídeo</div>
          <div className="muted" style={{ marginTop: 6 }}>Preencha os dados para compor a narrativa.</div>

          <div className="video-form">
            <div className="video-drop">
              <div className="muted">Upload imagem</div>
              <label className="btn" style={{ marginTop: 10 }}>
                Selecionar arquivo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
              </label>
              <div className="muted2" style={{ marginTop: 8 }}>
                {file ? `Selecionado: ${file.name}` : "Nenhum arquivo selecionado"}
              </div>
            </div>

            <Input
              label="Nome do produto"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Cadeira Office Prime"
            />

            <div className="grid" style={{ gap: 10 }}>
              <Input
                label="Frase de destaque 1"
                value={highlight1}
                onChange={(e) => setHighlight1(e.target.value)}
                placeholder="Ex: Conforto premium para longas jornadas"
              />
              <Input
                label="Frase de destaque 2"
                value={highlight2}
                onChange={(e) => setHighlight2(e.target.value)}
                placeholder="Ex: Design minimalista e ergonômico"
              />
              <Input
                label="Frase de destaque 3"
                value={highlight3}
                onChange={(e) => setHighlight3(e.target.value)}
                placeholder="Ex: Pronto para catálogo e campanhas"
              />
            </div>

            {error ? (
              <div className="ui-alert" data-tone="danger">
                <div className="ui-alert__title">Não foi possível gerar</div>
                <div className="ui-alert__content">{error}</div>
              </div>
            ) : null}

            <Button variant="primary" loading={loading} disabled={!canGenerate} onClick={handleGenerate}>
              {loading ? "Gerando..." : "Gerar vídeo"}
            </Button>
          </div>
        </Card>

        <Card className="dash-card">
          <div style={{ fontWeight: 700, fontSize: 16 }}>Preview e download</div>
          <div className="muted" style={{ marginTop: 6 }}>O vídeo exibirá watermark “Value AI Preview”.</div>

          <div className="video-preview">
            {result ? (
              <>
                <video src={resolvePublicUrl(result.previewUrl)} controls className="video-frame" />
                <div className="video-meta">
                  <span>Duração: {result.durationSec}s</span>
                  <a className="btn btn-primary" href={resolvePublicUrl(result.downloadUrl)}>
                    Baixar MP4
                  </a>
                </div>
              </>
            ) : (
              <div className="video-empty">
                <div className="muted2">Nenhum preview gerado ainda.</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
