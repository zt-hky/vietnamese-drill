// Usage: node evals/score.mjs <set> A K C
// Adherence = share of glossary terms (gold-domain pack + core) whose preferred or accepted form appears in the output.
// The term set is the same for every condition, so the comparison is fair; it measures standardisation, not overall quality (see judge.mjs).
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const SK = fileURLToPath(new URL('../skills/vietnamese', import.meta.url));
const { loadPack, matchSource, norm, wordRe } = await import(`${SK}/scripts/glossary.mjs`);
const has = (h, n) => wordRe(n).test(h);
export function score(set, outputs) {
  const items = JSON.parse(readFileSync(`${HERE}out/set_${set}.json`, 'utf8'));
  const core = loadPack('core');
  const tot = { n: 0, terms: 0, hit: 0, dom: 0, domHit: 0, avoid: 0 }, perDomain = {};
  for (const p of items) {
    const out = outputs[p.id]; if (typeof out !== 'string') continue; tot.n++;
    const packs = p.domain && p.domain !== 'none' ? [loadPack(p.domain), core] : [core];
    const o = norm(out);
    for (const { e } of matchSource(p.en, packs)) {
      const forms = [e.vi, ...e.alt].map(norm), ok = forms.some(f => has(o, f));
      tot.terms++; tot.hit += ok;
      if (e.tier === 'domain') { tot.dom++; tot.domHit += ok; const d = (perDomain[p.domain] ??= { n: 0, hit: 0 }); d.n++; d.hit += ok; }
      if (e.avoid.some(a => has(o, norm(a)) && !forms.includes(norm(a)))) tot.avoid++;
    }
  }
  return { ...tot, all: (100 * tot.hit / tot.terms).toFixed(1), domain: tot.dom ? (100 * tot.domHit / tot.dom).toFixed(1) : '-', perDomain };
}
if (process.argv[1]?.endsWith('score.mjs')) {
  const [set, ...conds] = process.argv.slice(2);
  console.log('cond   items  terms  allTerm%  domainTerm%(n)  avoidUses');
  for (const c of conds) for (const r of [1, 2, 3]) {
    const f = `${HERE}out/${set}_${c}_${r}.json`; if (!existsSync(f)) continue;
    const s = score(set, JSON.parse(readFileSync(f, 'utf8')));
    console.log(`${(c + '_' + r).padEnd(6)} ${String(s.n).padStart(5)}  ${String(s.terms).padStart(5)}  ${s.all.padStart(7)}  ${String(s.domain).padStart(7)}(${s.dom})  ${String(s.avoid).padStart(8)}`);
  }
}
