// Usage: node evals/make-sets.mjs  -> evals/out/set_{domains,ui-fresh,ui-hard}.json
import fs from 'node:fs';
const u = n => new URL(n, import.meta.url);
fs.mkdirSync(u('./out/'), { recursive: true });
const d = JSON.parse(fs.readFileSync(u('./domains.json'), 'utf8')).map(x => ({ id: x.id, en: x.en, domain: x.domain, batch: x.id.startsWith('mix') ? 'mix' : x.id.startsWith('gen') ? 'gen' : x.domain }));
fs.writeFileSync(u('./out/set_domains.json'), JSON.stringify(d));
for (const name of ['ui-fresh', 'ui-hard']) {
  const L = fs.readFileSync(u(`./${name}.txt`), 'utf8').split('\n').filter(Boolean);
  fs.writeFileSync(u(`./out/set_${name}.json`), JSON.stringify(L.map((en, i) => ({ id: `${name}-${i + 1}`, en, domain: 'none', batch: `${name}-${Math.floor(i / 16)}` }))));
}
fs.writeFileSync(u('./out/set_context.json'), JSON.stringify(JSON.parse(fs.readFileSync(u('./context.json'), 'utf8')).map(x => ({ ...x, domain: 'none' }))));
const h = JSON.parse(fs.readFileSync(u('./heldout.json'), 'utf8')).map(x => ({ id: x.id, en: x.en, domain: x.domain, batch: x.domain === 'none' ? 'gen' : x.domain }));
fs.writeFileSync(u('./out/set_heldout.json'), JSON.stringify(h));
fs.writeFileSync(u('./out/set_proref.json'), fs.readFileSync(u('./proref.json'), 'utf8'));
console.log('domains', d.length, 'heldout', h.length);
