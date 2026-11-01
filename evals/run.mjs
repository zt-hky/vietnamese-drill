// Usage: node evals/run.mjs <set> <A|K|C> <run> [model]
//   A = plain "translate to Vietnamese"; K = style rules + core-only glossary slice (v1.3 behaviour);
//   C = style rules + auto-routed slice (core + industry packs + ui-ext) (v2 behaviour).
//   B = style rules only; S = glossary slice only (ablations).
//   X = C + per-item UI context (surface, max, near, standalone) + surface specs + the 'Surface and context' rules.
// Items are grouped by `batch` (one app/screen = one batch), like a real agent request.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import os from 'node:os';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const SK = fileURLToPath(new URL('../skills/vietnamese', import.meta.url));
const TMP = `${os.tmpdir()}/vi-drill-eval`;
const { lookup } = await import(`${SK}/scripts/glossary.mjs`);
const { lookupRequest } = await import(`${SK}/scripts/vi.mjs`);
const [set, cond, run = '1', model = process.env.VI_MODEL || 'google-antigravity/gemini-3.8-flash'] = process.argv.slice(2);
const items = JSON.parse(readFileSync(`${HERE}out/set_${set}.json`, 'utf8'));
const ui = readFileSync(`${SK}/modes/ui.md`, 'utf8');
const sect = n => (ui.match(new RegExp(`## ${n}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`)) || [, ''])[1].trim();
const rules = [sect('Terms and surfaces'), sect('UI voice and grammar')].join('\n');
const ctxRules = sect('Surface and context');
mkdirSync(TMP, { recursive: true }); mkdirSync(`${HERE}out`, { recursive: true });
const batches = new Map(); for (const it of items) { const b = it.batch ?? 'all'; if (!batches.has(b)) batches.set(b, []); batches.get(b).push(it); }
let promptChars = 0, sliceChars = 0;
const call = (pf) => new Promise(res => {
  const p = spawn(process.env.OMP_BIN || 'omp', ['--cwd', TMP, '--no-session', '--no-title', '--no-rules', '--no-skills', '--no-context-files', '--no-extensions', '--no-tools', '--model', model, '--thinking', 'low', '--max-time', '240', '-p', `@${pf}`, 'Do the task in the attached file.'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = ''; p.stdout.on('data', d => out += d); p.on('close', () => res(out)); setTimeout(() => p.kill(), 280000).unref();
});
const POOL = Number(process.env.VI_POOL || 4);
const work = async ([b, arr]) => {
  const strings = arr.map(p => ({ id: p.id, src: p.en, ...(cond === 'X' && p.ctx ? { ctx: p.ctx } : {}) }));
  let body = 'Translate these app UI strings from English to Vietnamese for end users of one product. Output ONLY a JSON object mapping each id to its Vietnamese translation, no commentary.';
  if (cond !== 'A') {
    const slice = cond === 'B' ? '' : cond === 'K' ? lookup(strings, { domains: ['none'], ext: false }).text : cond === 'X' ? lookupRequest({ items: strings }).text : lookup(strings, {}).text;
    sliceChars += slice.length;
    body += (cond === 'S' ? '' : `\n\nStyle rules:\n${rules}`) + (cond === 'X' ? `\n\n${ctxRules}` : '') + (slice ? `\n\nGlossary:\n${slice}` : '');
  }
  body += cond === 'X' ? `\n\nStrings with UI context (ctx.surface = where it is shown, ctx.max = character limit, ctx.near = text already visible next to it, ctx.standalone = must be understandable alone):\n${JSON.stringify(Object.fromEntries(strings.map(s => [s.id, { src: s.src, ctx: s.ctx }])))}` : `\n\nStrings:\n${JSON.stringify(Object.fromEntries(strings.map(s => [s.id, s.src])))}`;
  promptChars += body.length;
  const pf = `${TMP}/prompt_${set}_${cond}_${run}_${b}.txt`; writeFileSync(pf, body);
  for (let attempt = 0; attempt < 3; attempt++) {
    const m = (await call(pf)).match(/\{[\s\S]*\}/);
    try { return JSON.parse(m[0]); } catch {}
  }
  console.error('PARSE FAIL', b); return {};
};
const queue = [...batches], results = [];
await Promise.all(Array.from({ length: POOL }, async () => { while (queue.length) results.push(await work(queue.shift())); }));
const merged = Object.assign({}, ...results);
writeFileSync(`${HERE}out/${set}_${cond}_${run}.json`, JSON.stringify(merged));
console.log(`${set} ${cond} run${run}: ${Object.keys(merged).length}/${items.length} items, ${batches.size} batches, prompt ${promptChars} chars (glossary slice ${sliceChars})`);
