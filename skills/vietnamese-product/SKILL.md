---
name: vietnamese-product
description: "Vietnamese software writing for docs, UI/UX, web content, notifications and vi-VN i18n. Retains technical English, checks contracts locally, batches semantic review."
---
# Contract
Write for the audience, not English word order. Preserve facts, uncertainty, negation, amounts, links and behavior. Project glossary/style wins; flag conflicts, do not silently rename concepts.

## Terms and surfaces
- Developer docs/chat: keep commit, branch, merge, deploy, production, staging, API, endpoint, payload, cache, hook, skill, plugin, pull request when natural. Never commit→cam kết or production→sản xuất in software context. Explain unfamiliar terms once for beginners.
- End-user UI: prefer familiar Vietnamese (Lưu, Xoá, Đăng nhập, Tải xuống); do not leak developer jargon. Technical English is retained where it identifies a technical concept, not as a reason to leave all UI untranslated. One concept, one term per surface.
- Spec/RFC: impersonal, name actor precisely. Tutorial: bạn sparingly. UI: omit pronoun when clear, otherwise bạn; brand-specific quý khách only if established. Assistant chat replies follow vietnamese-replies.
- Buttons: action + object if needed; destructive actions explicit. Error: what failed + actionable recovery; don't invent cause or retry guarantees. Distinguish loading, empty, success and failure. Noti: event/result + relevant next action, no unsolicited marketing.
- Content: concrete benefit, no invented superlatives. Remove empty tiến hành/thực hiện, một cách, thông qua việc only when redundant; not blanket bans. Prefer active clauses without changing agency or causality.

## i18n invariants
- Do not translate identifiers, CLI flags, code, paths, URLs, resource keys, placeholders, HTML/Markdown syntax, API enums or machine-readable logs. Translate user-visible strings/comments only within the requested scope. Localize diagram labels only if requested; never alter syntax.
- Preserve interpolation names, types, escaping and rich-text tags. JSON keys and placeholder contracts must match source. Never concatenate sentence fragments; use existing i18n library and message context.
- Vietnamese CLDR cardinal category is other. Exact numeric selectors (=0, =1) are valid; don't automatically delete branches or rewrite complex ICU with regex. Check select/plural nesting with the project's actual message compiler. English plural branches need not match Vietnamese branches; interpolation variables must.
- UTF-8/NFC. Match established hoà/hòa style; neither is universally wrong. No forced ASCII for commit prose unless repo policy requires it.
- Use Intl.DateTimeFormat/NumberFormat('vi-VN') or existing locale layer; keep underlying values/time zones unchanged. Don't hardcode currency or convert units silently.
- Verify layout with actual Vietnamese copy, stacked diacritics, wrapping, narrow screens and font coverage. No fixed expansion percentage. Accent-insensitive search is a product requirement decision, not universal replacement of exact matching.

## Workflow / cost
1. Read only changed strings + neighboring context + relevant project glossary. Draft directly in Vietnamese; do not translate via English unnecessarily.
2. Run the bundled offline checker: a `vi_check` tool if installed, otherwise `node <skill-dir>/scripts/check.mjs` with one JSON request on stdin, e.g. {"text":"Xin chào {user}","sourceText":"Hello {name}"}. `mode: json` for JSON resource files; optional sourceText checks keys and supported placeholders. Exit 0 clean/warnings, 1 contract errors, 2 invalid request. Read-only; reports unsupported ICU; not a parser or naturalness score.
3. For substantial/new product copy, ambiguous technical wording or high-risk notices: if a `vietnamese-reviewer` subagent exists, send ONE bounded batch (audience, surface, glossary, source/target pairs, local findings); it proposes changed rows + reason only. Without one, do one self-review pass against this file. Tiny obvious edits: self-review only. Never send secrets/customer data; minimize/redact before remote review.
4. Apply accepted edits, recheck the changed batch and run the project's i18n compiler/runtime for complex messages. Validate actual rendered UI when UI changed. No numeric fluency score or repeated debate loops; unresolved meaning escalates with source context.

## Examples
- cam kết các thay đổi → commit các thay đổi (Git)
- triển khai đến sản xuất → deploy lên production (developer docs)
- Thực hiện việc lưu cài đặt → Lưu cài đặt (button)
- Đã xảy ra lỗi → Không lưu được cài đặt. Thử lại. (only if retry is a real available action)
- Bạn sẽ tự động thử lại request → Hệ thống tự động retry request (only if system, not reader, owns retry)

Scope, limits and sources: references/sources.md.
