// Usage: node evals/run.mjs <set> <A|B|S|C|D> <run> [model]
// A = plain translate; B = + style rules; S = + glossary slice; C = rules + slice; D = rules + whole glossary.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const SK = fileURLToPath(new URL('../skills/vietnamese-product', import.meta.url));
const TMP = os.tmpdir() + '/vi-drill-eval';

const { loadGlossary, lookup } = await import(`${SK}/scripts/glossary.mjs`);
const [set, cond, run = '1', model = process.env.VI_MODEL || 'google-antigravity/gemini-3.8-flash'] = process.argv.slice(2);
const items = JSON.parse(readFileSync(`${HERE}out/set_${set}.json`, 'utf8'));
const G = loadGlossary();
const skill = readFileSync(`${SK}/SKILL.md`, 'utf8');
const sect = n => (skill.match(new RegExp(`## ${n}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`)) || [, ''])[1].trim();
const rules = [sect('Terms and surfaces'), sect('UI voice and grammar')].join('\n');
const strings = items.map(p => ({ id: p.id, src: p.en }));
const head = 'Translate these UI strings of an app from English to Vietnamese for end users. Output ONLY a JSON object mapping each id to its Vietnamese translation, no commentary.';
let body = head;
if (cond === 'B') body += `\n\nStyle rules:\n${rules}`;
if (cond === 'C') body += `\n\nStyle rules:\n${rules}\n\nGlossary (use these terms; do not use the avoid forms):\n${lookup(strings, G).text}`;
if (cond === 'S') body += `\n\nGlossary (use these terms; do not use the avoid forms):\n${lookup(strings, G).text}`;
if (cond === 'D') body += `\n\nStyle rules:\n${rules}\n\nGlossary (use these terms; do not use the avoid forms):\n` + G.entries.map(e => `${e.aliases[0]} = ${e.vi}` + (e.alt.length ? ` | alt: ${e.alt.join(' / ')}` : '') + (e.avoid.length ? ` | avoid: ${e.avoid.join(' / ')}` : '') + (e.note ? ` | ${e.note}` : '')).join('\n');
body += `\n\nStrings:\n${JSON.stringify(Object.fromEntries(strings.map(s => [s.id, s.src])), null, 0)}`;
mkdirSync(`${HERE}out`, { recursive: true }); mkdirSync(TMP, { recursive: true });
const pf = `${TMP}/prompt_${set}_${cond}.txt`; writeFileSync(pf, body);
const t0 = Date.now();
const r = spawnSync(process.env.OMP_BIN || 'omp', ['--cwd', TMP, '--no-session', '--no-title', '--no-rules', '--no-skills', '--no-context-files', '--no-extensions', '--no-tools', '--model', model, '--thinking', 'low', '--max-time', '240', '-p', `@${pf}`, 'Do the task in the attached file.'], { encoding: 'utf8', timeout: 300000, maxBuffer: 20e6 });
const text = r.stdout || '';
const m = text.match(/\{[\s\S]*\}/);
let json = {}; try { json = JSON.parse(m[0]); } catch { console.error('PARSE FAIL', set, cond, run, text.slice(0, 300), r.stderr?.slice(0, 200)); }
writeFileSync(`${HERE}out/${set}_${cond}_${run}.json`, JSON.stringify(json));
console.log(`${set} ${cond} run${run}: ${Object.keys(json).length}/${items.length} in ${((Date.now() - t0) / 1000).toFixed(0)}s, prompt ${body.length} chars`);
