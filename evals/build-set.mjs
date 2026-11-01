// Usage: node evals/build-set.mjs ui-fresh   -> evals/out/set_ui-fresh.json  (items without references)
import fs from 'node:fs';
const name = process.argv[2] || 'ui-fresh';
const L = fs.readFileSync(new URL(`./${name}.txt`, import.meta.url), 'utf8').split('\n').filter(Boolean);
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL(`./out/set_${name}.json`, import.meta.url), JSON.stringify(L.map((en, i) => ({ id: `s${i + 1}`, en }))));
console.log(name, L.length, 'strings');
