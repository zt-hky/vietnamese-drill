# Evals: what v2 improves, and what it does not

Measured 2026-11-01. Generator: Gemini 3.8 Flash (low thinking). Judges: Claude Sonnet 5.5 and GPT-6 Sol, blind pairwise, order randomised per item. Every number below comes from these scripts; rerun them yourself.

```bash
node evals/make-sets.mjs
node evals/run.mjs heldout A 1 && node evals/run.mjs heldout C 1     # A = plain, C = skill
node evals/score.mjs heldout A C                                    # term adherence
node evals/judge.mjs heldout A_1 C_1                                 # VI_JUDGE=openai-codex/gpt-6-sol for a 2nd judge
node evals/run.mjs context C 1 && node evals/run.mjs context X 1 && node evals/repair.mjs context X_1
node evals/ctxscore.mjs context C X XR                               # length / punctuation / context compliance
node --test tests/                                                   # engine regression tests
```

Conditions: **A** plain "translate to Vietnamese" · **K** v1.3 behaviour (style rules + core-only slice) · **C** v2 (style rules + auto-routed slice: core + industry packs + ui-ext) · **B** rules only · **S** slice only · **X** C + per-item UI context (`surface`, `max`, `near`, `standalone`) + surface specs · **XR** X + one repair round driven by `vi.mjs check`.
**Term adherence** = share of glossary terms (gold industry pack + core) whose preferred or accepted form appears in the output. It measures consistency with the glossary, not prose quality; the judges cover quality.

## Sets
| Set | Size | Origin | Role |
|---|---|---|---|
| `heldout.json` | 188 (21 industries × 8 + 20 generic) | written by an independent agent **after** all glossary fixes, no access to the glossary | final numbers |
| `domains.json` | 297 | independent agent, before fixes | development: routing tuning, failure analysis (biased after tuning) |
| `context.json` | 44 | written by the maintainer; same source text in different UI slots | surface/length/context metadata |
| `proref.json` | 150 | random shipped Android/Firefox strings with professional Vietnamese references (Apache-2.0 / MPL-2.0) | closeness to human professional output |
| `ui-fresh.txt` | 62 | maintainer, v1.3 | regression |

## Results

**Held-out (final).** Industry-term adherence **78.3% → 94.0%**, all terms 83.9% → 94.6%, avoid forms 1 → 0. Naturalness judged equal: Claude 56 : 56 (3 ties), GPT 59 : 55 (A : C). The skill makes terminology consistent without making the Vietnamese worse.

**UI context metadata (44 strings, 2 runs each).**
| | LENGTH_HARD | LENGTH_OVER | SMS 2+ segments | END_PUNCT | NO_NEXT_STEP | total chars |
|---|---|---|---|---|---|---|
| C (no context) | 2, 2 | 5, 5 | 1, 1 | 2, 2 | 2, 2 | 1474, 1497 |
| X (with context) | 1, 0 | 0, 1 | 0, 0 | 0, 0 | 1, 1 | 1203, 1227 |
| XR (+ check & repair) | 0, 0 | 0, 0 | 0, 0 | 0, 0 | 0, 0 | 1193, 1244 |
With context the model writes "Xóa" for a dialog button under "Xóa thẻ này?", "Đã lưu" after the user's own tap, "Nạp tiền ngay" for an 18-character button. Models cannot count characters reliably (a store description stayed at 83/80 until the checker flagged it), which is why the workflow runs `check` and repairs. Judges rate C and X about equal (13 : 18, 17 : 14) and slightly prefer X over the repaired XR (3 : 0, 2 : 1, only 3 items repaired per run): fitting a hard limit can cost nuance.

**Closeness to professional translations (150 shipped strings).** chrF A 79.4 vs C 78.3; judges with the reference shown: Claude 50 : 42, GPT 46 : 45 (A : C); without reference 45 : 47. Neutral. Caveat: these strings are public, so the plain model may simply remember the shipped translation.

**Routing (297 strings).** Batch of 12 strings from one app → correct pack 21/21. Single string → correct pack among those selected 76%, top-1 66%, generic strings wrongly routed 2/25.

