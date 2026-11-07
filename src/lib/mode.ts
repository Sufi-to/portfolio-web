// PATCH is the wired canvas; READ stacks the same panels as a plain page.

export type Mode = "patch" | "read";
const KEY = "refinery.mode";

export const getMode = (): Mode => {
  try {
    return localStorage.getItem(KEY) === "read" ? "read" : "patch";
  } catch {
    return "patch";
  }
};

export const setMode = (mode: Mode) => {
  try {
    localStorage.setItem(KEY, mode);
  } catch {}
  document.documentElement.dataset.mode = mode;
};
