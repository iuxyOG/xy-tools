"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

type Plan = {
  id: string;
  name: string;
  monthlyCredits: number;
  pricingNote: string;
  consumption: { text: number; image: number; video: number };
};

type BillingState = {
  planId: string;
  credits: number;
  plan: { name: string; monthlyCredits: number };
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [state, setState] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, s] = await Promise.all([
          apiFetch<Plan[]>("/api/billing/plans"),
          apiFetch<BillingState>("/api/billing/state"),
        ]);
        setPlans(p);
        setState(s);
      } catch (e: any) {
        setError(e?.message || "Falha ao carregar planos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function selectPlan(planId: string) {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<BillingState>("/api/billing/select-plan", {
        method: "POST",
        body: JSON.stringify({ planId }),
      });
      setState(updated);
    } catch (e: any) {
      setError(e?.message || "Falha ao atualizar plano");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: ".01em", lineHeight: 1.1 }}>Planos</h1>
      <div className="muted" style={{ marginTop: 8 }}>
        Simulação de planos mensais com créditos. Sem cobrança nesta versão.
      </div>

      {error && (
        <div style={{ marginTop: 14, border: "1px solid rgba(239,68,68,.35)", background: "rgba(239,68,68,.10)", padding: 12, borderRadius: 14 }}>
          <div style={{ fontWeight: 800, color: "#FFB4B4" }}>Erro</div>
          <div className="muted" style={{ marginTop: 6 }}>{error}</div>
        </div>
      )}

      <div className="grid grid-3" style={{ marginTop: 18 }}>
        {(loading ? [1, 2, 3] : plans).map((p: any, idx: number) => {
          const plan = p as Plan;
          const isActive = state?.planId === plan?.id;
          return (
            <div key={plan?.id || idx} className="surface" style={{ padding: 14, opacity: loading ? 0.7 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{plan?.name || "..."}</div>
                {isActive && (
                  <span className="badge">
                    <span className="badge-dot" />
                    Ativo
                  </span>
                )}
              </div>
              <div className="muted" style={{ marginTop: 6 }}>{plan?.pricingNote || ""}</div>

              <div style={{ fontSize: 34, fontWeight: 900, marginTop: 12 }}>
                {plan?.monthlyCredits ?? "—"}
              </div>
              <div className="muted2" style={{ marginTop: 6 }}>créditos/mês</div>

              <hr className="hr" />

              <div className="muted2" style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase" }}>
                Consumo
              </div>
              <div className="muted" style={{ marginTop: 10, display: "grid", gap: 6 }}>
                <div>• Texto: <b style={{ color: "var(--text)" }}>{plan?.consumption?.text ?? "—"}</b></div>
                <div>• Imagem: <b style={{ color: "var(--text)" }}>{plan?.consumption?.image ?? "—"}</b></div>
                <div>• Vídeo: <b style={{ color: "var(--text)" }}>{plan?.consumption?.video ?? "—"}</b></div>
              </div>

              <div style={{ marginTop: 14 }}>
                <button
                  className={isActive ? "btn" : "btn btn-primary"}
                  disabled={loading || saving || isActive}
                  onClick={() => selectPlan(plan.id)}
                  style={{ width: "100%" }}
                >
                  {isActive ? "Plano atual" : saving ? "Salvando..." : "Selecionar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="surface" style={{ padding: 14, marginTop: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>Observações</div>
        <div className="muted" style={{ marginTop: 8 }}>
          Nesta fase, o sistema apenas simula a assinatura e o consumo de créditos.
          {" "}A estrutura e o layout já estão preparados para futura integração de pagamentos, usuários e permissões.
        </div>
      </div>
    </div>
  );
}

