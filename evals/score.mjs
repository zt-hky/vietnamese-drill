// Usage: node evals/score.mjs <set> A S C   (adherence = share of glossary terms present in the output)
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const SK = fileURLToPath(new URL('../skills/vietnamese-product', import.meta.url));
const { loadGlossary, matchSource, norm } = await import(`${SK}/scripts/glossary.mjs`);
const { check: checkNew } = await import(`${SK}/scripts/check.mjs`);
const checkOld = () => ({ findings: [] }); // baseline comparison removed from the packaged harness
const G = loadGlossary();
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (h, n) => new RegExp(`(?<![\\p{L}\\p{N}])${esc(n)}(?![\\p{L}\\p{N}])`, 'iu').test(h);
export function score(set, outputs) {
  const items = JSON.parse(readFileSync(`${HERE}out/set_${set}.json`, 'utf8'));
  let gold = 0, hit = 0, anyN = 0, anyHit = 0, avoid = 0, n = 0, badItems = 0, newWarn = 0, oldWarn = 0, newBadFlag = 0, oldBadFlag = 0, info = 0;
  const misses = [];
  for (const p of items) {
    const out = outputs[p.id]; if (typeof out !== 'string') continue; n++;
    const o = norm(out), r = norm(p.vi ?? '');
    let bad = false;
    for (const e of matchSource(p.en, G)) {
      const forms = [e.vi, ...e.alt].map(norm);
      const refOk = p.vi ? forms.some(f => has(r, f)) : true, outOk = forms.some(f => has(o, f));
      anyN++; anyHit += outOk;
      if (refOk) { gold++; hit += outOk; if (!outOk) { bad = true; misses.push({ en: e.aliases[0], src: p.en, out, ref: p.vi }); } }
      if (e.avoid.some(a => has(o, norm(a)) && !forms.includes(norm(a)))) { avoid++; bad = true; }
    }
    const rn = checkNew({ text: out, sourceText: p.en, limit: 100 }), ro = checkOld({ text: out, sourceText: p.en, limit: 100 });
    const wn = rn.findings.some(f => f.severity !== 'info'), wo = ro.findings.length > 0;
    newWarn += wn; oldWarn += wo; info += rn.findings.some(f => f.severity === 'info');
    if (bad) { badItems++; newBadFlag += wn; oldBadFlag += wo; }
  }
  return { n, gold, hit: (100 * hit / gold).toFixed(1), anyHit: (100 * anyHit / anyN).toFixed(1), avoid, badItems, newWarn, oldWarn, newBadFlag, oldBadFlag, misses };
}
if (process.argv[1]?.endsWith('score.mjs')) {
  const [set, ...conds] = process.argv.slice(2);
  console.log('cond  n  goldHit%  allTermHit%  avoidUses  badItems | warn(new/old) | flaggedBad(new/old)');
  for (const c of conds) {
    const files = [1, 2, 3, 0].map(i => `${HERE}out/${set}_${c}_${i}.json`).filter(existsSync);
    for (const f of files) {
      const s = score(set, JSON.parse(readFileSync(f, 'utf8')));
      console.log(`${f.replace(`${HERE}out/${set}_`, '').replace('.json', '').padEnd(5)} ${String(s.n).padStart(2)}  ${s.hit.padStart(7)}  ${s.anyHit.padStart(10)}  ${String(s.avoid).padStart(8)}  ${String(s.badItems).padStart(7)} | ${s.newWarn}/${s.oldWarn} | ${s.newBadFlag}/${s.oldBadFlag}`);
    }
  }
}
