// Usage: node evals/judge.mjs <set> A_1 C_1   — blind pairwise judge per batch (order randomised per item).
// Judge model: VI_JUDGE (default anthropic/claude-sonnet-5-5), deliberately a different family from the default generator.
import fs from 'node:fs'; import os from 'node:os'; import crypto from 'node:crypto'; import { spawn } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url)); const TMP = `${os.tmpdir()}/vi-drill-eval`; fs.mkdirSync(TMP, { recursive: true });
const [set, a, b] = process.argv.slice(2);
const items = JSON.parse(fs.readFileSync(`${HERE}out/set_${set}.json`, 'utf8'));
const A = JSON.parse(fs.readFileSync(`${HERE}out/${set}_${a}.json`)), B = JSON.parse(fs.readFileSync(`${HERE}out/${set}_${b}.json`));
const batches = new Map();
for (const p of items) {
  if (!A[p.id] || !B[p.id] || A[p.id].trim() === B[p.id].trim()) continue;
  const flip = parseInt(crypto.createHash('md5').update(p.id + a + b).digest('hex').slice(0, 2), 16) % 2;
  const row = { id: p.id, en: p.en, ...(p.ctx ? { ui_context: p.ctx } : {}), ...(p.ref && process.env.WITH_REF ? { professional_reference: p.ref } : {}), X: flip ? B[p.id] : A[p.id], Y: flip ? A[p.id] : B[p.id], key: flip ? { X: b, Y: a } : { X: a, Y: b } };
  const k = p.batch ?? 'all'; if (!batches.has(k)) batches.set(k, []); batches.get(k).push(row);
}
const call = pf => new Promise(res => { const p = spawn(process.env.OMP_BIN || 'omp', ['--cwd', TMP, '--no-session', '--no-title', '--no-rules', '--no-skills', '--no-context-files', '--no-extensions', '--no-tools', '--model', process.env.VI_JUDGE || 'anthropic/claude-sonnet-5-5', '--thinking', 'low', '--max-time', '240', '-p', `@${pf}`, 'Do the task in the attached file.'], { stdio: ['ignore', 'pipe', 'pipe'] }); let o = ''; p.stdout.on('data', d => o += d); p.on('close', () => res(o)); });
const tally = { [a]: 0, [b]: 0, tie: 0 }, perBatch = {};
const q = [...batches];
const judgeOne = async ([k, rows]) => {
  const prompt = `You are a senior Vietnamese UX writer and localization reviewer. Context: "${k}" app. For each item pick the better Vietnamese UI string: faithful meaning, correct industry terminology used in Vietnam, natural phrasing a Vietnamese user expects. When professional_reference is given (a shipped translation by professional localizers), pick the candidate closer to it in terminology, register and phrasing, while still faithful to the English. When ui_context is given, also judge fit for that exact slot: respects the character limit, does not repeat text already visible (near), and is understandable on its own when standalone. Answer "X", "Y" or "tie". Output ONLY a JSON object id -> answer.\n\n${JSON.stringify(rows.map(({ key, ...r }) => r))}`;
  const pf = `${TMP}/judge_${set}_${a}_${b}_${k}.txt`; fs.writeFileSync(pf, prompt);
  let res = {};
  for (let i = 0; i < 3; i++) { const m = (await call(pf)).match(/\{[\s\S]*\}/); try { res = JSON.parse(m[0]); break; } catch {} }
  const pb = (perBatch[k] = { [a]: 0, [b]: 0, tie: 0 });
  for (const r of rows) { const v = res[r.id]; if (process.env.DUMP) fs.appendFileSync(process.env.DUMP, JSON.stringify({ batch: k, id: r.id, en: r.en, win: v === 'tie' ? 'tie' : r.key[v], [a]: r.key.X === a ? r.X : r.Y, [b]: r.key.X === b ? r.X : r.Y }) + '\n'); if (v === 'tie') { tally.tie++; pb.tie++; } else if (v === 'X' || v === 'Y') { tally[r.key[v]]++; pb[r.key[v]]++; } }
};
await Promise.all(Array.from({ length: Number(process.env.VI_POOL || 4) }, async () => { while (q.length) await judgeOne(q.shift()); }));
console.log(`judge ${set} ${a} vs ${b}:`, tally);
if (process.env.VERBOSE) console.log(perBatch);
