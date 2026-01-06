"use client";

import { useEffect } from "react";
import { me } from "../lib/session";

export default function Index() {
  useEffect(() => {
    (async () => {
      try {
        await me();
        window.location.replace("/dashboard");
      } catch {
        window.location.replace("/login");
      }
    })();
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div className="badge">
        <span className="badge-dot" />
        Carregando...
      </div>
    </div>
  );
}
