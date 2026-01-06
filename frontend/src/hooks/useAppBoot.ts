"use client";

import { useEffect, useRef, useState } from "react";

type UseAppBootOptions = {
  durationMs?: number;
  fadeMs?: number;
};

export function useAppBoot(options: UseAppBootOptions = {}) {
  const { durationMs = 1800, fadeMs = 320 } = options;
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (pct >= 100) {
        setDone(true);
        return;
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [durationMs]);

  return { progress, done, fadeMs };
}
