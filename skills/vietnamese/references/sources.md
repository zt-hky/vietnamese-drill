# Scope, limits and sources

## Components
- skills/vietnamese: one portable Agent Skill. SKILL.md is a router; modes/ui.md, modes/replies.md, modes/review.md are sub-skills loaded on demand.
- skills/vietnamese/scripts/vi.mjs (+ glossary.mjs): offline CLI `check`, `lookup`, `route`, `packs`, `build-index`. Node.js only, no dependencies, no network; reads only glossary/ and a project TSV you pass.
- mcp/server.mjs (+ .mcp.json): zero-dependency MCP stdio server exposing the CLI's `lookup` and `check` as tools `vi_lookup` / `vi_check` (read-only, offline, same code path as the CLI). Used by Claude Code (plugin), Codex, Cursor and any MCP client; the skill works without it.
- rules/vietnamese.md, agents/vietnamese-reviewer.md: oh-my-pi (OMP) plugin extras: always-on routing rule and the reviewer subagent (pin a cheaper model in OMP config; falls back to the `smol` role).

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

## Core UI glossary provenance (glossary/core.tsv, 329 entries)
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

## v2 data (2026-11-01)

### Industry packs (glossary/domains/*.tsv, 21 packs, about 4,030 entries)
- Drafted by 21 parallel Claude Sonnet agents from a fixed contract (8 TSV columns, traditional tone placement, avoid only for real machine-translation errors, no statute numbers), one industry each, without seeing each other's packs or the eval strings.
- Cross-model review: Gemini 3.8 Flash reviewed every pack and flagged 2% of rows (wrong / unnatural / bad avoid). Each flag was adjudicated: 60 fixes, 7 avoid forms removed, 6 rows that merged two concepts split, 1 uncertain row dropped. 46 aliases identical to core were removed.
- Independent spot check: GPT-6 Sol rated 210 random domain rows: 85.7% standard, 13.3% acceptable, 1.0% wrong (both wrong rows fixed). Microsoft Terminology agrees with only 20–57% of covered rows per pack; it is dated and Windows-centric, so it is not used as ground truth for industry terms.
- `src`: `D,V` = drafted and cross-reviewed. Treat packs as strong defaults, not law; a project glossary overrides them. Known soft spots (per drafter notes): region-dependent words (máy lạnh/điều hòa, ngò/rau mùi), brand-specific labels (Shopee "xu", VNeID "ví giấy tờ"), administrative units after the 2025 reorganisation.

### ui-ext (glossary/ui-ext.tsv, 3,499 phrases)
Mined automatically from aligned Android (AOSP) and Firefox for Android strings: 1–4-word labels, translation consistent in ≥70% of occurrences, single words need ≥3 occurrences, brand strings and placeholders excluded, nothing that duplicates core or a pack. Shipped professional translations; GPT spot check of 60 rows: 70% standard, 27% acceptable, 3% awkward. Used for lookup only (optional phrasing), never for lint.

### UI surfaces (glossary/surfaces.tsv, 35 slots)
Hard limits from platform documentation: App Store name and subtitle 30, Google Play title 30 and short description 80, App Store promotional text 170, SMS 160 GSM-7 / 70 UCS-2 characters per single segment (153/67 when multipart; Vietnamese diacritics force UCS-2). Button ≤ 25 from the MoMo UX Writing Guideline; error and confirmation patterns from the Microsoft vi-VN guide. All other recommended lengths are editorial (`E`) defaults to tune per product; `ctx.max` always overrides them.

### Routing
Deterministic: each pack is scored by its matches in the batch (multi-word alias 2, single word 1); aliases that are also generic UI phrases (core/ui-ext) do not count. Threshold 1 for batches of ≤3 strings, else 2; packs within 34% of the best score, at most 3. Measured on 297 independent strings: batch-level top-1 21/21; single-string top-1 66%, correct pack among those selected 76%, generic strings falsely routed 2/25.
