"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type ProjectStatus = "draft" | "generating" | "ready" | "failed";

type Project = {
  id: string;
  createdAt: string;
  updatedAt: string;
  productName: string;
  productType: string;
  targetAudience: string;
  specs: string;
  status: ProjectStatus;
  progress?: { stage: string; percent: number } | null;
  media?: { packZipUrl?: string | null } | null;
};

function statusTone(status: ProjectStatus) {
  if (status === "ready") return "rgba(34,197,94,.18)";
  if (status === "failed") return "rgba(239,68,68,.18)";
  if (status === "generating") return "rgba(255,122,26,.18)";
  return "rgba(59,130,246,.18)";
}

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch<Project[]>("/api/projects");
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) => `${p.productName} ${p.productType} ${p.targetAudience}`.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <div className="container">
      <div className="surface" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <h2 style={{ margin: 0 }}>Projetos</h2>
            <div className="muted" style={{ marginTop: 6 }}>
              Lista com status, reabertura e re-download do ZIP.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/workspace" className="btn btn-primary" style={{ borderRadius: 14 }}>
              Novo projeto
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <input className="textarea" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, tipo ou público-alvo..." />
          <button className="btn" onClick={load} style={{ borderRadius: 14, minWidth: 130 }}>
            Atualizar
          </button>
        </div>
      </div>

      {loading ? <div className="muted">Carregando...</div> : null}

      <div className="grid-2">
        {filtered.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="surface" style={{ padding: 14, borderRadius: 16, display: "block" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 950, marginBottom: 6 }}>{p.productName}</div>
                <div className="muted">
                  {p.productType} • {p.targetAudience}
                </div>
              </div>
              <span className="badge" style={{ background: statusTone(p.status), border: "1px solid rgba(255,255,255,.14)" }}>
                {p.status === "ready" ? "Pronto" : p.status === "failed" ? "Falhou" : p.status === "generating" ? "Gerando" : "Rascunho"}
              </span>
            </div>

            {p.progress?.percent != null ? (
              <div style={{ marginTop: 10 }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  {p.progress.stage} • {p.progress.percent}%
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden", marginTop: 6 }}>
                  <div style={{ height: "100%", width: `${p.progress.percent}%`, background: "linear-gradient(90deg, var(--orange), var(--orange2))" }} />
                </div>
              </div>
            ) : null}

            <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
              Atualizado: {new Date(p.updatedAt).toLocaleString()}
            </div>
          </Link>
        ))}
      </div>

      {!loading && filtered.length === 0 ? (
        <div className="surface" style={{ padding: 16, borderRadius: 16, marginTop: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Nada por aqui</div>
          <div className="muted">Crie seu primeiro projeto no Workspace.</div>
        </div>
      ) : null}
    </div>
  );
}
