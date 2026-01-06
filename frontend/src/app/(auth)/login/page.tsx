"use client";

import { useMemo, useState } from "react";
import { login } from "../../../lib/session";
import { Alert, Button, Card, Input } from "../../../components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mostrar botões de email apenas quando habilitado
  const showDemoEmails = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS === "true";

  // Lista de emails via ENV (sem senha no código!)
  // Ex: NEXT_PUBLIC_DEMO_EMAILS="adm@value,dev@value,user1@value,user2@value,user3@value"
  const demoEmails = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_DEMO_EMAILS || "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      document.cookie = "valueai_boot=1; path=/; max-age=120";
      window.location.href = "/dashboard";
    } catch (err: any) {
      const status = err?.status as number | undefined;
      if (status) console.warn("Login failed", { status, message: err?.message });

      const message =
        status === 401 ? "Email ou senha incorretos." : "Não foi possível entrar. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <Card className="login-card animate-in">
        <div className="login-hero">
          <div className="login-logo">VA</div>
          <div>
            <h1 className="login-title">Value AI</h1>
            <div className="login-subtitle">
              Conteúdo premium para e-commerce, com eficiência real.
            </div>
          </div>
        </div>

        {/* Atalhos apenas de EMAIL (sem senha no código) */}
        {showDemoEmails && demoEmails.length > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {demoEmails.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmail(e)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                title={`Preencher ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="login-form" data-has-error={error ? "true" : "false"}>
          <Input
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@value.ai"
            autoComplete="email"
            className="login-input"
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="login-input"
          />

          {error ? (
            <Alert tone="danger" title="Não foi possível entrar">
              {error}
            </Alert>
          ) : null}

          <Button variant="primary" loading={loading} type="submit">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="login-footer">
          <span>Environment: BETA | Version: 1.0</span>
          <span>Status: Online</span>
        </div>
      </Card>
    </div>
  );
}
