// Usage: node evals/ctxscore.mjs context C X  — mechanical context compliance per condition (uses vi.mjs check items mode).
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const { checkItems } = await import(fileURLToPath(new URL('../skills/vietnamese/scripts/vi.mjs', import.meta.url)));
const [set, ...conds] = process.argv.slice(2);
const items = JSON.parse(readFileSync(`${HERE}out/set_${set}.json`, 'utf8'));
const CODES = ['LENGTH_HARD', 'LENGTH_OVER', 'SMS_SEGMENTS', 'END_PUNCT', 'REDUNDANT_CONTEXT', 'NO_NEXT_STEP', 'GLOSSARY_AVOID'];
console.log('cond  ' + CODES.join(' ') + '  totalChars');
for (const c of conds) for (const r of [1, 2, 3]) {
  const f = `${HERE}out/${set}_${c}_${r}.json`; if (!existsSync(f)) continue;
  const out = JSON.parse(readFileSync(f, 'utf8'));
  const res = checkItems({ items: items.map(i => ({ id: i.id, src: i.en, tgt: out[i.id] ?? '', ctx: i.ctx })), limit: 2000 });
  const cnt = Object.fromEntries(CODES.map(k => [k, res.findings.filter(x => x.code === k).length]));
  const chars = Object.values(res.lengths).reduce((a, b) => a + b, 0);
  console.log(`${c}_${r}  ` + CODES.map(k => String(cnt[k]).padStart(k.length)).join(' ') + `  ${chars}`);
}
