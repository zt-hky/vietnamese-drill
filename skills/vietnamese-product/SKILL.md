---
name: vietnamese-product
description: "Write, translate or review Vietnamese (tiếng Việt) software UI text: buttons, labels, errors, toasts, notifications, onboarding, i18n files (vi.json, vi-VN), UX writing and product docs. Use only for Vietnamese UI/product copy, not for chat replies. Pulls a company-sourced UI glossary on demand and delegates one batch to a reviewer subagent."
---
# Contract
Write for the audience, not English word order. Preserve facts, uncertainty, negation, amounts, links and behavior. The project's own glossary/style wins over everything below; flag conflicts, never silently rename a concept.

## Workflow (cost-aware: nothing below is loaded until it is needed)
1. **Collect items**: `[{id, src, tgt?, ctx}]` where `ctx` = key, screen, user action, max length. Detect the project glossary first (search the repo for `glossary*`, `terminology*`, `locales/vi*`); if none exists, use the bundled one and state assumptions (address term, tệp vs tập tin, Delete wording).
2. **Delegate one batch** when there are 3 or more strings, or any ambiguity, and your harness can spawn a subagent: Claude Code → agent `vietnamese-reviewer` (or a general-purpose subagent); OMP → task agent `vietnamese-reviewer`; Codex → custom agent `vietnamese_reviewer` or a default subagent. Prompt:
   `Mode: translate|review|rewrite. Surface: <…>. Audience: <…>. SKILL_DIR=<absolute path of this skill folder>. Project glossary: <path|none>. Read $SKILL_DIR/references/reviewer.md and follow it. Items: <JSON>`
   The subagent retrieves only the matching glossary lines and returns changed rows; the glossary never enters your context. **Never write Vietnamese UI strings from memory.** No subagent, or 1–2 strings: first run `node $SKILL_DIR/scripts/check.mjs lookup < items.json` (about 100 tokens) and follow `references/reviewer.md` inline.
3. **Apply and verify**: apply accepted rows, then run `node $SKILL_DIR/scripts/check.mjs` (or the `vi_check` tool) with `{"text","sourceText","mode"}`; add `--glossary project.tsv` for a project glossary. Exit 0 clean or warnings, 1 contract errors, 2 invalid request. Run the project's i18n compiler for ICU, and check the rendered UI when UI changed.
4. Never send secrets or customer data to a remote model; redact first. No numeric fluency score, no repeated debate loops; unresolved meaning goes back to the user with the source context.

## Terms and surfaces
- Developer docs/chat: keep commit, branch, merge, deploy, production, staging, API, endpoint, payload, cache, hook, skill, plugin, pull request when natural. Never commit→cam kết or production→sản xuất in software context.
- End-user UI: familiar Vietnamese (Lưu, Xóa, Đăng nhập, Tải xuống); no developer jargon. One concept, one term per surface; the glossary decides.
- Spec/RFC: impersonal, name the actor. Tutorial: "bạn" sparingly. UI: omit the pronoun when clear, otherwise "bạn"; "quý khách" only if the brand uses it. Chat replies follow vietnamese-replies.
- Buttons: verb first, sentence case, about 25 characters at most; reuse the verb of the confirming question (Mua / Không). Errors: what failed, then the next step; never blame the user, never invent a cause or a retry. Distinguish loading, empty, success, failure. Notifications: event or result plus the relevant next action, no marketing.
- Content: concrete benefit, no invented superlatives; drop empty tiến hành/thực hiện, một cách, thông qua việc only when redundant.

## UI voice and grammar (details: references/microsoft-vi-style.md)
- Warm, crisp, helpful. Rewrite for intent, not word for word; split sentences; fragments are fine ("Dùng ngay phiên bản đầy đủ", "Nếu còn sự cố"). Short modern words: hủy, nhập, ẩn, tìm hiểu, Xin chờ.
- Sentence case ("Chọn tất cả", not "Chọn Tất Cả"). No "việc" before a gerund. đã/đang/sẽ optional. "Hãy" for direct commands, "Vui lòng" polite, never doubled.
- Errors: declarative, ends with a period, "lỗi" for error; could not/failed to → "Không … được", not "… thất bại"; "Không tìm thấy …", "Không đủ …".
- Punctuation: no space before . , ! ? ; : ) ; no comma before và/hoặc; decimal comma, thousands period, no space before %; use Intl, not hand formatting.
- "to" with progress = "lên" (cập nhật lên); "on/in" a UI surface = "trên" (trên menu). "người dùng" is a noun, not a stand-in for "bạn".
- Keep standard acronyms and trademarked names; never invent Vietnamese acronyms. Spell out on first use in docs.
- Inclusive: gender-neutral (nhân viên, các bạn, họ), person-first for disability, no stereotypes; spell out và/cộng/khoảng instead of & + ~; input-agnostic verbs (Chọn).

## i18n invariants
- Do not translate identifiers, flags, code, paths, URLs, resource keys, placeholders, HTML/Markdown syntax, enums, machine-readable logs. Translate user-visible strings/comments within scope only.
- Preserve interpolation names, types, escaping, rich-text tags; JSON keys and placeholder contracts must match the source. Never concatenate sentence fragments; use the project's i18n library.
- Vietnamese CLDR cardinal category is `other`; exact selectors (=0, =1) are valid; do not delete branches or rewrite complex ICU with regex; validate with the project's compiler.
- UTF-8/NFC. One tone-mark style per product (hòa/hoà): the checker flags mixes. No forced ASCII in commit prose unless repo policy says so.
- Use Intl.DateTimeFormat/NumberFormat('vi-VN') or the project's locale layer; dates are day/month/year; 12-hour speech needs a day-part ("9 giờ tối"); metric units; family name first; do not hardcode a "district" address field (2025 administrative changes).
- Test layout with real Vietnamese strings, diacritics and wrapping; no fixed expansion ratio. Accent-insensitive search is a product decision.

## Examples
- Lưu hình ảnh thất bại. → Không lưu được hình ảnh.
- Chọn Tất Cả → Chọn tất cả
- Học thêm → Tìm hiểu thêm (Learn more) · Thiết đặt → Cài đặt · Kích hoạt thông báo → Bật thông báo
- Hãy bắt đầu sử dụng phiên bản đầy đủ ngay → Dùng ngay phiên bản đầy đủ
- Đã xảy ra lỗi → Không lưu được cài đặt. Thử lại. (only if retry is a real action)
- Chọn mạng A, B, và C → Chọn mạng A, B và C
- cam kết các thay đổi → commit các thay đổi · triển khai đến sản xuất → deploy lên production

References, loaded only when needed: `reviewer.md` (subagent playbook), `microsoft-vi-style.md` (error/notification/UI rules), `locale-and-glossary.md` (pronouns, dates, regions, glossary setup), `sources.md` (provenance, limits). Data: `assets/glossary.vi-ui.tsv` (never read it whole; use `lookup`), `assets/project-glossary.template.tsv`.
