// One answer to "should this move?", for the CSS-free parts of the site:
// the visitor's system setting, or the site's own Pause motion button.

const KEY = "refinery.motion";

export const motionPaused = () => {
  try {
    return localStorage.getItem(KEY) === "off";
  } catch {
    return false;
  }
};

export const setMotionPaused = (off: boolean) => {
  try {
    localStorage.setItem(KEY, off ? "off" : "on");
  } catch {}
  document.documentElement.dataset.motion = off ? "off" : "on";
};

export const prefersStill = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const keepStill = () => prefersStill() || motionPaused();
