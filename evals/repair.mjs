// Usage: node evals/repair.mjs <set> <cond_run> [model]   e.g. context X_1  -> writes <set>_<cond>R_<run>.json
// Simulates the skill's step 3: run vi.mjs check (items mode), send ONLY failing items back with their findings, merge fixes.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import os from 'node:os';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const { checkItems } = await import(fileURLToPath(new URL('../skills/vietnamese/scripts/vi.mjs', import.meta.url)));
const [set, cr, model = process.env.VI_MODEL || 'google-antigravity/gemini-3.8-flash'] = process.argv.slice(2);
const [cond, run] = cr.split('_');
const items = JSON.parse(readFileSync(`${HERE}out/set_${set}.json`, 'utf8'));
const out = JSON.parse(readFileSync(`${HERE}out/${set}_${cr}.json`, 'utf8'));
const FIX = new Set(['LENGTH_HARD', 'LENGTH_OVER', 'SMS_SEGMENTS', 'END_PUNCT', 'FAILED_PHRASE', 'NO_NEXT_STEP', 'GLOSSARY_AVOID', 'TITLE_CASE', 'PUNCT_SPACE', 'PLACEHOLDER']);
const res = checkItems({ items: items.map(i => ({ id: i.id, src: i.en, tgt: out[i.id] ?? '', ctx: i.ctx })), limit: 5000 });
const byId = {}; for (const f of res.findings) if (FIX.has(f.code)) (byId[f.path] ??= []).push(`${f.code}: ${f.message}`);
const ids = Object.keys(byId);
const fixed = { ...out };
if (ids.length) {
  const TMP = `${os.tmpdir()}/vi-drill-eval`; mkdirSync(TMP, { recursive: true });
  const payload = Object.fromEntries(ids.map(id => { const it = items.find(i => i.id === id); return [id, { src: it.en, ctx: it.ctx, current: out[id], length: res.lengths[id], problems: byId[id] }]; }));
  const pf = `${TMP}/repair_${set}_${cr}.txt`;
  writeFileSync(pf, `Fix these Vietnamese UI strings. Each has the English source, its UI context, the current Vietnamese, its length in characters and the checker problems. Keep meaning; fix every problem (shorten to fit limits, end punctuation, use "Không … được" instead of "… thất bại/không thành công", add a short next step for failures when the user must act). Output ONLY a JSON object id -> fixed Vietnamese.\n\n${JSON.stringify(payload)}`);
  const text = await new Promise(r => { const p = spawn(process.env.OMP_BIN || 'omp', ['--cwd', TMP, '--no-session', '--no-title', '--no-rules', '--no-skills', '--no-context-files', '--no-extensions', '--no-tools', '--model', model, '--thinking', 'low', '--max-time', '200', '-p', `@${pf}`, 'Do the task in the attached file.'], { stdio: ['ignore', 'pipe', 'pipe'] }); let o = ''; p.stdout.on('data', d => o += d); p.on('close', () => r(o)); });
  try { Object.assign(fixed, JSON.parse(text.match(/\{[\s\S]*\}/)[0])); } catch { console.error('repair parse fail'); }
}
writeFileSync(`${HERE}out/${set}_${cond}R_${run}.json`, JSON.stringify(fixed));
console.log(`${set} ${cr}: repaired ${ids.length} items`);
