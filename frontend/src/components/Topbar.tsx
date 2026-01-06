"use client";

import { useEffect, useState } from "react";
import { logout, me, Me } from "../lib/session";
import { apiFetch } from "../lib/api";

type BillingState = {
  planId: string;
  credits: number;
  plan: { name: string; monthlyCredits: number };
};

export function Topbar() {
  const [user, setUser] = useState<Me | null>(null);
  const [billing, setBilling] = useState<BillingState | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await me();
        setUser(u);
        const b = await apiFetch<BillingState>("/api/billing/state");
        setBilling(b);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: "1px solid var(--stroke)",
        background:
          "linear-gradient(180deg, rgba(7,16,40,.55), rgba(7,16,40,.15))",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="badge">
          <span className="badge-dot" />
          MVP Interno
        </span>
        {billing && (
          <span className="badge">
            Plano: <b style={{ color: "var(--text)" }}>{billing.plan?.name}</b>
          </span>
        )}
        {billing && (
          <span className="badge">
            Créditos: <b style={{ color: "var(--text)" }}>{billing.credits}</b>
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            {user?.email || "—"}
          </div>
          <div className="muted2" style={{ fontSize: 12 }}>
            BETA 0.1
          </div>
        </div>
        <button className="btn" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}
