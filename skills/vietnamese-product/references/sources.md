# Scope, limits and sources

## Components
- skills/vietnamese-product: product/docs/UI/notification/i18n workflow. Portable Agent Skill.
- skills/vietnamese-replies: assistant conversational style. Portable Agent Skill.
- skills/vietnamese-product/scripts/check.mjs: offline checker. Node.js only, no dependencies, no network, no file access, no rewrite.
- rules/vietnamese.md, tools/vi-check.ts, agents/vietnamese-reviewer.md: oh-my-pi (OMP) plugin extras: always-on routing rule, `vi_check` tool, Gemini Flash reviewer subagent (falls back to the `smol` role).

## Checker coverage
Covers NFC, selected invisible/replacement characters, JSON leaf paths/types/non-string values, simple placeholders ({name}, {{name}}, ${name}, printf %s/%d/%i/%f incl. positional) and a few literal calques. Complex ICU (argument followed by comma) is reported as unchecked, never silently passed. NOT covered: ICU/HTML/Markdown parsing, confusables, fonts, rendering, fluency. Errors = contract breaks; warnings = review hints. Findings capped (default 30, max 100) with total/truncated.

## Cost policy
Tiny always-on rule; skills load on demand. Batch only changed strings with IDs, audience, glossary and needed context. Offline check first, then at most one semantic review for substantial/ambiguous copy. Report findings only. No per-reply reviewer, judge loop, proxy or whole-repo scan. Concise does not mean dropping negation, conditions, actor or warnings. End-user copy favors comprehension over minimum tokens.

## Sources and decisions
Original rules, informed by:
- https://github.com/trussary/vietnamese-language-skill: technical terminology, register, i18n hazards. Not adopted: blanket ASCII commit subjects, fixed expansion ratio, deleting ICU branches.
- https://github.com/abm-dungtq/viet-pro: context-sensitive translationese review; fix only clustered signals; keep facts.
- https://github.com/luongnv89/claude-howto/blob/main/vi/TRANSLATION_NOTES.md: glossary, never translate executable payload.
- https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides: localization reference.
- https://github.com/JuliusBrussee/caveman: answer first, no filler, exact payload. Not adopted: broken grammar, proxy, automatic model routing.
