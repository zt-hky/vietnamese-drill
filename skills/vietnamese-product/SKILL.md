---
name: vietnamese-product
description: "Vietnamese software writing for docs, UI/UX, web content, notifications and vi-VN i18n. Retains technical English, applies Microsoft vi-VN style rules, checks contracts locally, batches semantic review."
---
# Contract
Write for the audience, not English word order. Preserve facts, uncertainty, negation, amounts, links and behavior. Project glossary/style wins; flag conflicts, do not silently rename concepts.

## Terms and surfaces
- Developer docs/chat: keep commit, branch, merge, deploy, production, staging, API, endpoint, payload, cache, hook, skill, plugin, pull request when natural. Never commit→cam kết or production→sản xuất in software context. Explain unfamiliar terms once for beginners.
- End-user UI: prefer familiar Vietnamese (Lưu, Xoá, Đăng nhập, Tải xuống); do not leak developer jargon. Technical English is retained where it identifies a technical concept, not as a reason to leave all UI untranslated. One concept, one term per surface.
- Spec/RFC: impersonal, name actor precisely. Tutorial: bạn sparingly. UI: omit pronoun when clear, otherwise bạn; brand-specific quý khách only if established. Assistant chat replies follow vietnamese-replies.
- Buttons: action + object if needed; destructive actions explicit. Error: what failed + actionable recovery; don't invent cause or retry guarantees. Distinguish loading, empty, success and failure. Noti: event/result + relevant next action, no unsolicited marketing.
- Content: concrete benefit, no invented superlatives. Remove empty tiến hành/thực hiện, một cách, thông qua việc only when redundant; not blanket bans. Prefer active clauses without changing agency or causality.

## UI voice and grammar (from Microsoft vi-VN guide; details in references/microsoft-vi-style.md)
- Voice: warm, crisp, helpful. Rewrite for intent, never word for word; split sentences, drop empty descriptors; use fragments ("Dùng ngay phiên bản đầy đủ", "Nếu còn sự cố"). Short modern words: hủy, nhập, ẩn, tìm hiểu, Xin chờ, ID.
- Sentence case for buttons/menus/titles ("Chọn tất cả", not "Chọn Tất Cả"). Proper names capitalize every word (Việt Nam).
- No "việc" before a gerund (Tôi thích lập trình). Tense words đã/đang/sẽ optional. "Hãy" for direct commands; "Vui lòng" polite, never doubled. Noun before adjective; no articles; "của" only for clarity.
- Errors: declarative, ends with a period, uses "lỗi", names the result, then the action. Could not/Cannot/Failed to → "Không … được" / "Không tìm thấy …" / "Không đủ …". Not "… thất bại". One phrase per meaning.
- Punctuation: no space before . , ! ? ; : ) and none after ( ; no comma before và/hoặc; decimal comma, thousands period, no space before %; number–unit with NBSP. Prefer Intl over hand formatting.
- "to" with progress = "lên" (cập nhật lên, nâng cấp lên); "in/on" a UI surface = "trên" (trên menu, trên Web). "người dùng" is a noun, not a stand-in for "bạn" in instructions.
- Keep standard acronyms (HTML, DLL, USB) and trademarked product/feature names; never invent Vietnamese acronyms. Spell out on first use in docs: Vietnamese term (English term, ACRONYM).
- Inclusive: gender-neutral (nhân viên, các bạn, họ; never "anh ấy/cô ấy" for unknown people), person-first for disability, no stereotypes or disputed places, spell out và/cộng/khoảng instead of & + ~, input-agnostic verbs (Chọn). Prefer widely understood words over regional ones.

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
- Lưu hình ảnh thất bại. → Không lưu được hình ảnh.
- Chọn Tất Cả → Chọn tất cả
- Hãy bắt đầu sử dụng phiên bản đầy đủ ngay → Dùng ngay phiên bản đầy đủ
- Ứng dụng đã được cập nhật bởi hệ thống → Ứng dụng đã cập nhật.
- Chọn mạng A, B, và C → Chọn mạng A, B và C

Scope, limits and sources: references/sources.md. Full distilled Microsoft rules (voice, grammar, error phrases, punctuation, placeholders, inclusive language, keyboard, AI-prompt localization): references/microsoft-vi-style.md. Load it only for UI/error/notification copy, i18n review or when asked.
