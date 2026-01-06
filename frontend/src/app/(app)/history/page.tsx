"use client";

import { useEffect, useState } from "react";
import { ToastItem, ToastStack } from "../../../components/ToastStack";
import { API_BASE, apiFetch } from "../../../lib/api";

type Record = {
  id: string;
  createdAt: number;
  productName: string;
  productType: string;
  targetAudience: string;
  salesChannel: string;
  mediaType: string;
  mediaUrl?: string | null;
  cost: number;
  title: string;
  description: string;
};

export default function HistoryPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [selected, setSelected] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const buildMediaUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE}${url}`;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<Record[]>("/api/content/history?limit=50");
        setRecords(data);
      } catch (e: any) {
        setError(e?.message || "Falha ao carregar histórico");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function pushToast(message: string) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2200);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    pushToast("Copiado");
  }

  const selectedMediaUrl = selected?.mediaUrl ? buildMediaUrl(selected.mediaUrl) : null;

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: ".01em", lineHeight: 1.1 }}>Histórico</h1>
      <div className="muted" style={{ marginTop: 8 }}>
        Últimos conteúdos gerados nesta instância.
      </div>

      {error && (
        <div style={{ marginTop: 14, border: "1px solid rgba(239,68,68,.35)", background: "rgba(239,68,68,.10)", padding: 10, borderRadius: 12 }}>
          <div style={{ fontWeight: 800, color: "#FFB4B4" }}>Erro</div>
          <div className="muted" style={{ marginTop: 6 }}>{error}</div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginTop: 12, alignItems: "start" }}>
        <div className="surface" style={{ padding: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Registros</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Clique em um item para ver os detalhes.
          </div>

          <div style={{ marginTop: 12, overflow: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Mídia</th>
                  <th>Créditos</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="muted2">Carregando...</td>
                  </tr>
                )}
                {!loading && records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted2">Nenhum conteúdo gerado ainda.</td>
                  </tr>
                )}
                {records.map((r) => {
                  const active = selected?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      style={{ cursor: "pointer", background: active ? "rgba(255,122,26,.07)" : "transparent" }}
                    >
                      <td className="muted2">{new Date(r.createdAt).toLocaleString()}</td>
                      <td style={{ fontWeight: 700 }}>{r.productName}</td>
                      <td className="muted2">{r.mediaType}</td>
                      <td className="muted2">{r.cost}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="surface" style={{ padding: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Detalhes</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Título e descrição completos.
          </div>

          {!selected && (
            <div className="muted2" style={{ marginTop: 14 }}>
              Selecione um registro para visualizar.
            </div>
          )}

          {selected && (
            <div style={{ marginTop: 12 }} className="grid">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div className="muted2" style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase" }}>
                  Título
                </div>
                <button className="btn" onClick={() => copy(selected.title)}>Copiar</button>
              </div>
              <div className="codebox" style={{ fontWeight: 700 }}>{selected.title}</div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div className="muted2" style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase" }}>
                  Descrição
                </div>
                <button className="btn" onClick={() => copy(selected.description)}>Copiar</button>
              </div>
              <div className="codebox" style={{ whiteSpace: "pre-wrap" }}>{selected.description}</div>

              {selectedMediaUrl && (
                <div className="grid" style={{ gap: 8 }}>
                  <div className="muted2" style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase" }}>
                    Mídia
                  </div>
                  <a className="muted2" href={selectedMediaUrl} target="_blank" rel="noreferrer">
                    {selectedMediaUrl}
                  </a>
                  {selected.mediaType === "image" && (
                    <img src={selectedMediaUrl} alt="Mídia enviada" style={{ width: "100%", borderRadius: 12 }} />
                  )}
                  {selected.mediaType === "video" && (
                    <video src={selectedMediaUrl} controls style={{ width: "100%", borderRadius: 12 }} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ToastStack items={toasts} onDismiss={dismissToast} />
    </div>
  );
}
