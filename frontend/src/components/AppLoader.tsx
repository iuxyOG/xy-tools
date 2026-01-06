"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppBoot } from "../hooks/useAppBoot";

export function AppLoader() {
  const router = useRouter();
  const { progress, done, fadeMs } = useAppBoot();

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => {
      router.replace("/dashboard");
    }, fadeMs);
    return () => window.clearTimeout(t);
  }, [done, fadeMs, router]);

  return (
    <div className={`app-loader ${done ? "is-done" : ""}`}>
      <div className="app-loader__content">
        <div className="app-loader__title">VALUE AI</div>
        <div className="app-loader__subtitle">Studio de Conteúdo Inteligente</div>
        <div className="app-loader__bar" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="app-loader__meta">{progress}%</div>
      </div>
    </div>
  );
}
