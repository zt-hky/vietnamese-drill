# Evals: does the glossary actually help?

Measured 2026-11-01 with `omp` (models: Gemini 3.8 Flash, Gemini 2.5 Flash-Lite, Claude Haiku 4.5; judge: Claude Sonnet 5.5). Run it yourself:

```bash
node evals/build-set.mjs ui-fresh          # 62 original English UI strings (no references)
for c in A C; do node evals/run.mjs ui-fresh $c 1; done
node evals/score.mjs ui-fresh A C           # term adherence
node evals/judge.mjs ui-fresh A_1 C_1       # blind naturalness judge (needs a second model)
```

Conditions: **A** plain "translate to Vietnamese"; **B** + the style rules from `SKILL.md`; **S** + glossary slice only; **C** rules + slice; **D** rules + the whole glossary pasted in.
**Adherence** = share of matched glossary terms (preferred or accepted alternative) present in the output. It measures standardisation, not overall quality, so a blind judge compares the outputs too.

## Results (what held up)

| Check | Result |
|---|---|
| Glossary vs real shipped Vietnamese (1,394 held-out Android/Firefox sentences, 2,299 term occurrences) | shipped text uses the glossary form **94.6%**; uses an `avoid` form **0.0%**. Caveat: about 20 entries were adjusted after this check, so treat it as validation of the method, not a clean test. |
| Checker false positives on those professional translations | any warning on 2.0% of pairs (v1.2.0: 1.9%); `GLOSSARY_AVOID` on 1 of 1,394 |
| **Fresh set** (62 strings written after the glossary was frozen; fintech, health, education, logistics, games, smart home), Gemini 3.8 Flash | adherence **A 90.2% → C 96.7%**; judge prefers C **27 : 19** over A |
| Same fresh set, Claude Haiku 4.5 | adherence **A 94.6–95.7% → C 96.7–97.8%**; judge **C 38 : A 30** |
| Earlier held-out set (44 strings, used for tuning once) | A 93.7–97.5% → S/C 98.8–100%; D (whole glossary) 98.7% |
| Token cost (o200k) | whole glossary 5,110 · lookup slice for 10 strings **116**, 30 strings 413, 62 strings 908 · `SKILL.md` 1,660 · reviewer playbook 660 |

## What did not work (kept on purpose)

- **First eval was saturated.** On 70 real Android/Firefox sentences the no-skill baseline already scored 100%: those strings are public and models have seen them. The skill proved nothing there, so the evidence above comes from new strings.
- **Rules without a glossary do nothing for translation.** Condition B (style rules only) scored the same or lower than A (92.4% vs 93.7–94.9%). The rules cost about 1,400 tokens and mostly help when *reviewing*; the translate prompt now relies on the glossary slice plus a one-line naturalness reminder.
- **A bare glossary made output worse.** With only the glossary (S) the blind judge preferred plain A 31 : 4 over two runs: the model copied English structure ("của bạn" everywhere, "Di chuyển", "mở khóa"). Adding the naturalness reminder (now part of `lookup` output) and fixing context-sensitive entries (mute chat vs audio, block contact vs card, move, sync, unlock, reload page) flipped dev to C 41 : 12; the earlier test set stayed slightly in favour of A (17 : 11), which is why the numbers above come from the fresh set.
- **Pasting the whole glossary (D) is both costlier and slightly worse** than a slice.
- Remaining "misses" on the fresh set are valid variants (`thông tin thanh toán` for "details", `đang được giao` for "out for delivery"). I stopped tuning there to avoid overfitting.

## Limits

Small samples (44–62 strings, 2 runs each), one judge model, adherence defined by this repo's own glossary. Gains are real but modest: expect fewer inconsistent or dated terms and a few percent better terminology, not a different class of quality. Not tested: Codex, long documents, non-UI copy.