**Glossary quality.** Cross-model review (Gemini) flagged 2.0% of 4,027 industry rows; all adjudicated. Independent GPT spot check of 210 random industry rows: 85.7% standard, 13.3% acceptable, 1.0% wrong (fixed). ui-ext (60 rows): 70% / 27% / 3%.

**Tokens (o200k).** Whole glossary 133,858 · average lookup slice per 12-string batch 345 (max 610) · with UI context specs 773–1,154 per 11-item batch · router `SKILL.md` 1,161 · `modes/ui.md` 1,490 · `modes/review.md` 861 · `modes/replies.md` 268.

## What went wrong on the way (kept on purpose)
- **First v2 run lost to the plain model.** On the development set the judges preferred A over C 90 : 59 and 94 : 70 (Claude), 84 : 65 (GPT), although term adherence was 97% vs 77%. Ablation showed both parts contributed (rules only lost 73 : 58, glossary only 75 : 59). Failure analysis found real defects, not just judge taste:
  - generic core words forced into the wrong sense inside sentences (submit → "Gửi bài tập" instead of "Nộp bài tập", pay → "Thanh toán lệ phí" instead of "Nộp phí", receipt → "biên lai nhập kho", report → "báo cáo của cảnh sát" instead of "biên bản");
  - a shipped Android phrase carrying its settings sense ("Edit profile" → "Chỉnh sửa cấu hình") overriding core "Hồ sơ";
  - matching bugs: "card" matched "car" (suffix rule), `{biller}` placeholders matched as terms;
  - over-formal pack choices ("đơn vị chấp nhận thanh toán" for merchant in consumer UI) and a header that told the model to drop "của bạn" too eagerly.
  Fixes: core lines are now presented as label defaults with context notes, conflicting senses are shown side by side instead of silently overridden, placeholders are stripped before matching, the "d" suffix was removed, a dozen entries got everyday preferred forms. Result on the development set improved to 88 : 63 / 77 : 77 (Claude) and 79 : 72 (GPT), and to parity on the fresh held-out set.
- **The judges are LLMs.** Some of their preferences contradict the Microsoft vi-VN guide (they often prefer "Chuyển tiền thất bại" over "Không chuyển tiền được"). We kept the guide where it is explicit. Treat judge numbers as "no worse than plain", not as proof of better prose.
- **An agent used the text-mode check and missed every length rule** (OMP end-to-end run: a button 45 chars for an 18-char slot). Text mode now returns a hint and the router says items mode explicitly; the rerun found the README limit, passed `ctx.max`, iterated, and ended with no errors.
- **Agents skipped the project's length limits even with the MCP tools** (v2.1.0, Claude Code CLI and OMP, Claude Sonnet, 16 insurance/logistics/e-invoice/clinic strings, README limits: buttons ≤16, push titles ≤32, labels ≤24; 3 runs per arm). They called `vi_lookup` and `vi_check` but passed only `surface`, so the check used generic defaults (button 25) and returned "clean"; one run never opened the README and reported "no project limits". Over-limit strings: 9 with the plugin vs 10 without (Claude Code), 6 vs 9 (OMP). Fix in v2.1.2: limits-first step in the router, `vi_lookup` labels surface numbers as generic defaults, `vi_check` returns a "NOT verified against the project's limits" hint when `ctx.max` is missing. Rerun: README read and `ctx.max` passed in 6/6 runs, 0 over-limit strings. Terms were right in every arm (Sonnet already knows these); the one consistent glossary win was parcel → "kiện hàng" (6/6 with the plugin, "đơn hàng" = order in 6/6 without). Cost on Claude Code: about $0.15 vs $0.05 per run, 35 s vs 10 s.

## Limits
Generator and judges are LLMs; samples are small (44–297 strings, 1–2 runs); adherence is defined by this repo's own glossary; no native-speaker panel. Industry packs are drafted by a model and cross-reviewed by two other models, not by domain experts: use a project glossary for regulated wording. Codex was not run end-to-end.
