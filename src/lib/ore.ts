// The ground's settings, shared by the canvas and the operators that control it.

export type Noise = "GIT" | "RIDGE" | "WAVE";
export type Pattern = "BAYER2" | "BAYER4";
export type Palette = "GRN" | "AMB" | "ICE";

export interface Ore {
  noise: Noise;
  speed: number;
  trail: number; // How long the cursor's mark lasts, 0 to 0.95.
  pattern: Pattern;
  density: number;
  scale: number; // Page pixels per dither cell.
  palette: Palette;
}

export const PALETTES: Record<Palette, string> = { GRN: "#3dff88", AMB: "#ffb547", ICE: "#7cc2e3" };

let state: Ore = { noise: "GIT", speed: 1, trail: 0.78, pattern: "BAYER2", density: 0.5, scale: 3, palette: "GRN" };
const listeners = new Set<() => void>();

export const getOre = () => state;

export const setOre = (patch: Partial<Ore>) => {
  state = { ...state, ...patch };
  if (patch.palette) document.documentElement.style.setProperty("--signal", PALETTES[patch.palette]);
  listeners.forEach((l) => l());
};

export const subscribeOre = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
