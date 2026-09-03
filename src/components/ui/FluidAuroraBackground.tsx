"use client";

import React, { useEffect, useRef } from "react";

interface AuroraOrb {
  baseX: number; // 0..1
  baseY: number; // 0..1
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
  phaseX: number;
  phaseY: number;
  radiusFactor: number;
  baseHue: number;
  hueSpeed: number;
  alpha: number;
}

const ORBS: AuroraOrb[] = [
  // Orb 1: Upper-left (Emerald -> Cyan -> Indigo -> Rose -> Amber)
  {
    baseX: 0.25,
    baseY: 0.2,
    ampX: 0.2,
    ampY: 0.15,
    freqX: 0.00035,
    freqY: 0.00045,
    phaseX: 0,
    phaseY: 1.2,
    radiusFactor: 0.55,
    baseHue: 160,
    hueSpeed: 0.008,
    alpha: 0.28,
  },
  // Orb 2: Upper-right (Coral -> Amber -> Mint -> Sky Blue -> Violet)
  {
    baseX: 0.75,
    baseY: 0.25,
    ampX: 0.18,
    ampY: 0.2,
    freqX: 0.0004,
    freqY: 0.0003,
    phaseX: 2.1,
    phaseY: 0.5,
    radiusFactor: 0.6,
    baseHue: 345,
    hueSpeed: 0.007,
    alpha: 0.26,
  },
  // Orb 3: Center Mid-Screen (Sky Blue -> Violet -> Crimson -> Gold)
  {
    baseX: 0.5,
    baseY: 0.55,
    ampX: 0.25,
    ampY: 0.2,
    freqX: 0.00028,
    freqY: 0.00038,
    phaseX: 4.3,
    phaseY: 3.1,
    radiusFactor: 0.65,
    baseHue: 205,
    hueSpeed: 0.009,
    alpha: 0.25,
  },
  // Orb 4: Lower-right (Violet -> Magenta -> Mint -> Amber)
  {
    baseX: 0.8,
    baseY: 0.75,
    ampX: 0.15,
    ampY: 0.18,
    freqX: 0.00032,
    freqY: 0.00042,
    phaseX: 1.5,
    phaseY: 4.8,
    radiusFactor: 0.55,
    baseHue: 275,
    hueSpeed: 0.006,
    alpha: 0.24,
  },
  // Orb 5: Lower-left (Warm Amber / Gold -> Ruby -> Purple -> Fresh Green)
  {
    baseX: 0.2,
    baseY: 0.8,
    ampX: 0.18,
    ampY: 0.16,
    freqX: 0.00042,
    freqY: 0.00032,
    phaseX: 5.2,
    phaseY: 2.7,
    radiusFactor: 0.6,
    baseHue: 35,
    hueSpeed: 0.008,
    alpha: 0.25,
  },
];

export function FluidAuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      const maxDim = Math.max(width, height);

      for (let i = 0; i < ORBS.length; i++) {
        const orb = ORBS[i];

        const x =
          (orb.baseX + orb.ampX * Math.sin(elapsed * orb.freqX + orb.phaseX)) * width;
        const y =
          (orb.baseY + orb.ampY * Math.cos(elapsed * orb.freqY + orb.phaseY)) * height;
        const radius = orb.radiusFactor * maxDim;

        const currentHue = (orb.baseHue + elapsed * orb.hueSpeed) % 360;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `hsla(${currentHue}, 85%, 60%, ${orb.alpha})`);
        grad.addColorStop(0.35, `hsla(${currentHue}, 80%, 55%, ${orb.alpha * 0.6})`);
        grad.addColorStop(
          0.7,
          `hsla(${(currentHue + 30) % 360}, 75%, 50%, ${orb.alpha * 0.18})`
        );
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          filter: "blur(40px)",
          transform: "translate3d(0, 0, 0)",
        }}
      />
    </div>
  );
}
