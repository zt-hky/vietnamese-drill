// Usage: node evals/judge.mjs <set> A_1 C_1   (blind pairwise naturalness judge; order randomised)
import fs from 'node:fs'; import { spawnSync } from 'node:child_process'; import crypto from 'node:crypto'; import os from 'node:os'; import { fileURLToPath } from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url)); const TMP = os.tmpdir() + '/vi-drill-eval'; fs.mkdirSync(TMP, { recursive: true });
const [set, a, b] = process.argv.slice(2);
const items = JSON.parse(fs.readFileSync(`${HERE}out/set_${set}.json`, 'utf8'));
const A = JSON.parse(fs.readFileSync(`${HERE}out/${set}_${a}.json`)), B = JSON.parse(fs.readFileSync(`${HERE}out/${set}_${b}.json`));
const rows = []; const key = {};
for (const p of items) {
  if (!A[p.id] || !B[p.id] || A[p.id] === B[p.id]) continue;
  const flip = parseInt(crypto.createHash('md5').update(p.id).digest('hex').slice(0, 2), 16) % 2;
  key[p.id] = flip ? { X: b, Y: a } : { X: a, Y: b };
  rows.push({ id: p.id, en: p.en, X: flip ? B[p.id] : A[p.id], Y: flip ? A[p.id] : B[p.id] });
}
const prompt = `You are a native Vietnamese UX writer reviewing UI translations. For each item choose the better Vietnamese UI string considering: faithful meaning, natural everyday phrasing a Vietnamese app user expects, standard terminology used by big apps. Answer "X", "Y" or "tie". Output ONLY a JSON object id -> answer.\n\n${JSON.stringify(rows)}`;
const pf = `${TMP}/judge_prompt_${set}.txt`; fs.writeFileSync(pf, prompt);
const r = spawnSync(process.env.OMP_BIN || 'omp', ['--cwd', TMP, '--no-session', '--no-title', '--no-rules', '--no-skills', '--no-context-files', '--no-extensions', '--no-tools', '--model', process.env.VI_JUDGE || 'anthropic/claude-sonnet-5-5', '--thinking', 'low', '--max-time', '240', '-p', `@${pf}`, 'Do the task in the attached file.'], { encoding: 'utf8', timeout: 300000, maxBuffer: 20e6 });
const m = (r.stdout || '').match(/\{[\s\S]*\}/); const res = JSON.parse(m[0]);
const tally = { [a]: 0, [b]: 0, tie: 0 };
for (const [id, v] of Object.entries(res)) { if (v === 'tie') tally.tie++; else if (key[id]) tally[key[id][v]]++; }
console.log(`judge ${set}: differing pairs=${rows.length}`, tally);
