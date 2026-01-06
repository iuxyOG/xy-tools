"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workspace", label: "Workspace Shopee" },
  { href: "/video-studio", label: "Video Studio (Beta)" },
  { href: "/projects", label: "Projetos" },
  { href: "/plans", label: "Planos" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        padding: 18,
        borderRight: "1px solid var(--stroke)",
        background:
          "linear-gradient(180deg, rgba(7,16,40,.90), rgba(10,22,54,.88))",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 10px 18px 10px",
      }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background:
              "radial-gradient(16px 16px at 30% 25%, rgba(255,154,74,.9), rgba(255,122,26,.85)), radial-gradient(24px 24px at 70% 70%, rgba(59,130,246,.55), rgba(7,16,40,0))",
            boxShadow: "0 10px 26px rgba(0,0,0,.28)",
            border: "1px solid rgba(255,255,255,.10)",
          }}
        />
        <div>
          <div style={{ fontWeight: 800, letterSpacing: ".02em" }}>
            Value AI
          </div>
          <div style={{ fontSize: 12 }} className="muted2">
            Conteúdo automático
          </div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {nav.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                border: active ? "1px solid rgba(255,122,26,.30)" : "1px solid transparent",
                background: active ? "rgba(255,122,26,.10)" : "transparent",
                color: active ? "var(--text)" : "var(--muted)",
                fontWeight: active ? 700 : 600,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 18 }}>
        <div className="badge">
          <span className="badge-dot" />
          BETA 0.1
        </div>
      </div>
    </aside>
  );
}
