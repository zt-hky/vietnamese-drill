// Usage: node evals/chrf.mjs proref A_1 C_1 — chrF (char 6-gram F2) of each condition against the professional reference.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const ng = (s, n) => { const m = new Map(); const t = s.normalize('NFC').toLowerCase().replace(/\s+/g, ' '); for (let i = 0; i + n <= t.length; i++) { const g = t.slice(i, i + n); m.set(g, (m.get(g) || 0) + 1); } return m; };
function chrf(h, r, N = 6, beta = 2) {
  let P = 0, R = 0, k = 0;
  for (let n = 1; n <= N; n++) { const a = ng(h, n), b = ng(r, n); let m = 0, ta = 0, tb = 0; for (const [g, c] of a) { ta += c; m += Math.min(c, b.get(g) || 0); } for (const c of b.values()) tb += c; if (ta && tb) { P += m / ta; R += m / tb; k++; } }
  if (!k) return 0; P /= k; R /= k; return P + R ? (1 + beta * beta) * P * R / (beta * beta * P + R) * 100 : 0;
}
const [set, ...cs] = process.argv.slice(2);
const items = JSON.parse(readFileSync(`${HERE}out/set_${set}.json`, 'utf8'));
for (const c of cs) { const o = JSON.parse(readFileSync(`${HERE}out/${set}_${c}.json`, 'utf8')); let s = 0, n = 0; for (const it of items) if (o[it.id]) { s += chrf(o[it.id], it.ref); n++; } console.log(`${c}: chrF ${(s / n).toFixed(1)} over ${n}`); }
