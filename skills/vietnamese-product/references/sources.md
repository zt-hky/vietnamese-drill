# Scope, limits and sources

## Components
- skills/vietnamese-product: product/docs/UI/notification/i18n workflow. Portable Agent Skill.
- skills/vietnamese-replies: assistant conversational style. Portable Agent Skill.
- skills/vietnamese-product/scripts/check.mjs: offline checker. Node.js only, no dependencies, no network, no file access, no rewrite.
- rules/vietnamese.md, tools/vi-check.ts, agents/vietnamese-reviewer.md: oh-my-pi (OMP) plugin extras: always-on routing rule, `vi_check` tool, Gemini Flash reviewer subagent (falls back to the `smol` role).

## Checker coverage
Covers NFC, selected invisible/replacement characters, JSON leaf paths/types/non-string values, simple placeholders ({name}, {{name}}, ${name}, printf %s/%d/%i/%f incl. positional) and warning-level style hints: CALQUE (cam kết thay đổi, triển khai đến sản xuất), PUNCT_SPACE, COMMA_BEFORE_CONJ, PERCENT_SPACE, FAILED_PHRASE ("… thất bại"), POLITE_DOUBLE, TITLE_CASE. Style hints ignore code spans, placeholders, tags and URLs but are heuristics: ignore when intentional (quotes, code, brand names, title-cased proper nouns). Complex ICU (argument followed by comma) is reported as unchecked, never silently passed. NOT covered: ICU/HTML/Markdown parsing, confusables, fonts, rendering, fluency. Errors = contract breaks; warnings = review hints. Findings capped (default 30, max 100) with total/truncated.
Locale/term hints (since 1.2.0) (warnings): DATE_US_ORDER (only unambiguous month/day/year such as 12/15/2024), TIME_AMPM, TERM_MIX (tệp + tập tin in one string), ADDRESS_MIX (bạn + quý khách/quý vị in one string). They cannot see cross-string inconsistency; that needs the project glossary and review.

## Cost policy
Tiny always-on rule; skills load on demand. Batch only changed strings with IDs, audience, glossary and needed context. Offline check first, then at most one semantic review for substantial/ambiguous copy. Report findings only. No per-reply reviewer, judge loop, proxy or whole-repo scan. Concise does not mean dropping negation, conditions, actor or warnings. End-user copy favors comprehension over minimum tokens.

## Sources and decisions
Original rules, informed by:
- https://github.com/trussary/vietnamese-language-skill: technical terminology, register, i18n hazards. Not adopted: blanket ASCII commit subjects, fixed expansion ratio, deleting ICU branches.
- https://github.com/abm-dungtq/viet-pro: context-sensitive translationese review; fix only clustered signals; keep facts.
- https://github.com/luongnv89/claude-howto/blob/main/vi/TRANSLATION_NOTES.md: glossary, never translate executable payload.
- Microsoft *Vietnamese Localization Style Guide* (full 60-page PDF read and distilled into references/microsoft-vi-style.md): https://download.microsoft.com/download/b/f/e/bfecb1b4-21ab-48fd-a48c-c2471b026f8f/vie-vnm-StyleGuide.pdf and https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides. Adopted: voice, modern short words, sentence case, punctuation, error phrase patterns, prepositions, inclusive language, accessibility, placeholder handling, prompt localization. Treated as defaults, not law: Microsoft-specific terms (tệp, thiết đặt, Bảng tạm, key names) and the Windows-era shortcut tables (not reproduced). Skipped as out of scope: video voice-over pronunciation beyond a one-line note, shortcut-key tables.
- https://nguyenlnp.com/vietnamese-localization-style-guide/ (Nguyen LNP, 2026): style guide vs glossary vs TM vs LQA, glossary fields, context to attach, locale via CLDR, AI workflow with human approval. Adopted. Its pronoun/tệp examples are treated as per-project decisions.
- https://gtelocalize.net/vietnamese-localization/ (GTE Localize, 2026): date/time/name/address conventions, pronoun and regional-vocabulary tables, SEO and testing advice. Adopted selectively; NOT adopted: "no English words ever", fixed 30–37% expansion, "formal tone for young audiences", statute numbers and market statistics (unverified). Details in references/locale-and-glossary.md.
- https://github.com/JuliusBrussee/caveman: answer first, no filler, exact payload. Not adopted: broken grammar, proxy, automatic model routing.

## UI glossary provenance (assets/glossary.vi-ui.tsv, 329 entries)
Method (2026-11-01): 364 candidate UI terms were looked up in three real corpora, then curated by hand.
- Microsoft Terminology Collection, Vietnamese TBX (19,427 English terms): https://learn.microsoft.com/en-us/globalization/reference/microsoft-terminology (downloaded for analysis; not redistributed).
- Android Open Source Project strings, aligned `values/` vs `values-vi/` from framework, Settings, SystemUI and Contacts (Apache-2.0): https://github.com/aosp-mirror
- Firefox for Android strings, aligned `values/` vs `values-vi/` from Fenix, Focus and android-components (MPL-2.0): https://github.com/mozilla-mobile/firefox-android
- MoMo UX Writing Guideline (button rules: verb first, sentence case, about 25 characters; common CTA verbs): https://zeroheight.com/780fb2963/p/7649f6-gioi-thieu (read via a browser; rules paraphrased).
- Microsoft Vietnamese Localization Style Guide (see microsoft-vi-style.md).
- Not available publicly: Apple, Facebook/Meta, Zalo and Google product glossaries. Their UI conventions are covered only indirectly through Android.

`src` column: `A` Android, `F` Firefox, `M` Microsoft agree with the chosen form or an accepted alternative (checked automatically); `G` MS style guide, `Mo` MoMo; `E` editorial decision (no matching evidence in the corpora). 270 entries have at least one corpus behind them, 174 have two or more, 55 have all three; 59 are editorial. Only short term-to-term mappings are kept, with attribution here; no running text is copied.

Disagreements are resolved to the shorter, more current form and the other form is listed as `alt` (for example Android "Hủy" and Firefox "Hủy bỏ" → Hủy; Microsoft "Thiết đặt" → Cài đặt). `avoid` holds forms that machine translation really produces and that shipped products do not use (Học thêm, Đăng ký for Sign in, Tiết kiệm for Save). Context-dependent terms carry a note or a gap alias (`mute * conversation`).

Validation and results: ../../../evals/README.md. Maintainers: rerun `evals/` after editing the glossary; keep `avoid` strict (a false positive costs trust).
