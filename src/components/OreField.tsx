"use client";

import { useEffect, useRef } from "react";
import { keepStill } from "@/lib/motion";

const SCALE = 4; // Page pixels per dither cell.
const FRAME_MS = 83; // About 12 frames a second.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** Slow ridges of ore: sums of sines, so a frame costs almost nothing. */
const field = (x: number, y: number, t: number) =>
  (Math.sin(x * 0.021 + t) + Math.sin(y * 0.034 - t * 0.7) + Math.sin((x + y) * 0.013 + t * 0.4)) / 6 + 0.5;

/**
 * The ground: a low-resolution ordered dither in the current depth's metal.
 * Sits behind everything; CSS paints a dot grid underneath for when it can't run.
 */
export function OreField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    const hex = () => getComputedStyle(document.documentElement).getPropertyValue("--metal").trim();
    let metal = hex();
    let img: ImageData;
    let timer: number | undefined;
    let idle: number | undefined;

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth / SCALE);
      canvas.height = Math.ceil(window.innerHeight / SCALE);
      img = ctx.createImageData(canvas.width, canvas.height);
    };

    const draw = () => {
      const r = parseInt(metal.slice(1, 3), 16);
      const g = parseInt(metal.slice(3, 5), 16);
      const b = parseInt(metal.slice(5, 7), 16);
      const t = performance.now() / 9000;
      const { data, width, height } = img;
      for (let y = 0, i = 0; y < height; y++) {
        for (let x = 0; x < width; x++, i += 4) {
          const v = field(x, y, t) - 0.36; // Bias keeps most of the page dark.
          const on = v > BAYER[(y & 3) * 4 + (x & 3)];
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = on ? 255 : 0;
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

    const onResize = () => {
      resize();
      start();
    };
    resize();
    // The ground is decoration, so it waits until the page has finished loading.
    const defer = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1200));
    idle = defer(start, { timeout: 2000 });

    // The metal only changes with the depth switch, so read it then, not every frame.
    const depth = new MutationObserver(() => {
      metal = hex();
      start();
    });
    depth.observe(document.documentElement, { attributes: true, attributeFilter: ["data-depth", "data-motion"] });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", start);
    return () => {
      stop();
      if (idle !== undefined) (window.cancelIdleCallback ?? window.clearTimeout)(idle);
      depth.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.1] [image-rendering:pixelated]" />;
}
