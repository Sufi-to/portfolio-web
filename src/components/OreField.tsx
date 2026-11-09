"use client";

import { useEffect, useRef } from "react";
import { keepStill } from "@/lib/motion";
import bronze from "@/data/bronze.json";
import { getOre, PALETTES, subscribeOre } from "@/lib/ore";

// Commits per month, on a square-root scale from 0 to 1, as in the commit strata chart.
const totals = bronze.months.map((m) => m.systems + m.web + m.ai);
const peak = Math.max(...totals);
const MONTHS = totals.map((n) => Math.sqrt(n / peak));

const FRAME_MS = 83; // About 12 frames a second.
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const BAYER2 = [0, 2, 3, 1].map((v) => (v + 0.5) / 4);

/**
 * The ground: a low-resolution ordered dither, with a fading trail under the
 * cursor. Its operators on the home page change it live. Sits behind
 * everything; CSS paints a dot grid underneath for when it can't run.
 */
export function OreField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    let img: ImageData;
    let trail = new Float32Array(0);
    let timer: number | undefined;
    let idle: number | undefined;
    let drift = 0;
    let lastDraw = performance.now();
    let scale = 0;

    const resize = () => {
      scale = getOre().scale;
      // A hidden or collapsed window can report zero; a canvas needs at least one pixel.
      canvas.width = Math.max(1, Math.ceil(window.innerWidth / scale));
      canvas.height = Math.max(1, Math.ceil(window.innerHeight / scale));
      img = ctx.createImageData(canvas.width, canvas.height);
      trail = new Float32Array(canvas.width * canvas.height);
    };

    const draw = () => {
      const ore = getOre();
      if (ore.scale !== scale) resize();
      const hex = PALETTES[ore.palette];
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const now = performance.now();
      drift += ((now - lastDraw) / 9000) * ore.speed;
      lastDraw = now;
      const size = ore.pattern === "BAYER2" ? 2 : 4;
      const map = size === 2 ? BAYER2 : BAYER4;
      const bias = 0.8 - ore.density * 0.5; // More density lowers the bar for a lit cell.
      const k = scale / 3;
      const { data, width, height } = img;
      const t = drift;
      const veins = ore.noise !== "WAVE";
      const git = ore.noise === "GIT";
      // Each wave depends only on a row, a column or a diagonal, so one pass over
      // those lines replaces four sines per cell. Summing them gives slow noise;
      // folding the sum into veins gives thin lines instead of soft blobs.
      const [fx, fy, fd, fe] = veins ? [0.041, 0.067, 0.029, 0.053] : [0.021, 0.034, 0.013, 0];
      const across = Float32Array.from({ length: width }, (_, x) => Math.sin(x * k * fx + t));
      const down = Float32Array.from({ length: height }, (_, y) => Math.sin(y * k * fy - t * 0.7));
      const diag = Float32Array.from({ length: width + height }, (_, n) => Math.sin(n * k * fd + t * 0.4));
      // In git mode each column is a month, oldest on the left: busy months carry
      // rich veins, quiet ones fade to almost nothing.
      const weight = Float32Array.from({ length: width }, (_, x) => 0.25 + 1.35 * MONTHS[Math.min(MONTHS.length - 1, Math.floor((x / width) * MONTHS.length))]);
      const anti = Float32Array.from({ length: width + height }, (_, n) => (veins ? Math.sin((n - height) * k * fe - t * 0.5) : 0));
      for (let y = 0, i = 0, c = 0; y < height; y++) {
        for (let x = 0; x < width; x++, i += 4, c++) {
          trail[c] *= ore.trail;
          const n = across[x] + down[y] + diag[x + y] + anti[x - y + height];
          const f = veins ? 1 - Math.min(1, Math.abs(n) / 2.2) : n / 6 + 0.5;
          const v = f * f * f * (git ? weight[x] : 1) - bias + trail[c];
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = v > map[(y % size) * size + (x % size)] ? 255 : 0;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const stop = () => window.clearTimeout(timer);
    const loop = () => {
      draw();
      timer = window.setTimeout(loop, FRAME_MS);
    };
    const start = () => {
      stop();
      if (keepStill()) draw();
      else if (!document.hidden) loop();
    };

    // The cursor paints into the trail buffer; the frame loop fades it out.
    const onMove = (e: PointerEvent) => {
      if (keepStill()) return;
      const cx = Math.floor(e.clientX / scale);
      const cy = Math.floor(e.clientY / scale);
      const radius = Math.round(36 / scale);
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const d = 1 - Math.hypot(dx, dy) / radius;
          const x = cx + dx;
          const c = (cy + dy) * canvas.width + x;
          if (d > 0 && x >= 0 && x < canvas.width && c >= 0 && c < trail.length) trail[c] = Math.max(trail[c], d * 0.9);
        }
      }
    };

    const onResize = () => {
      resize();
      start();
    };
    resize();
    // The ground is decoration, so it waits until the page has finished loading.
    const defer = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1200));
    idle = defer(start, { timeout: 2000 });

    const motion = new MutationObserver(start);
    motion.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    const unsubscribe = subscribeOre(() => {
      if (keepStill()) draw();
    });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", start);
    return () => {
      stop();
      if (idle !== undefined) (window.cancelIdleCallback ?? window.clearTimeout)(idle);
      motion.disconnect();
      unsubscribe();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.28] [image-rendering:pixelated]" />;
}
