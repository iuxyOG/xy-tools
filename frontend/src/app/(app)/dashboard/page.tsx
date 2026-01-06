"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";
import { Badge, Card } from "../../../components/ui";

type Stats = {
  generatedCount: number;
  billing: {
    planId: string;
    credits: number;
    plan: { name: string; monthlyCredits: number };
  };
};

type ActivityItem = {
  title: string;
  time: string;
  status: "draft" | "running" | "ready";
};

const activityMock: ActivityItem[] = [
  { title: "Projeto \"Cadeira Office Prime\" criado", time: "Hoje, 09:42", status: "draft" },
  { title: "Pack gerado para \"Tênis Pulse X\"", time: "Hoje, 08:05", status: "ready" },
  { title: "Geração em andamento: \"Kit Organizer\"", time: "Ontem, 21:18", status: "running" },
  { title: "Projeto \"Mesa Lateral Aura\" atualizado", time: "Ontem, 19:37", status: "draft" },
];

const statusTone: Record<ActivityItem["status"], "neutral" | "success" | "warning"> = {
  draft: "neutral",
  running: "warning",
  ready: "success",
};

const statusLabel: Record<ActivityItem["status"], string> = {
  draft: "Draft",
  running: "Gerando",
  ready: "Pronto",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await apiFetch<Stats>("/api/content/stats");
        setStats(s);
      } catch (e: any) {
        setError(e?.message || "Falha ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = useMemo(() => {
    const packs = stats?.generatedCount ?? 0;
    const projects = Math.max(4, packs + 6);
    const planCredits = stats?.billing?.plan?.monthlyCredits ?? 0;
    const creditsRemaining = stats?.billing?.credits ?? 0;
    const creditsUsed = Math.max(0, planCredits - creditsRemaining);
    const lastGen = packs ? "há 2h" : "sem registros";

    return [
      { label: "Projetos criados", value: loading ? "—" : projects.toString(), hint: "Workspaces ativos no mês" },
      { label: "Packs gerados", value: loading ? "—" : packs.toString(), hint: "Conteúdos finalizados" },
      { label: "Créditos usados", value: loading ? "—" : creditsUsed.toString(), hint: "Consumo do ciclo atual" },
      { label: "Última geração", value: loading ? "—" : lastGen, hint: "Atualização recente" },
    ];
  }, [loading, stats]);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: ".01em" }}>Dashboard</h1>
          <div className="muted" style={{ marginTop: 8 }}>
            Visão geral do workspace Value AI com indicadores operacionais.
          </div>
        </div>
        <Link href="/workspace" className="btn btn-primary">
          Criar anúncio
        </Link>
      </div>

      <Card className="dash-card animate-in">
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <div>
            <div className="muted2" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>
              Workspace ativo
            </div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>Value AI • Shopee</div>
          </div>
          <div>
            <div className="muted2" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>
              Plano
            </div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{loading ? "—" : stats?.billing?.plan?.name ?? "Starter"}</div>
          </div>
          <div>
            <div className="muted2" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>
              Créditos
            </div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{loading ? "—" : stats?.billing?.credits ?? 0}</div>
          </div>
          <div>
            <div className="muted2" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>
              Status
            </div>
            <div style={{ marginTop: 6 }}>
              <Badge tone="success" dot>Online</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid" style={{ gap: 16 }}>
        <div className="muted2" style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
          Indicadores
        </div>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="dash-card">
              <div className="muted2" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>{kpi.value}</div>
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                {kpi.hint}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {error ? (
        <Card className="dash-card" style={{ border: "1px solid rgba(239,68,68,.35)", background: "rgba(239,68,68,.08)" }}>
          <div style={{ fontWeight: 700, color: "#FFB4B4" }}>Erro ao carregar</div>
          <div className="muted" style={{ marginTop: 6 }}>{error}</div>
        </Card>
      ) : null}

      <div className="grid" style={{ gap: 16, gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, .8fr)" }}>
        <Card className="dash-card animate-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Ações rápidas</div>
              <div className="muted" style={{ marginTop: 6 }}>Fluxos essenciais para produção diária.</div>
            </div>
            <Badge tone="brand">Atalho</Badge>
          </div>

          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            <div className="dash-action">
              <div>
                <div style={{ fontWeight: 700 }}>Criar anúncio</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Wizard completo com mídia, specs e geração.</div>
              </div>
              <Link className="btn btn-primary" href="/workspace">Abrir</Link>
            </div>
            <div className="dash-action">
              <div>
                <div style={{ fontWeight: 700 }}>
                  Criar vídeo <span className="muted2" style={{ fontSize: 12 }}>(beta)</span>
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Storyboard e variações para campanhas.</div>
              </div>
              <Link className="btn" href="/video-studio">Abrir</Link>
            </div>
            <div className="dash-action">
              <div>
                <div style={{ fontWeight: 700 }}>Ver projetos</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Acompanhe status e histórico completo.</div>
              </div>
              <Link className="btn" href="/projects">Acessar</Link>
            </div>
          </div>
        </Card>

        <Card className="dash-card animate-in">
          <div style={{ fontWeight: 700, fontSize: 16 }}>Atividade recente</div>
          <div className="muted" style={{ marginTop: 6 }}>Eventos simulados das últimas 24 horas.</div>

          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {activityMock.map((item) => (
              <div key={item.title} className="dash-timeline">
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div className="muted2" style={{ fontSize: 12, marginTop: 4 }}>{item.time}</div>
                </div>
                <Badge tone={statusTone[item.status]}>{statusLabel[item.status]}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
