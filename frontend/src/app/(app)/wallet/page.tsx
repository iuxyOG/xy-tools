"use client";

import { useMemo } from "react";
import { Badge, Card } from "../../../components/ui";

type LedgerItem = {
  id: string;
  title: string;
  type: "texto" | "imagem" | "video" | "narracao" | "export";
  credits: number;
  date: string;
};

const ledgerMock: LedgerItem[] = [
  { id: "l1", title: "Geração de texto: Kit Organizer", type: "texto", credits: 1, date: "Hoje, 09:48" },
  { id: "l2", title: "Exportação pack: Tênis Pulse X", type: "export", credits: 1, date: "Hoje, 08:32" },
  { id: "l3", title: "Geração de imagem: Mesa Aura", type: "imagem", credits: 2, date: "Ontem, 21:12" },
  { id: "l4", title: "Geração de vídeo: Cadeira Prime", type: "video", credits: 10, date: "Ontem, 18:05" },
  { id: "l5", title: "Narração: Vitrine Verão", type: "narracao", credits: 2, date: "Ontem, 16:44" },
];

const toneByType: Record<LedgerItem["type"], "neutral" | "success" | "warning" | "brand"> = {
  texto: "neutral",
  imagem: "brand",
  video: "warning",
  narracao: "brand",
  export: "success",
};

const labelByType: Record<LedgerItem["type"], string> = {
  texto: "Texto",
  imagem: "Imagem",
  video: "Vídeo",
  narracao: "Narração",
  export: "Exportação",
};

export default function WalletPage() {
  const stats = useMemo(() => {
    const monthlyCredits = 300;
    const usedCredits = 86;
    const remaining = monthlyCredits - usedCredits;
    const renewalDate = "01/11/2024";
    const usagePct = Math.min(100, Math.round((usedCredits / monthlyCredits) * 100));
    return { monthlyCredits, usedCredits, remaining, renewalDate, usagePct };
  }, []);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: ".01em" }}>Wallet de Créditos</h1>
          <div className="muted" style={{ marginTop: 8 }}>
            Controle de consumo, renovação mensal e histórico de uso.
          </div>
        </div>
        <Badge tone="success" dot>Online</Badge>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Card className="dash-card">
          <div className="muted2" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>
            Saldo atual
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 10 }}>{stats.remaining}</div>
          <div className="muted" style={{ marginTop: 6 }}>Créditos disponíveis</div>
        </Card>
        <Card className="dash-card">
          <div className="muted2" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>
            Renovação mensal
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 12 }}>{stats.renewalDate}</div>
          <div className="muted" style={{ marginTop: 6 }}>Plano reabastecido automaticamente</div>
        </Card>
        <Card className="dash-card">
          <div className="muted2" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>
            Uso mensal
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 12 }}>
            {stats.usedCredits} / {stats.monthlyCredits}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>{stats.usagePct}% consumido</div>
        </Card>
      </div>

      <Card className="dash-card">
        <div style={{ fontWeight: 700, fontSize: 16 }}>Barra de uso mensal</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Acompanhe a evolução do consumo no ciclo atual.
        </div>
        <div className="wallet-bar" style={{ marginTop: 14 }}>
          <span style={{ width: `${stats.usagePct}%` }} />
        </div>
        <div className="muted2" style={{ marginTop: 8 }}>
          Restam {stats.remaining} créditos antes da renovação.
        </div>
      </Card>

      <div className="grid" style={{ gap: 16, gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, .8fr)" }}>
        <Card className="dash-card">
          <div style={{ fontWeight: 700, fontSize: 16 }}>Ledger de atividades</div>
          <div className="muted" style={{ marginTop: 6 }}>Últimas movimentações simuladas.</div>

          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {ledgerMock.map((item) => (
              <div key={item.id} className="wallet-ledger">
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div className="muted2" style={{ fontSize: 12, marginTop: 4 }}>{item.date}</div>
                </div>
                <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                  <Badge tone={toneByType[item.type]}>{labelByType[item.type]}</Badge>
                  <div style={{ fontWeight: 700 }}>-{item.credits}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="dash-card">
          <div style={{ fontWeight: 700, fontSize: 16 }}>Tabela de custos</div>
          <div className="muted" style={{ marginTop: 6 }}>Referência de consumo por mídia.</div>

          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Créditos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Texto</td>
                <td>1 crédito</td>
              </tr>
              <tr>
                <td>Imagem</td>
                <td>2 créditos</td>
              </tr>
              <tr>
                <td>Vídeo</td>
                <td>10 créditos</td>
              </tr>
              <tr>
                <td>Narração</td>
                <td>2 créditos</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
