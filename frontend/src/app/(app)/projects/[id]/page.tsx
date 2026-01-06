"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch, resolvePublicUrl } from "@/lib/api";

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

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [p, setP] = useState<Project | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!id) return;
    try {
      const data = await apiFetch<Project>(`/api/projects/${id}`);
      setP(data);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || "Erro ao carregar projeto");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function regenerate() {
    if (!id) return;
    await apiFetch(`/api/projects/${id}/generate`, { method: "POST" });
    await load();
  }

  if (err) {
    return (
      <div className="container">
        <div className="surface" style={{ padding: 16, borderRadius: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Erro</div>
          <div className="muted">{err}</div>
          <div style={{ marginTop: 12 }}>
            <Link href="/projects" className="btn" style={{ borderRadius: 14 }}>
              Voltar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!p) return <div className="container"><div className="muted">Carregando...</div></div>;

  return (
    <div className="container">
      <div className="surface" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0 }}>{p.productName}</h2>
            <div className="muted" style={{ marginTop: 6 }}>
              {p.productType} • {p.targetAudience} • Shopee
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/projects" className="btn" style={{ borderRadius: 14 }}>
              Projetos
            </Link>
            <button className="btn btn-primary" onClick={regenerate} style={{ borderRadius: 14 }}>
              Regerar
            </button>
            {p.media?.packZipUrl ? (
              <a className="btn btn-primary" href={resolvePublicUrl(p.media.packZipUrl)} style={{ borderRadius: 14 }}>
                Baixar ZIP
              </a>
            ) : null}
          </div>
        </div>

        {p.progress ? (
          <div style={{ marginTop: 12 }}>
            <div className="muted">
              {p.progress.stage} • {p.progress.percent}%
            </div>
            <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden", marginTop: 8 }}>
              <div style={{ height: "100%", width: `${p.progress.percent}%`, background: "linear-gradient(90deg, var(--orange), var(--orange2))" }} />
            </div>
          </div>
        ) : null}

        {p.status === "failed" ? (
          <div className="surface" style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(239,68,68,.35)" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Falhou</div>
            <div className="muted">{p.lastError || "Tente novamente."}</div>
          </div>
        ) : null}
      </div>

      <div className="grid-2">
        <div className="surface" style={{ padding: 14, borderRadius: 16 }}>
          <div style={{ fontWeight: 950, marginBottom: 8 }}>Conteúdo</div>

          {p.content ? (
            <>
              <div className="muted">Título</div>
              <div className="codebox">{p.content.title}</div>

              <div className="muted" style={{ marginTop: 10 }}>Opções</div>
              <div className="codebox">{p.content.titleOptions.join("\n")}</div>

              <div className="muted" style={{ marginTop: 10 }}>Descrição</div>
              <div className="codebox" style={{ whiteSpace: "pre-wrap" }}>{p.content.description}</div>
            </>
          ) : (
            <div className="muted">Ainda gerando...</div>
          )}
        </div>

        <div className="surface" style={{ padding: 14, borderRadius: 16 }}>
          <div style={{ fontWeight: 950, marginBottom: 8 }}>Imagens</div>

          <div className="grid-2">
            {p.media?.catalogUrl ? (
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>Fundo branco</div>
                <img src={resolvePublicUrl(p.media.catalogUrl)} alt="catalog" style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(255,255,255,.10)" }} />
              </div>
            ) : null}
            {p.media?.measuresUrl ? (
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>Medidas</div>
                <img src={resolvePublicUrl(p.media.measuresUrl)} alt="measures" style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(255,255,255,.10)" }} />
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {p.media?.cutoutUrl ? (
              <a className="btn" href={resolvePublicUrl(p.media.cutoutUrl)} style={{ borderRadius: 14 }}>
                Baixar PNG sem fundo
              </a>
            ) : null}
            {p.media?.originalUrl ? (
              <a className="btn" href={resolvePublicUrl(p.media.originalUrl)} style={{ borderRadius: 14 }}>
                Ver original
              </a>
            ) : null}
          </div>

          <div className="muted" style={{ marginTop: 10 }}>
            Specs ficam no canto inferior direito (padrão Shopee).
          </div>
        </div>
      </div>
    </div>
  );
}
