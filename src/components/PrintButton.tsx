"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="chip tap no-print" data-on="true">
      PRINT OR SAVE AS PDF
    </button>
  );
}
