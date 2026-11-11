/**
 * A seal drawn from a fingerprint: each ring's petal count and depth come from
 * the hash's bytes, so the pattern is unique to the evidence it certifies and
 * changes whenever that evidence does.
 */
export function Seal({ fingerprint, label, size = 148 }: { fingerprint: string; label: string; size?: number }) {
  const bytes = fingerprint.match(/../g)!.map((h) => parseInt(h, 16));
  const rings = [0, 1, 2, 3].map((i) => {
    const petals = 5 + (bytes[i * 3] % 14);
    const depth = 0.05 + (bytes[i * 3 + 1] % 40) / 400;
    const phase = (bytes[i * 3 + 2] / 255) * Math.PI * 2;
    const radius = 44 - i * 8.5;
    const points: string[] = [];
    for (let s = 0; s <= 360; s++) {
      const a = (s / 360) * Math.PI * 2;
      const r = radius * (1 + depth * Math.sin(petals * a + phase));
      points.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
    }
    return points.join(" ");
  });

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`Seal for fingerprint ${fingerprint.slice(0, 8)}: ${label}`}>
      <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.6" />
      {rings.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="currentColor" strokeWidth={i === 0 ? 0.9 : 0.5} />
      ))}
      <circle cx="50" cy="50" r="13.5" fill="var(--paper)" stroke="currentColor" strokeWidth="0.6" />
      <text x="50" y="53.2" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </text>
    </svg>
  );
}
