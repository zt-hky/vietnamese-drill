# Scope, limits and sources

## Components
- skills/vietnamese-product: product/docs/UI/notification/i18n workflow. Portable Agent Skill.
- skills/vietnamese-replies: assistant conversational style. Portable Agent Skill.
- skills/vietnamese-product/scripts/check.mjs: offline checker. Node.js only, no dependencies, no network, no file access, no rewrite.
- rules/vietnamese.md, tools/vi-check.ts, agents/vietnamese-reviewer.md: oh-my-pi (OMP) plugin extras: always-on routing rule, `vi_check` tool, Gemini Flash reviewer subagent (falls back to the `smol` role).

## Checker coverage
Covers NFC, selected invisible/replacement characters, JSON leaf paths/types/non-string values, simple placeholders ({name}, {{name}}, ${name}, printf %s/%d/%i/%f incl. positional) and warning-level style hints: CALQUE (cam kết thay đổi, triển khai đến sản xuất), PUNCT_SPACE, COMMA_BEFORE_CONJ, PERCENT_SPACE, FAILED_PHRASE ("… thất bại"), POLITE_DOUBLE, TITLE_CASE. Style hints ignore code spans, placeholders, tags and URLs but are heuristics: ignore when intentional (quotes, code, brand names, title-cased proper nouns). Complex ICU (argument followed by comma) is reported as unchecked, never silently passed. NOT covered: ICU/HTML/Markdown parsing, confusables, fonts, rendering, fluency. Errors = contract breaks; warnings = review hints. Findings capped (default 30, max 100) with total/truncated.
Locale/term hints added in 1.2.0 (warnings): DATE_US_ORDER (only unambiguous month/day/year such as 12/15/2024), TIME_AMPM, TERM_MIX (tệp + tập tin in one string), ADDRESS_MIX (bạn + quý khách/quý vị in one string). They cannot see cross-string inconsistency; that needs the project glossary and review.

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
